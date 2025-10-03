import os

# Suppress specific warnings from Transformers library
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "true"

import json
import logging
import threading

from dotenv import load_dotenv
from huggingface_hub import login as hflogin
from peft import PeftModel


class Colors:
    BLUE_BOLD = "\033[1;34m"
    GREEN_BOLD = "\033[1;32m"
    BLUE = "\033[0;34m"
    GREEN = "\033[0;32m"
    RESET = "\033[0m"


logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
messages_lock = threading.Lock()

# Log in to hugging face (you need to have specific access for whichever model you use)
load_dotenv()
hflogin(os.getenv("HUGGINGFACE_KEY"))


def to_json_safe(obj):
    """Recursively convert common ML/python objects into JSON-serializable types."""
    # Fast path for primitives
    if obj is None or isinstance(obj, (bool, int, float, str)):
        return obj
    # Avoid circular imports; torch/numpy may not always be present
    torch = None
    np = None
    try:
        import torch as _torch  # type: ignore
        torch = _torch
    except Exception:
        pass
    try:
        import numpy as _np  # type: ignore
        np = _np
    except Exception:
        pass

    # Numpy scalars/arrays
    if np is not None:
        if isinstance(obj, np.generic):
            return obj.item()
        if isinstance(obj, np.ndarray):
            return obj.tolist()

    # Torch tensors/devices/dtypes
    if torch is not None:
        if isinstance(obj, getattr(torch, "Tensor", ())):
            return {"tensor_shape": list(obj.shape), "dtype": str(obj.dtype)}
        if isinstance(obj, getattr(torch, "device", ())):
            return str(obj)
        if isinstance(obj, getattr(torch, "dtype", ())):
            return str(obj)

    # Enums
    try:
        import enum

        if isinstance(obj, enum.Enum):
            return str(obj)
    except Exception:
        pass

    # Dicts
    if isinstance(obj, dict):
        return {str(k): to_json_safe(v) for k, v in obj.items()}
    # Iterables
    if isinstance(obj, (list, tuple, set)):
        return [to_json_safe(v) for v in obj]

    # Fallback: string representation
    try:
        return str(obj)
    except Exception:
        return "<unserializable>"


def initialize_model_and_tokenizer(model_id, adapter_path=None):
    """
    Initializes a model and tokenizer, optionally applying a LoRA adapter.

    Args:
        model_id (str): The Hugging Face ID of the base model.
        adapter_path (str, optional): Path to the trained LoRA adapter. Defaults to None.

    Returns:
        tuple: (tokenizer, model) ready for generate() with chat templates.
    """
    import torch
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        BitsAndBytesConfig,
    )

    logging.info(f"Loading base model: {model_id}. This may take a while...")
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token_id = tokenizer.eos_token_id

    # Create BitsAndBytesConfig for 4-bit quantization
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    # Load base model GPU
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quantization_config,
        device_map="auto",
        trust_remote_code=True,
    )

    # Conditionally load the LoRA adapter
    if adapter_path:
        logging.info(f"Loading LoRA adapter from: {adapter_path}")
        model = PeftModel.from_pretrained(model, adapter_path)
        # Introspect adapter info for debugging
        try:
            active = getattr(model, "active_adapter", None) or getattr(model, "active_adapters", None)
            peft_cfg_keys = list(getattr(model, "peft_config", {}).keys())
            logging.info(f"Active adapter: {active}")
            logging.info(f"Available PEFT configs: {peft_cfg_keys}")
        except Exception as e:
            logging.info(f"Could not introspect PEFT model: {e}")
    else:
        logging.info("No LoRA adapter path provided. Using base model only.")

    # Enable cache for faster generation if supported
    try:
        model.config.use_cache = True
    except Exception:
        pass

    return tokenizer, model


def generate_chat_reply(model, tokenizer, messages, *, max_new_tokens=256, do_sample=True, temperature=0.7, top_p=0.9, seed=None):
    """Generate a chat reply using Llama-3 style chat template."""
    import torch

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    gen_kwargs = {
        "max_new_tokens": max_new_tokens,
        "do_sample": do_sample,
        "temperature": temperature,
        "top_p": top_p,
        "pad_token_id": tokenizer.eos_token_id,
        "eos_token_id": tokenizer.eos_token_id,
    }
    if seed is not None:
        # Deterministic sampling given seed via global RNGs
        try:
            import random
            import numpy as np
            s = int(seed)
            torch.manual_seed(s)
            if torch.cuda.is_available():
                torch.cuda.manual_seed_all(s)
            random.seed(s)
            np.random.seed(s)
        except Exception:
            pass

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            **gen_kwargs,
        )
    # Slice off the prompt portion
    gen_ids = outputs[0][inputs["input_ids"].shape[-1] :]
    text = tokenizer.decode(gen_ids, skip_special_tokens=True)
    return text.strip()


def new_conversation(tokenizer, system_prompt):
    messages = []
    messages.append({"role": "system", "content": system_prompt})
    logging.info(
        f"Starting new conversation with system prompt: {Colors.GREEN}{system_prompt}{Colors.RESET }"
    )
    return messages


def api_mode(adapter_path):
    """Run the chatbot as a Flask API server."""
    import os

    from flask import (
        Flask,
        jsonify,
        make_response,
        request,
        send_from_directory,
    )

    def set_cors_headers(resp, methods):
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = methods
        return resp

    model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
    # model_id = "MistralAI/mistral-7b-instruct-v0.2"

    if adapter_path:
        logging.info(
            f"We will load the LoRA adapter from '{adapter_path}' onto {model_id} base model"
        )
    else:
        logging.info(
            f"No adapter specified -- loading {model_id} base model only"
        )

    tokenizer, model = initialize_model_and_tokenizer(
        model_id, adapter_path=adapter_path
    )
    import uuid

    # Store conversations by id
    conversations = {}

    # Serve static files from the game directory
    app = Flask(
        __name__, static_folder=os.path.abspath("game"), static_url_path=""
    )

    # Catch-all static file route (serves any file from webroot as /)
    @app.route("/")
    def serve_index():
        return send_from_directory(app.static_folder, "index.html")

    # @app.route("/game")
    # def serve_game():
    #     return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:filename>")
    def serve_static(filename):
        # If requesting index.html or root, serve index.html
        if filename == "" or filename == "index.html":
            return send_from_directory(app.static_folder, "index.html")
        # Otherwise, serve the requested file from webroot
        return send_from_directory(app.static_folder, filename)

    # Helper to introspect PEFT/LoRA state
    def peft_debug_info(model):
        info = {
            "model_class": type(model).__name__,
        }
        try:
            info["is_peft"] = hasattr(model, "peft_config")
            if hasattr(model, "peft_config"):
                adapters = list(getattr(model, "peft_config", {}).keys())
                info["adapters"] = adapters
                active = getattr(model, "active_adapter", None) or getattr(model, "active_adapters", None)
                info["active_adapter"] = active
                pcfgs = {}
                for name, cfg in getattr(model, "peft_config", {}).items():
                    try:
                        pcfgs[name] = {
                            "r": getattr(cfg, "r", None),
                            "lora_alpha": getattr(cfg, "lora_alpha", None),
                            "lora_dropout": float(getattr(cfg, "lora_dropout", 0.0)) if getattr(cfg, "lora_dropout", None) is not None else None,
                            "target_modules": getattr(cfg, "target_modules", None),
                            "task_type": str(getattr(cfg, "task_type", None)),
                        }
                    except Exception:
                        pass
                info["peft_config"] = pcfgs

            # Count trainable and preview LoRA parameter names
            try:
                trainable = sum(p.numel() for p in model.parameters() if getattr(p, "requires_grad", False))
                info["trainable_params"] = int(trainable)
            except Exception:
                pass
            try:
                lora_params = [n for (n, p) in model.named_parameters() if "lora_" in n]
                info["lora_params_count"] = len(lora_params)
                info["lora_params_preview"] = lora_params[:10]
            except Exception:
                pass
            try:
                info["device"] = str(next(model.parameters()).device)
            except Exception:
                pass
        except Exception as e:
            info["debug_error"] = str(e)
        return info

    # Chat endpoint
    @app.route("/api/chat/<chat_id>", methods=["POST", "OPTIONS"])
    def chat(chat_id):
        if request.method == "OPTIONS":
            resp = make_response()
            return set_cors_headers(resp, "POST, OPTIONS")
        if not request.is_json:
            resp = make_response(
                jsonify({"error": "Content-Type must be application/json"}), 415
            )
            return set_cors_headers(resp, "POST, OPTIONS")
        data = request.get_json()
        user_prompt = data.get("prompt")
        if not user_prompt or not isinstance(user_prompt, str):
            resp = make_response(
                jsonify(
                    {
                        "error": 'JSON body must contain a "prompt" key with a string value.'
                    }
                ),
                400,
            )
            return set_cors_headers(resp, "POST, OPTIONS")
        with messages_lock:
            if chat_id not in conversations:
                resp = make_response(
                    jsonify({"error": "Invalid chat id."}), 404
                )
                return set_cors_headers(resp, "POST, OPTIONS")
            logging.info(f"User prompt: {user_prompt} (chat_id={chat_id})")
            messages = conversations[chat_id]
            messages.append({"role": "user", "content": user_prompt})
            try:
                # Allow caller to override generation params
                gen_params = {
                    "max_new_tokens": int(data.get("max_new_tokens", 256)),
                    "do_sample": bool(data.get("do_sample", True)),
                    "temperature": float(data.get("temperature", 0.7)),
                    "top_p": float(data.get("top_p", 0.9)),
                    "seed": data.get("seed"),
                }
                assistant_reply = generate_chat_reply(
                    model,
                    tokenizer,
                    messages,
                    **gen_params,
                )
                messages.append(
                    {"role": "assistant", "content": assistant_reply}
                )

                # Persist conversation entries to disk as JSON (one JSON object)
                os.makedirs(".log", exist_ok=True)
                with open(f".log/{chat_id[:8]}.json", "w") as f:
                    f.write(json.dumps({"messages": messages}))

                resp = make_response(jsonify({"reply": assistant_reply}))
                return set_cors_headers(resp, "POST, OPTIONS")
            except Exception as e:
                logging.info(str(e))
                resp = make_response(jsonify({"error": str(e)}), 500)
                return set_cors_headers(resp, "POST, OPTIONS")

    @app.route("/api/reset", methods=["POST", "OPTIONS"])
    def reset():
        if request.method == "OPTIONS":
            resp = make_response()
            return set_cors_headers(resp, "POST, OPTIONS")
        data = request.get_json()
        system_prompt = data.get("system_prompt")

        chat_id = str(uuid.uuid4())
        with messages_lock:
            conversations[chat_id] = new_conversation(tokenizer, system_prompt)
        resp = make_response(
            jsonify({"status": "reset", "chat_id": chat_id}), 200
        )
        return set_cors_headers(resp, "POST, OPTIONS")

    # API info route
    @app.route("/api/info", methods=["GET", "OPTIONS"])
    def api_info():
        """Return API usage information."""
        if request.method == "OPTIONS":
            resp = make_response()
            return set_cors_headers(resp, "GET, OPTIONS")
        resp = make_response(
            jsonify(
                {
                    "endpoints": [
                        {
                            "path": "/api/info",
                            "methods": ["GET", "OPTIONS"],
                            "description": "Get API usage information.",
                        },
                        {
                            "path": "/api/reset",
                            "methods": ["POST", "OPTIONS"],
                            "description": "Reset the conversation and get a chat id.",
                        },
                        {
                            "path": "/api/chat/<chat_id>",
                            "methods": ["POST", "OPTIONS"],
                            "description": "Send a prompt and get a reply for a specific chat id. JSON: { 'prompt': <string> }",
                        },
                    ],
                    "prompt_format": {"prompt": "<string>"},
                }
            )
        )
        return set_cors_headers(resp, "GET, OPTIONS")

    # Debug route
    @app.route("/api/debug", methods=["GET", "OPTIONS"])
    def api_debug():
        if request.method == "OPTIONS":
            resp = make_response()
            return set_cors_headers(resp, "GET, OPTIONS")
        info = peft_debug_info(model)
        info.update({
            "base_model_id": model_id,
            "adapter_path": adapter_path,
        })
        safe = to_json_safe(info)
        resp = make_response(jsonify(safe), 200)
        return set_cors_headers(resp, "GET, OPTIONS")

    app.run(host="0.0.0.0", port=5000, debug=False)


try:
    import readline
except ImportError:
    pass  # readline is built-in on Linux/macOS, optional on Windows

if __name__ == "__main__":
    # use the first cmdline parameter as adapter path, if provided
    import sys

    # eg param: "weights/lora_r32" will loads the trained weights from that folder
    default_adapter_path = "weights/best__"
    if not os.path.exists(default_adapter_path):
        default_adapter_path = None
    arg = sys.argv[1] if len(sys.argv) > 1 else default_adapter_path
    api_mode(arg)
