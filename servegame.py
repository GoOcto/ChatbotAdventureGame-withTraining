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


def initialize_model_and_tokenizer(model_id, adapter_path=None):
    """
    Initializes a model and tokenizer, optionally applying a LoRA adapter.

    Args:
        model_id (str): The Hugging Face ID of the base model.
        adapter_path (str, optional): Path to the trained LoRA adapter. Defaults to None.

    Returns:
        tuple: A tuple containing the tokenizer and the text generation pipeline.
    """
    import torch
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        BitsAndBytesConfig,
        pipeline,
    )

    logging.info(f"Loading base model: {model_id}. This may take a while...")
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    tokenizer.pad_token_id = tokenizer.eos_token_id

    # Create BitsAndBytesConfig for 4-bit quantization
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    # Load base model
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quantization_config,
        device_map="auto",  # Changed from "cuda" to "auto" for better flexibility
    )

    # NEW: Conditionally load the LoRA adapter
    if adapter_path:
        logging.info(f"Loading LoRA adapter from: {adapter_path}")
        model = PeftModel.from_pretrained(model, adapter_path)
    else:
        logging.info("No LoRA adapter path provided. Using base model only.")

    # Create a text generation pipeline
    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=256,
    )

    return tokenizer, pipe


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

    if adapter_path:
        logging.info(
            f"Loading adapter from '{adapter_path}' onto meta-llama base model"
        )
    else:
        logging.info(
            "No adapter specified -- loading meta-llama base model only"
        )

    tokenizer, pipe = initialize_model_and_tokenizer(
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
                outputs = pipe(
                    messages,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                )
                assistant_reply = outputs[0]["generated_text"][-1]["content"]
                messages.append(
                    {"role": "assistant", "content": assistant_reply}
                )

                # Persist conversation entries to disk as JSON (one JSON object)
                os.makedirs(".log", exist_ok=True)
                with open(f".log/{chat_id[:8]}.json", "w") as f:
                    f.write(
                        json.dumps({"messages": outputs[0]["generated_text"]})
                    )

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

    app.run(host="0.0.0.0", port=5000, debug=False)


try:
    import readline
except ImportError:
    pass  # readline is built-in on Linux/macOS, optional on Windows

if __name__ == "__main__":
    # use the first cmdline parameter as adapter path, if provided
    import sys

    # eg param: "weights/lora_r32" will loads the trained weights from that folder
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    api_mode(arg)
