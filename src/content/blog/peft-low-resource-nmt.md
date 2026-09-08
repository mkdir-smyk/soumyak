---
title: "Parameter-Efficient Fine-Tuning for Low-Resource Translation"
description: "Practical observations on adapting multilingual sequence-to-sequence models with LoRA under severe data and compute constraints."
pubDate: 2026-08-15
tags:
  - machine-learning
  - nlp
  - pytorch
draft: false
---

When adapting large multilingual foundation models (such as NLLB-200 or modern open-weight LLMs) to low-resource languages, full fine-tuning often introduces severe catastrophic forgetting or requires infeasible GPU memory. Parameter-Efficient Fine-Tuning (PEFT), particularly Low-Rank Adaptation (LoRA), provides a practical alternative.

## Why Low-Rank Adaptation?

Standard gradient descent updates the full weight matrix $W_0 \in \mathbb{R}^{d \times k}$. LoRA decomposes the update $\Delta W$ into two low-rank matrices:

$$\Delta W = B \cdot A$$

where $A \in \mathbb{R}^{r \times k}$ is initialized with Gaussian noise and $B \in \mathbb{R}^{d \times r}$ is initialized to zero, with rank $r \ll \min(d, k)$. The forward pass computes:

$$h = W_0 x + \frac{\alpha}{r} (B A) x$$

This keeps $W_0$ frozen and trains only a tiny fraction (typically $< 1\%$) of parameters.

## Implementation Snippet

In PyTorch with the Hugging Face `peft` library, targeting the key query/value projection layers:

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForSeq2SeqLM

base_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/nllb-200-distilled-600M")

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="SEQ_2_SEQ_LM"
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
# trainable params: 1,843,200 || all params: 615,043,200 || trainable%: 0.299%
```

## Observations in Low-Resource Regimes

1. **Rank Sensitivity**: In low-resource scenarios with limited parallel sentences, setting rank $r > 32$ quickly leads to overfitting. A smaller rank ($r=8$ or $r=16$) with $\alpha = 2r$ acts as implicit regularization.
2. **Evaluation Metrics**: SacreBLEU alone is noisy on low-resource tribal dialects due to non-standard orthography. Combining **chrF++** (character n-gram F-score) alongside BLEU gives a much more stable signal during validation checkpointing.
3. **Inference Latency**: Because the adapter weights $BA$ can be folded back into $W_0$ prior to deployment via `model.merge_and_unload()`, there is zero inference latency penalty in production.
