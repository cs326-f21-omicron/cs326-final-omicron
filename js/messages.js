const removeAllChildenElements = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

function gotoBottom(element) {
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

async function renderMessages() {
  if (!(user || room)) {
    return;
  }

  const messagesBoxContentDiv = document.getElementById('messagesBoxContent');
  removeAllChildenElements(messagesBoxContentDiv);

  const res = await fetch(`/rooms/${room._id}/messages`, {
    method: 'GET',
  });
  const data = await res.json();

  for (const message of data) {
    addMessage(message, user._id);
  }
}

const addMessage = async (message) => {
  if (!(user || room)) {
    return;
  }

  const messageDiv = document.createElement('div');
  messageDiv.innerHTML =
    message.user === user._id
      ? `
        <div class="mb-3 text-end">
          <p class="my-1">${message.userDisplayName} (${new Date(message.createdAt).toLocaleString()})</p>
          <div class="alert alert-primary mb-1">
            ${message.content}
          </div>
        </div>
      `
      : `
        <div class="mb-3">
          <p class="my-1">${message.userDisplayName} (${new Date(message.createdAt).toLocaleString()})</p>
          <div class="alert alert-secondary mb-1">
            ${message.content}
          </div>
        </div>
      `;
  document.getElementById('messagesBoxContent').appendChild(messageDiv);
  gotoBottom(document.getElementById('messagesBox'));
};

const chatFormHandler = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    await fetch(`/rooms/${room._id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userId: user._id,
        content: document.getElementById('chatText').value
      })
    });

    document.getElementById('chatText').value = "";
  } catch (err) {
    console.log(err);
  }
};

// eslint-disable-next-line no-undef
const socket = io();
let user = {};
let room = {};

window.addEventListener('load', async () => {
  document.getElementById('chatForm').addEventListener('submit', chatFormHandler);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!(urlParams.has('roomId') || urlParams.has('postId'))) {
    window.location.href = '/';
    return;
  }

  try {
    const userResponse = await fetch('/userInfo', { method: 'GET' });
    user = await userResponse.json();

    if (urlParams.has('roomId')) {
      const roomId = urlParams.get('roomId');
      const roomResponse = await fetch(`/rooms/${roomId}`, { method: 'GET' });
      room = await roomResponse.json();
    } else if (urlParams.has('postId')) {
      const postId = urlParams.get('postId');
      const roomResponse = await fetch(`/posts/${postId}/room`, { method: 'GET' });
      room = await roomResponse.json();
    }
  } catch (err) {
    console.log(err);
  }

  if (!room) {
    window.location.href = '/';
    return;
  }

  await renderMessages();

  socket.emit("join", { roomId: room._id }, (err) => {
    console.log(err);
  });
  socket.on('message', data => addMessage(JSON.parse(data)));
});