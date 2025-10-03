#!/bin/bash

# try to target ~500 steps
# here we have 223 training samples
# with batch size 1 and 3 epochs, that's 669 steps

# to count all the lines in all the files in the blob:
# wc -l *.jsonl

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --epochs 3 \
    --learning_rate 1e-5 \
    --lr_scheduler_type "cosine" \
    --batch_size 1 \
    --lora_rank 4 \
    --output_dir "../../weights/run_06/rank04"

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --epochs 3 \
    --learning_rate 1e-5 \
    --lr_scheduler_type "cosine" \
    --batch_size 1 \
    --lora_rank 16 \
    --output_dir "../../weights/run_06/rank16"
