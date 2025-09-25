#!/bin/bash

#    --dataset_path "./training_data/canon/anya*" \

accelerate launch train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "training_data/batches/*.jsonl" \
    --output_dir "weights/batches_3" \
    --epochs 5 \
    --learning_rate 2e-4 \
    --lr_scheduler_type "cosine" \
    --lora_rank 8 \
    --batch_size 1
