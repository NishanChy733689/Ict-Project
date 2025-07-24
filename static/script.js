async function sendMessage() {
  const msgInput = document.getElementById("msg");
  const imageInput = document.getElementById("image");
  const chatBox = document.getElementById("chat");
  const personality = document.getElementById("personality").value;
  const noThink = document.getElementById("noThink").checked;
  const streaming = document.getElementById("streamToggle").checked;

  let message = msgInput.value.trim();
  const imageFile = imageInput.files[0];
  if (!message && !imageFile) return;
  if (noThink) message += " /no_think";

  // Show user message
  const userLi = document.createElement("li");
  userLi.className = "user";
  userLi.innerHTML = `<strong>You:</strong> ${msgInput.value}`;
  chatBox.appendChild(userLi);

  // Preview image if any
  if (imageFile) {
    await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const imgLi = document.createElement("li");
        imgLi.className = "user";
        imgLi.innerHTML = `<img src="${e.target.result}" style="max-width:180px;border-radius:8px;" />`;
        chatBox.appendChild(imgLi);
        resolve();
      };
      reader.readAsDataURL(imageFile);
    });
  }

  chatBox.scrollTop = chatBox.scrollHeight;
  msgInput.value = "";
  imageInput.value = "";

  try {
    if (imageFile) {
      // always non-streaming for images
      const formData = new FormData();
      formData.append("message", message);
      formData.append("personality", personality);
      formData.append("image", imageFile);

      const response = await fetch("/chat", { method: "POST", body: formData });
      const data = await response.json();
      const markdown = marked.parse(data.reply);
      const li = document.createElement("li");
      li.className = "bot";
      li.innerHTML = markdown;
      chatBox.appendChild(li);
      chatBox.scrollTop = chatBox.scrollHeight;

    } else if (streaming) {
      // streaming text
      const response = await fetch("/chat_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personality })
      });
      if (!response.ok || !response.body) throw new Error();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      const botLi = document.createElement("li");
      botLi.className = "bot";
      botLi.innerHTML = "";
      chatBox.appendChild(botLi);
      chatBox.scrollTop = chatBox.scrollHeight;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          botLi.innerHTML += chunk;
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      }

    } else {
      // non-streaming text
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personality })
      });
      const data = await response.json();
      const markdown = marked.parse(data.reply);
      const li = document.createElement("li");
      li.className = "bot";
      li.innerHTML = markdown;
      chatBox.appendChild(li);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

  } catch (err) {
    const li = document.createElement("li");
    li.className = "bot";
    li.innerHTML = `<strong>Error:</strong> ${err.message}`;
    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// handle Enter key
document.getElementById("msg").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
