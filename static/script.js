async function sendMessage() {
  const msgInput = document.getElementById("msg");
  const imageInput = document.getElementById("image");
  const chatBox = document.getElementById("chat");
  const personality = document.getElementById("personality").value;
  const noThink = document.getElementById("noThink").checked;

  let message = msgInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!message && !imageFile) return;

  if (noThink) {
    message += " /no_think";
  }

  // Add user message to chat
  if (message) {
    const userLi = document.createElement("li");
    userLi.className = "user";
    userLi.innerHTML = `<strong>You:</strong> ${msgInput.value}`;
    chatBox.appendChild(userLi);
    msgInput.value = "";
    imageInput.value = "";
  }

  // Preview image if uploaded
  let imagePreviewPromise = Promise.resolve();
  if (imageFile) {
    imagePreviewPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgLi = document.createElement("li");
        imgLi.className = "user";
        imgLi.innerHTML = `<img src="${e.target.result}" style="max-width:180px;max-height:120px;border-radius:8px;margin-top:6px;" />`;
        chatBox.appendChild(imgLi);
        chatBox.scrollTop = chatBox.scrollHeight;
        resolve();
      };
      reader.readAsDataURL(imageFile);
    });
  }

  await imagePreviewPromise;

  try {
    let response;
    if (imageFile) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("personality", personality);
      formData.append("image", imageFile);

      response = await fetch("/chat", {
        method: "POST",
        body: formData,
      });
    } else {
      response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personality }),
      });
    }

    const data = await response.json();
    const markdown = marked.parse(data.reply);
    const li = document.createElement("li");
    li.className = "bot";
    li.innerHTML = markdown;
    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    const li = document.createElement("li");
    li.className = "bot";
    li.innerHTML = `<strong>Error:</strong> Could not get response from server.`;
    chatBox.appendChild(li);
    chatBox.scrollTop = chatBox.scrollHeight;
  } finally {
    msgInput.value = "";
    imageInput.value = "";
  }
}

// Auto-send on Enter key
document.getElementById("msg").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
