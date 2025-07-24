# download_llm.py
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

def download_model(model_id, save_dir):
    print(f"Downloading {model_id}...")

    # Download and save model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(model_id, trust_remote_code=True)

    print("Saving to:", save_dir)
    tokenizer.save_pretrained(save_dir)
    model.save_pretrained(save_dir)

    print("✅ Model saved offline!")

if __name__ == "__main__":
    # Example:
    model_id = input("Enter model ID (e.g. LiquidAI/LFM2-350M): ").strip()
    save_dir = input("Enter folder name to save model (e.g. ./my_model): ").strip()

    # Make folder if not exists
    os.makedirs(save_dir, exist_ok=True)

    download_model(model_id, save_dir)
