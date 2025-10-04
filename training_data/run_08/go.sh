#!/bin/bash

# try to target ~500 steps
# here we have 193 training samples
# with batch size 1, grad accum 1, and 3 epochs, that's 579 steps

# to count all the lines in all the files in the blob:
# wc -l *.jsonl

# based on run_02 which actually seems to get the trades right (enough to work)

# accelerate launch ../../train_lora.py \
#     --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
#     --dataset_path "*.jsonl" \
#     --max_seq_len 512 \
#     --batch_size 1 --grad_accum 1 \
#     --lr_scheduler_type cosine --warmup_ratio 0.05 --learning_rate 2e-5 \
#     --epochs 3 \
#     --lora_rank 16 --lora_dropout 0.1 --lora_alpha_scale 2.0 \
#     --label_smoothing 0.05 --weight_decay 0.0 \
#     --val_ratio 0.1 --eval_strategy steps --eval_steps 50 --early_stopping --early_stopping_patience 5 --save_total_limit 5 \
#     --output_dir "../../weights/run_08a"

# accelerate launch ../../train_lora.py \
#     --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
#     --dataset_path "*.jsonl" \
#     --max_seq_len 512 \
#     --batch_size 1 --grad_accum 1 \
#     --lr_scheduler_type cosine --warmup_ratio 0.05 --learning_rate 2e-5 \
#     --epochs 3 \
#     --lora_rank 16 --lora_dropout 0.1 --lora_alpha_scale 2.0 \
#     --label_smoothing 0.05 --weight_decay 0.0 \
#     --val_ratio 0.1 --eval_strategy steps --eval_steps 50 --save_total_limit 5 \
#     --output_dir "../../weights/run_08b"

accelerate launch ../../train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "*.jsonl" \
    --max_seq_len 512 \
    --batch_size 1 --grad_accum 1 \
    --lr_scheduler_type cosine --warmup_ratio 0.05 --learning_rate 2e-5 \
    --epochs 3 \
    --lora_rank 16 --lora_dropout 0.1 --lora_alpha_scale 2.0 \
    --weight_decay 0.0 \
    --val_ratio 0.1 --eval_strategy steps --eval_steps 50 --save_total_limit 5 \
    --output_dir "../../weights/run_08c"
