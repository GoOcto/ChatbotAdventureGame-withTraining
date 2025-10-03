#!/bin/bash

# try to target ~500 steps
# here we have 206 training samples
# with batch size 1 and 3 epochs, that's 618 steps

# to count all the lines in all the files in the blob:
# wc -l *.jsonl

# based on run_02 which actually seems to get the trades right (enough to work)

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --epochs 3 \
    --learning_rate 2e-5 \
    --lr_scheduler_type "cosine" \
    --batch_size 1 \
    --lora_rank 16 \
    --val_ratio 0.1 \
    --output_dir "../../weights/run_07"
