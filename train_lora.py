import argparse
import glob
import os
import json

import torch
from datasets import load_dataset
from dotenv import load_dotenv
from huggingface_hub import login as hflogin
from peft import LoraConfig, get_peft_model
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    set_seed,
)
from trl import SFTTrainer
from torch.utils.tensorboard import SummaryWriter

load_dotenv()
hflogin(os.getenv("HUGGINGFACE_KEY"))


def check_for_checkpoints(output_dir):
    """Check if there are existing checkpoints in the output directory."""
    if not os.path.exists(output_dir):
        return None

    checkpoint_pattern = os.path.join(output_dir, "checkpoint-*")
    checkpoints = glob.glob(checkpoint_pattern)

    if not checkpoints:
        return None

    # Sort checkpoints by step number to get the latest one
    checkpoints.sort(key=lambda x: int(x.split("-")[-1]))
    latest_checkpoint = checkpoints[-1]

    return latest_checkpoint


def prompt_user_for_resume(checkpoint_path):
    """Prompt the user whether to resume from the existing checkpoint."""
    print(f"\nFound existing checkpoint: {checkpoint_path}")
    print("Options:")
    print("1. Resume training from this checkpoint")
    print("2. Start fresh training (will overwrite existing checkpoints)")
    print("3. Cancel training")

    while True:
        choice = input("Enter your choice (1/2/3): ").strip()
        if choice == "1":
            return True
        elif choice == "2":
            return False
        elif choice == "3":
            print("Training cancelled.")
            exit(0)
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")


def format_prompt(sample):
    """
    This function takes a sample from the dataset and formats it into the Llama 3 instruct prompt format.
    The dataset is expected to be a JSONL file with a "messages" key,
    containing a list of conversations with "role" and "content".
    """
    formatted_messages = []
    for message in sample["messages"]:
        # The tokenizer will add the BOS token and the role-specific terminators.
        # We just need to provide the content in the right order.
        formatted_messages.append(
            {"role": message["role"], "content": message["content"]}
        )
    return formatted_messages


def main(args):
    # Set global seed for reproducibility across dataloading, torch, numpy, etc.
    if args.seed is not None:
        set_seed(args.seed)

    # --- Check for existing checkpoints ---
    latest_checkpoint = check_for_checkpoints(args.output_dir)
    resume_from_checkpoint = None

    if latest_checkpoint:
        if args.auto_resume:
            print(f"Auto-resuming from checkpoint: {latest_checkpoint}")
            resume_from_checkpoint = latest_checkpoint
        else:
            should_resume = prompt_user_for_resume(latest_checkpoint)
            if should_resume:
                resume_from_checkpoint = latest_checkpoint
            else:
                print(
                    "Starting fresh training. Existing checkpoints will be overwritten."
                )

    # --- 1. Load the Dataset ---
    print("--- Loading Dataset ---")

    # Accept wildcards from the command line
    data_files = glob.glob(args.dataset_path)
    dataset = load_dataset("json", data_files=data_files, split="train")

    # data_files = os.path.join(args.dataset_path, "**", "*.json")
    # dataset = load_dataset("json", data_files=data_files, split="train")
    print(f"Dataset loaded with {len(dataset)} examples.")

    # --- 2. Configure Quantization (for memory efficiency) ---
    # Load the model in 4-bit to save memory
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )
    print("BitsAndBytesConfig configured for 4-bit quantization.")

    # --- 3. Load Base Model ---
    print(f"--- Loading Base Model: {args.model_name} ---")
    model = AutoModelForCausalLM.from_pretrained(
        args.model_name,
        quantization_config=bnb_config,
        device_map="auto",  # Automatically map model layers to available devices (GPU/CPU)
        trust_remote_code=True,
    )
    model.config.use_cache = False
    model.config.pretraining_tp = 1
    print("Base model loaded successfully.")

    # --- 4. Load Tokenizer ---
    tokenizer = AutoTokenizer.from_pretrained(
        args.model_name, trust_remote_code=True
    )
    # Llama 3 doesn't have a pad token by default, so we set it to the EOS token.
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    print("Tokenizer loaded and configured.")

    # --- 5. Configure LoRA ---
    # These settings are standard for QLoRA fine-tuning
    peft_config = LoraConfig(
        lora_alpha=args.lora_rank * 2,
        lora_dropout=0.1,
        r=args.lora_rank,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
    )
    print("LoRA config created.")

    # --- 6. Configure Training Arguments ---
    # Derive a readable run name (e.g., "rank08") from the output directory for clearer TensorBoard charts
    run_name = os.path.basename(args.output_dir.rstrip("/")) or args.output_dir

    training_arguments = TrainingArguments(
        output_dir=args.output_dir,
        run_name=run_name,
        logging_dir=os.path.join(args.output_dir, "tb"),
        seed=args.seed,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=1,
        optim="paged_adamw_32bit",
        learning_rate=args.learning_rate,
        weight_decay=0.001,
        fp16=False,
        bf16=True,  # Use bfloat16 for better performance on modern GPUs
        max_grad_norm=0.3,
        max_steps=-1,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type=args.lr_scheduler_type,
        logging_steps=5,
        save_steps=20,
        save_total_limit=None,  # Disable limit to keep all checkpoints
        report_to="tensorboard",
    )
    print("Training arguments configured.")

    # --- 7. Initialize Trainer ---
    # SFTTrainer is designed for Supervised Fine-Tuning
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        max_seq_length=512,  # Maximum sequence length for the model
        tokenizer=tokenizer,
        args=training_arguments,
        packing=False,  # Packing can speed up training, but we'll disable for simplicity
    )
    print("SFTTrainer initialized.")

    # --- 8. Start Training ---
    print("\n--- Starting LoRA Training ---")
    if resume_from_checkpoint:
        print(f"Resuming from checkpoint: {resume_from_checkpoint}")
        train_output = trainer.train(resume_from_checkpoint=resume_from_checkpoint)
    else:
        train_output = trainer.train()
    print("--- Training Finished ---")

    # --- 9. Save the Trained LoRA Adapter ---
    trainer.save_model(args.output_dir)
    print(f"LoRA adapter saved to {args.output_dir}")

    # --- 10. Log hyperparameters and final metrics to TensorBoard HParams ---
    try:
        hparams = {
            "model_name": args.model_name,
            "dataset_path": args.dataset_path,
            "epochs": args.epochs,
            "learning_rate": args.learning_rate,
            "lr_scheduler_type": args.lr_scheduler_type,
            "batch_size": args.batch_size,
            "lora_rank": args.lora_rank,
            "lora_alpha": args.lora_rank * 2,
            "seed": args.seed,
        }
        metrics = getattr(train_output, "metrics", {}) or {}
        # Pick a couple of representative metrics if available
        metric_dict = {
            "train/loss_final": float(metrics.get("train_loss", float("nan"))),
            "train/steps": float(metrics.get("train_steps", trainer.state.global_step or 0)),
        }

        # Ensure logging directory exists
        os.makedirs(training_arguments.logging_dir, exist_ok=True)
        writer = SummaryWriter(log_dir=training_arguments.logging_dir)
        # Write raw params as text for easy inspection
        writer.add_text("hparams/json", json.dumps(hparams, indent=2))
        # HParams summary (requires at least one metric)
        writer.add_hparams(hparams, metric_dict)
        writer.close()
        print(f"HParams logged to TensorBoard at {training_arguments.logging_dir}")
    except Exception as e:
        print(f"Warning: failed to log hparams to TensorBoard: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train a LoRA model for the chatbot."
    )
    parser.add_argument(
        "--model_name",
        type=str,
        required=True,
        help="Hugging Face model name (e.g., 'meta-llama/Meta-Llama-3-8B-Instruct')",
    )
    parser.add_argument(
        "--dataset_path",
        type=str,
        required=True,
        help="Path to the training.jsonl file.",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        required=True,
        help="Directory to save the trained LoRA adapter.",
    )
    parser.add_argument(
        "--epochs", type=int, default=3, help="Number of training epochs."
    )
    parser.add_argument(
        "--learning_rate",
        type=float,
        default=2e-4,
        help="Learning rate for the optimizer.",
    )
    parser.add_argument(
        "--batch_size", type=int, default=2, help="Training batch size."
    )
    parser.add_argument(
        "--lora_rank", type=int, default=16, help="LoRA rank (r)."
    )
    parser.add_argument(
        "--lr_scheduler_type",
        type=str,
        default="constant",
        help="Learning rate scheduler type (e.g., 'constant', 'cosine').",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility.",
    )
    parser.add_argument(
        "--auto_resume",
        action="store_true",
        help="Automatically resume from the latest checkpoint without prompting.",
    )

    args = parser.parse_args()
    main(args)
