from flask import Flask, render_template, request, jsonify, session
from qwen import QwenChatbot
import easyocr
import os
import re
import uuid
import time

app = Flask(__name__)
app.secret_key = "your_secret_key"
app.config["UPLOAD_FOLDER"] = os.path.join("static", "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

personalities = {
    "teacher": "You are a helpful and calm teacher who explains things clearly.",
    "detective": "You are a witty detective who answers like you're solving a mystery.",
    "friend": "You are a friend of the user and you always give to the point short answers to what the user says.",
    "study": "You are a focused study assistant who helps with learning and generating questions.",
    "quizmaster": "You are a quizmaster who creates challenging questions and quizzes to help the user study.",
    "explainer": "You are an expert explainer who breaks down complex topics into simple, easy-to-understand parts.",
    "motivator": "You are a motivational study coach who encourages the user to keep learning and provides study tips.",
    "note_taker": "You are a note-taking assistant who summarizes information and helps organize study notes.",
    "examiner": "You act as an examiner, asking practice exam questions and providing feedback on answers.",
    "flashcard": "You help the user create and review flashcards for effective memorization and recall."
}
reader = easyocr.Reader(['en'], gpu=True)
chatbots = {}





def get_chatbot():
    sid = session.get("sid")
    if not sid:
        sid = str(uuid.uuid4())
        session["sid"] = sid
    if sid not in chatbots:
        chatbots[sid] = QwenChatbot()
    return chatbots[sid]

@app.route("/")
def index():
    return render_template("index.html")





@app.route("/chat", methods=["POST"])
def chat():
    content_type = request.content_type or ""
    if content_type.startswith("multipart/form-data"):
        user_input = request.form.get("message", "")
        personality_key = request.form.get("personality", "teacher")
        image = request.files.get("image")
    else:
        data = request.json or {}
        user_input = data.get("message", "")
        personality_key = data.get("personality", "teacher")
        image = None

    chatbot = get_chatbot()
    chatbot.set_personality(personalities.get(personality_key, personalities["teacher"]))

    image_text = ""
    if image and getattr(image, "filename", ""):
        unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}_{image.filename}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
        image.save(filepath)
        result = reader.readtext(filepath, detail=0)
        image_text = "\n".join(result)
        os.remove(filepath)

    full_input = user_input
    if image_text:
        full_input += f"\n[Image text]: {image_text}"

    decoded = chatbot.generate_response(full_input)
    reply = re.sub(r"<think>.*?</think>", "", decoded, flags=re.DOTALL)
    return jsonify({"reply": reply})





@app.route("/upload", methods=["POST"])
def upload():
    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify({"error": "No image uploaded"}), 400

    unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}_{image.filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    image.save(filepath)
    result = reader.readtext(filepath, detail=0)
    text = "\n".join(result)
    os.remove(filepath)

    chatbot = get_chatbot()
    chatbot.set_personality(personalities["study"])
    response = chatbot.generate_response(text)
    return jsonify({"reply": response})





@app.route("/fetch_image", methods=["POST"])
def fetch_image_route():
    data = request.json or {}
    topic = data.get("topic", "nature")
    url = f"https://source.unsplash.com/600x400/?{topic}"
    return jsonify({"reply": f"<img src='{url}' alt='Image of {topic}' style='max-width:100%;border-radius:10px;' />"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
