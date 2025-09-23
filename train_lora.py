import argparse
import os

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
)
from trl import SFTTrainer

load_dotenv()
hflogin(os.getenv("HUGGINGFACE_KEY"))


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
    # --- 1. Load the Dataset ---
    print("--- Loading Dataset ---")

    import glob

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
    training_arguments = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=2,
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
        logging_steps=25,
        save_steps=50,
        save_total_limit=2,
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
    trainer.train()
    print("--- Training Finished ---")

    # --- 9. Save the Trained LoRA Adapter ---
    trainer.save_model(args.output_dir)
    print(f"LoRA adapter saved to {args.output_dir}")


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

    args = parser.parse_args()
    main(args)
