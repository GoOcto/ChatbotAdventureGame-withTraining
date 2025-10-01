#!/bin/bash

#    --dataset_path "./training_data/canon/anya*" \

accelerate launch train_lora.py \
    --model_name "MistralAI/mistral-7b-instruct-v0.2" \
    --dataset_path "training_data/_cast/*.jsonl" \
    --output_dir "weights/mistral_cast" \
    --epochs 5 \
    --learning_rate 2e-4 \
    --lr_scheduler_type "cosine" \
    --lora_rank 8 \
    --batch_size 1
