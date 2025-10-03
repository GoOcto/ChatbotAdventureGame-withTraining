#!/bin/bash

# try to target ~50 steps
# here we have 42 training samples
# with batch size 1 and 12 epochs, that's 504 steps

# to count all the lines in all the files in the blob:
# wc -l *.jsonl

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --epochs 12 \
    --learning_rate 1e-5 \
    --lr_scheduler_type "cosine" \
    --batch_size 1 \
    --lora_rank 8 \
    --val_ratio 0.1 \
    --output_dir "../../weights/run_03"
