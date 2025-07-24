from flask import Flask, render_template_string, request, jsonify
import easyocr
import os

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

reader = easyocr.Reader(['en'], gpu=True)

HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EasyOCR Web Test</title>
    <style>
        body { background: #23272f; color: #e0e0e0; font-family: sans-serif; text-align: center; }
        .container { margin: 40px auto; max-width: 400px; background: #2f3640; padding: 24px; border-radius: 12px; box-shadow: 0 4px 24px #0008; }
        input[type="file"] { margin: 16px 0; }
        button { padding: 10px 24px; border: none; border-radius: 8px; background: #4cd137; color: #fff; font-weight: bold; cursor: pointer; }
        button:hover { background: #44bd32; }
        pre { background: #353b48; color: #fbc531; padding: 12px; border-radius: 8px; text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <h2>📝 EasyOCR Web Test</h2>
        <form id="ocrForm" enctype="multipart/form-data">
            <input type="file" name="image" accept="image/*" required><br>
            <button type="submit">Extract Text</button>
        </form>
        <div id="result"></div>
    </div>
    <script>
        document.getElementById('ocrForm').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            document.getElementById('result').innerHTML = "Processing...";
            const res = await fetch('/ocr', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) {
                document.getElementById('result').innerHTML = "<b style='color:#e84118'>" + data.error + "</b>";
            } else {
                document.getElementById('result').innerHTML = "<h4>Extracted Text:</h4><pre>" + data.text + "</pre>";
            }
        }
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    return render_template_string(HTML)

@app.route("/ocr", methods=["POST"])
def ocr():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    image = request.files["image"]
    if image.filename == "":
        return jsonify({"error": "No selected file"}), 400
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], image.filename)
    image.save(filepath)
    try:
        result = reader.readtext(filepath, detail=0)
        text = "\n".join(result)
    except Exception as e:
        text = ""
    os.remove(filepath)
    if not text:
        return jsonify({"error": "No text detected."})
    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)