#!/bin/bash

accelerate launch train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "./training_data/canon" \
    --output_dir "./weights/canon_r32" \
    --epochs 6 \
    --learning_rate 5e-5 \
    --lr_scheduler_type "cosine" \
    --lora_rank 32 \
    --batch_size 1
