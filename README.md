ChatGPT said:
🎤 ICT Fair Presentation Script
👤 Nishan:

    Assalamu Alaikum and Good Morning Respected Judges,
    We are Nishan and Suprio, and today we’re excited to present our project — an AI-powered chatbot web app built with Flask and an open-source language model called Qwen.

🧠 What Is GPT & Qwen?

Suprio:

    GPT, or Generative Pre-trained Transformer, is a type of AI that generates human-like text by predicting the next word in a sentence. We chose Qwen, an open-source GPT-style model from Alibaba, because it runs entirely offline, giving us full control and privacy.

🖥️ Our Backend Architecture

Nishan:

    We used Flask to build the backend. When a user first opens the page, the HTML and JavaScript load instantly. Only then do we load the Qwen model in the background, so the page feels snappy.

    We detect if a GPU is available for faster inference. If the GPU’s memory is full, we automatically fall back to the CPU—ensuring any number of users can keep chatting without failures.

🌟 Competitive Advantages

Suprio:

    Compared to online chatbots like ChatGPT or Bard, our solution:

        Runs Offline – No internet required, so it works in the field or on private networks.

        Zero Rate Limits – Unlimited questions, no API keys or quotas.

        Instant Page Load – Model loads after the UI, giving near-instant initial response.

        Adaptive Resource Use – Smartly switches between GPU and CPU for maximum capacity.

        Full Customization – We control system prompts, personalities, and can extend features at will.

🌐 Frontend & UX

Nishan:

    Our interface uses HTML, CSS, and vanilla JavaScript. It’s clean, mobile-friendly, and intuitive: type your question, hit “Send,” and get an AI-generated reply in seconds.

    We’ve also planned future enhancements—Text-to-Speech and streaming responses—to make it even more engaging.

🤝 Teamwork

Suprio:

    We collaborated tightly:

        Nishan handled the backend, model integration, and resource management.

        Suprio focused on frontend design, user experience, and integrating OCR for image-to-text chat.

🙏 Closing

Both:

    Thank you for your time and consideration. We hope our offline, flexible, and fully customizable AI chatbot inspires you as much as we enjoyed building it!
