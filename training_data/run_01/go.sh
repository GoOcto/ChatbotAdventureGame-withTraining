#!/bin/bash

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --epochs 8 \
    --learning_rate 1e-5 \
    --lr_scheduler_type "cosine" \
    --batch_size 1 \
    --lora_rank 8 \
    --output_dir "../../weights/run_01"
