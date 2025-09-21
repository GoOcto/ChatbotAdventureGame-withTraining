#!/bin/bash

accelerate launch train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "./training/canon" \
    --output_dir "./lora_canon_r32" \
    --epochs 10 \
    --learning_rate 5e-5 \
    --lr_scheduler_type "cosine" \
    --lora_rank 32 \
    --batch_size 1