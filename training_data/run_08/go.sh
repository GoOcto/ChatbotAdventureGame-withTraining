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
    --learning_rate 1e-4 \
    --lr_scheduler_type cosine --warmup_ratio 0.05 \
    --batch_size 2 --grad_accum 8 \
    --max_seq_len 1024 --packing --gradient_checkpointing \
    --lora_rank 16 --lora_dropout 0.1 --lora_alpha_scale 2.0 \
    --label_smoothing 0.05 --weight_decay 0.0 \
    --val_ratio 0.1 --eval_strategy steps --eval_steps 200 --early_stopping --early_stopping_patience 5 --save_total_limit 5 \
    --output_dir "../../weights/run_08"
