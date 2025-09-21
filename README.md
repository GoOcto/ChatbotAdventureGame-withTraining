
# Post-Apocalyptic Adventure Game LoRA Training

A LoRA (Low-Rank Adaptation) fine-tuning project for creating specialized AI character agents in a post-apocalyptic adventure game world. This repository contains training data, scripts, and world definitions for fine-tuning language models to embody specific characters with consistent personalities, transaction protocols, and world knowledge.

## Project Overview

This project fine-tunes language models to play specific characters in a text-based post-apocalyptic adventure game. Each character has:

- **Unique personality and voice**: From paranoid tech-hermits to transactional information brokers
- **Specific goals and motivations**: Items they need, information they possess
- **Strict transaction protocol**: Machine-readable JSON format for item exchanges
- **World consistency**: Shared knowledge of factions, locations, and threats

## World Setting

**Environment**: Post-apocalyptic wasteland where resources are scarce and pre-plague technology is valuable.

**Key Factions**:

- **Oasis Settlement**: Led by Joric, a haven of stability
- **The Cog**: Techno-zealots led by the Techno-Prophet from The Cathedral

**Major Locations**:

- Oasis settlement (peaceful refuge)
- Barter-town (chaotic trading hub)
- The Cathedral (Cog headquarters)

**Core Threats**:

- Nanite Plague (technological disease affecting minds)
- Mutated fauna and environmental hazards
- Factional conflicts and resource scarcity

## Key Characters

- **Silas**: Paranoid tech-hermit suffering from nanite plague, needs stabilizers
- **Anya**: Stressed mechanic in Oasis, expert at diagnosing sabotage
- **Transport Boss**: Cynical information broker in Barter-town
- **Old Reliable**: Sentient vending machine AI that analyzes items
- **Lena**: Cog defector hiding in the wasteland
- **Wasteland Scrabbler**: Childlike observer with mechanical sounds

## Training Data Structure

### Canon Training Data (`/training/canon/`)

High-quality, manually corrected examples demonstrating:

- Proper transaction protocol adherence
- Consistent character personalities
- Accurate world lore and relationships
- Correct item interaction patterns

### Example Training Files (`/examples/`)

Original problematic examples showing common training issues:

- Transaction protocol violations
- Character voice inconsistencies
- Inventory logic errors
- Brevity protocol violations

### File Naming Convention

All training files follow a consistent naming pattern:

**Format**: `{character}.{topic}.{sequential_number}.json`

**Examples**:

- `anya.inverter.001.json` - Anya discussing micro-inverter transactions
- `silas.protocol.003.json` - Silas protocol adherence examples
- `transport_boss.photograph.001.json` - Transport Boss reacting to photographs
- `old_reliable.spanner.001.json` - Old Reliable analyzing spanner items

**Topic Categories**:

- `general` - Standard character interactions
- `photograph` - Reactions to faded photographs
- `protocol` - Transaction protocol examples
- `transaction` - Specific item exchange scenarios
- `correct` - Corrected versions of problematic examples
- `fix` - Protocol violation fixes
- Item-specific topics (e.g., `inverter`, `spanner`, `scanner`)

### Character Organization

- **Main Characters** (`/training/canon/`): Characters with extensive dialogue and story importance
- **NPCs** (`/training/canon.npc/`): Minor characters with limited interactions

### World Definition Files

- `link_2_world.js`: Character definitions, personalities, inventories
- `link_2_rules.js`: System protocols and behavioral constraints

## Transaction Protocol

All character responses must end with a JSON transaction block:

```json
<|>{"give": ["item_id"], "take": ["item_id"]}
```

**Key Rules**:

- JSON must ALWAYS be present, even when no transaction occurs
- `[OFFER: item_id]` means player presents item for consideration
- Characters can only accept items in their "wants" array
- Characters can only give items in their inventory
- Empty arrays are valid: `{"give": [], "take": []}`

## Quick Start

### Run Training (Easy)

```bash
./go.sh
```

### Run Training (Manual)

```bash
accelerate launch train_lora.py \
    --model_name "meta-llama/Meta-Llama-3-8B-Instruct" \
    --dataset_path "./training/canon" \
    --output_dir "./lora_canon_r32" \
    --epochs 10 \
    --learning_rate 5e-5 \
    --lr_scheduler_type "cosine" \
    --lora_rank 32 \
    --batch_size 1
```

This uses only the 'canon' training data and not the 'generic'. You can specify the parent directory and the script will pick up *all* json files in all subdirectories.

### Data Validation

```bash
python scripts/validate_dataset.py
```

### Generate Training Data

```bash
python make_jsons.py
```

## Training Parameters

- **Model**: Meta-Llama-3-8B-Instruct (base model)
- **LoRA Rank**: 32 (balance between quality and efficiency)
- **Learning Rate**: 5e-5 (conservative to avoid overfitting)
- **Batch Size**: 1 (memory-efficient)
- **Scheduler**: Cosine (smooth learning rate decay)
- **Epochs**: 10 (adjust based on convergence)

## File Structure

```text
├── training/
│   ├── canon/              # Main characters (245 files)
│   │   ├── anya.*.json           # Oasis mechanic examples
│   │   ├── silas.*.json          # Tech-hermit examples  
│   │   ├── lena.*.json           # Cog defector examples
│   │   ├── transport_boss.*.json # Information broker examples
│   │   ├── old_reliable.*.json   # Vending machine AI examples
│   │   ├── cog_enforcer.*.json   # Cog soldier examples
│   │   ├── elder_joric.*.json    # Settlement leader examples
│   │   ├── techno_prophet.*.json # Cult leader examples
│   │   ├── wasteland_*.json      # Wasteland creature examples
│   │   └── techno_prophet_guard_*.json # Guard examples
│   └── canon.npc/          # Minor NPCs (27 files)
│       ├── brother_felix.*.json
│       ├── dust_archaeologist_*.json
│       ├── street_preacher_*.json
│       └── ...
├── examples/               # Original problematic examples
├── scripts/               # Validation and utility scripts
├── lora_*/               # Training output directories
├── link_2_world.js       # Character definitions
├── link_2_rules.js       # System protocols
├── train_lora.py         # Main training script
├── make_jsons.py         # Data generation utility
└── go.sh                # Quick training script
```

## Common Training Issues Fixed

1. **Transaction Protocol Violations**: Ensuring JSON is always present
2. **Character Voice Inconsistencies**: Maintaining personality across examples
3. **Inventory Logic Errors**: Characters only give items they possess
4. **Brevity Violations**: Keeping responses under 30 words
5. **Goal Hinting Problems**: Indirectly expressing character needs
6. **Show vs Take Confusion**: Proper item interaction patterns

## Usage Notes

- The script picks up all JSON files in specified directories recursively
- Use `./training/canon` for highest quality training data
- Monitor convergence to avoid overfitting
- Test character consistency across different scenarios
- Validate transaction protocol adherence in outputs

## Requirements

- Python 3.8+
- PyTorch
- Transformers
- Accelerate
- PEFT (Parameter Efficient Fine-Tuning)
- CUDA-compatible GPU (recommended)

## Contributing

When adding new training examples:

1. Follow the transaction protocol exactly
2. Maintain character voice consistency
3. Keep responses under 30 words
4. Include proper world lore references
5. Test with validation scripts
