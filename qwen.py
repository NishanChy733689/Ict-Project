from transformers import AutoModelForCausalLM, AutoTokenizer
import torch, gc
class QwenChatbot:
    def __init__(self, model_name="qwen"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print("Using device:", self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        print("tokenizer loaded")
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            trust_remote_code=True,
        ).to(self.device)
        print("model Loaded ! Model name :" + model_name)
        self.reset()

    def reset(self, personality=None):
        self.history = []
        if personality:
            self.history.append({"role": "system", "content": personality})

    def set_personality(self, personality):
        if not self.history or self.history[0].get("role") != "system":
            self.history.insert(0, {"role": "system", "content": personality+". Make sure to use as much as emojies as possible"})
        else:
            self.history[0]["content"] = personality
        print(f"setting personality to {personality}")

    def generate_response(self, user_input):
        messages = self.history + [{"role": "user", "content": user_input}]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
        response_ids = self.model.generate(**inputs, max_new_tokens=1024)[0][
            len(inputs.input_ids[0]) :
        ].tolist()
        response = self.tokenizer.decode(response_ids, skip_special_tokens=True)
        self.history.append({"role": "user", "content": user_input})
        self.history.append({"role": "assistant", "content": response})
        print({"role": "user", "content": user_input})
        print("\n\n")
        print({"role": "assistant", "content": response}+"\n\n")
        gc.collect()
        return response

# Example Usage
if __name__ == "__main__":
    chatbot = QwenChatbot()

    # First input (without /think or /no_think tags, thinking mode is enabled by default)
    user_input_1 = input()
    print(f"User: {user_input_1}")
    response_1 = chatbot.generate_response(user_input_1)
    print(f"Bot: {response_1}")
    print("----------------------")

    # Second input with /no_think
    user_input_2 = input()
    print(f"User: {user_input_2}")
    response_2 = chatbot.generate_response(user_input_2)
    print(f"Bot: {response_2}")
    print("----------------------")

    # Third input with /think
    user_input_3 = input()
    print(f"User: {user_input_3}")
    response_3 = chatbot.generate_response(user_input_3)
    print(f"Bot: {response_3}")
