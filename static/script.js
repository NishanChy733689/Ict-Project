async function sendMessage() {
  const msgInput = document.getElementById("msg");
  const imageInput = document.getElementById("image");
  const chatBox = document.getElementById("chat");
  const personality = document.getElementById("personality").value;
  const noThink = document.getElementById("noThink").checked;
  const stream = document.getElementById("stream").checked;
  const ttsEnabled = document.getElementById("tts").checked;

  let message = msgInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!message && !imageFile) return;

  if (noThink) message += " /no_think";

  if (message) {
    const userLi = document.createElement("li");
    userLi.className = "user";
    userLi.innerHTML = `<strong>You:</strong> ${message}`;
    chatBox.appendChild(userLi);
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgLi = document.createElement("li");
      imgLi.className = "user";
      imgLi.innerHTML = `<img src="${e.target.result}" style="max-width:180px;max-height:120px;border-radius:8px;margin-top:6px;" />`;
      chatBox.appendChild(imgLi);
      chatBox.scrollTop = chatBox.scrollHeight;
    };
    reader.readAsDataURL(imageFile);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
  msgInput.value = "";
  imageInput.value = "";

  try {
    let response;
    if (imageFile) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("personality", personality);
      formData.append("image", imageFile);
      response = await fetch("/chat", { method: "POST", body: formData });
      const data = await response.json();
      appendBotMessage(data.reply, ttsEnabled);
    } else if (stream) {
      const res = await fetch("/chat_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personality })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      const botLi = document.createElement("li");
      botLi.className = "bot";
      chatBox.appendChild(botLi);
      chatBox.scrollTop = chatBox.scrollHeight;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        botLi.innerHTML = full;
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      if (ttsEnabled) speak(full);
    } else {
      response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personality })
      });
      const data = await response.json();
      appendBotMessage(data.reply, ttsEnabled);
    }
  } catch (err) {
    const li = document.createElement("li");
    li.className = "bot";
    li.innerHTML = `<strong>Error:</strong> Could not get response from server.`;
    chatBox.appendChild(li);
  }
}

function appendBotMessage(text, tts) {
  const chatBox = document.getElementById("chat");
  const markdown = marked.parse(text);
  const li = document.createElement("li");
  li.className = "bot";
  li.innerHTML = markdown;
  chatBox.appendChild(li);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (tts) speak(text);
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

async function uploadImage() {
  const imageInput = document.getElementById("image");
  const chatBox = document.getElementById("chat");

  if (!imageInput.files.length) return;

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  appendBotMessage(data.reply, true);
}

async function fetchImage() {
  const topic = prompt("Enter a topic for the image:");
  if (!topic) return;
  const chatBox = document.getElementById("chat");
  chatBox.innerHTML += `<p class="user"><strong>You:</strong> Get image of ${topic}</p>`;

  const response = await fetch("/fetch_image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic })
  });
  const data = await response.json();
  chatBox.innerHTML += `<p class="bot">${data.reply}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("msg").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
