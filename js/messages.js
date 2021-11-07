async function renderMessagesSidebarContent(userID, chatGroupID) {
  const sidebarContentDiv = document.getElementById('sidebarContent');
  while (sidebarContentDiv.firstChild) {
    sidebarContentDiv.removeChild(sidebarContentDiv.firstChild);
  }

  const res = await fetch(`/user/${userID}/chatGroupsList`, {
    method: 'GET',
  });
  const data = await res.json();

  for (const chatGroupInfo of data) {
    const chatGroupInfoDiv = document.createElement('div');
    chatGroupInfoDiv.innerHTML = `
      <div
        class="list-group list-group-flush overflow-auto flex-grow-1"
      >
        <a
          href="/messages?id=${chatGroupInfo.id}"
          class="
            list-group-item list-group-item-action
            py-3
            lh-tight
            ${chatGroupID === chatGroupInfo.id ? 'active' : ''}
          "
          aria-current="true"
        >
          <div class="d-flex align-items-center">
            <div class="ms-3 w-100">
              <div
                class="
                  d-flex
                  w-100
                  align-items-center
                  justify-content-between
                  mb-1
                "
              >
                <strong>${chatGroupInfo.name}</strong>
                <small>${chatGroupInfo.lastMessage.timeDifference}</small>
              </div>
              <small>${chatGroupInfo.lastMessage.author.name}: ${
      chatGroupInfo.lastMessage.text
    }</small>
            </div>
          </div>
        </a>
      </div>
    `;
    sidebarContentDiv.appendChild(chatGroupInfoDiv);
  }
}

async function renderMessagesBox(userID, chatGroupID) {
  const messagesBoxContentDiv = document.getElementById('messagesBoxContent');
  while (messagesBoxContentDiv.firstChild) {
    messagesBoxContentDiv.removeChild(messagesBoxContentDiv.firstChild);
  }

  const res = await fetch(`/chatGroup/${chatGroupID}/messages`, {
    method: 'GET',
  });
  const data = await res.json();

  for (const message of data) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML =
      message.author.id === userID
        ? `
          <div class="mb-3 text-end">
            <p class="my-1">${message.author.name}</p>
            <div class="alert alert-secondary mb-1">
              ${message.text}
            </div>
          </div>
        `
        : `
          <div class="mb-3">
            <p class="my-1">${message.author.name}</p>
            <div class="alert alert-primary mb-1">
              ${message.text}
            </div>
          </div>
        `;
    messagesBoxContentDiv.appendChild(messageDiv);
  }
}

async function renderChatForm(userID, chatGroupID) {
  const chatFormDiv = document.getElementById('chatForm');
  console.log(chatFormDiv);
  chatFormDiv.innerHTML = chatGroupID
    ? `
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Chat Message"
          aria-label="Chat Message"
          aria-describedby="button-send"
        />
        <button
          class="btn btn-outline-primary"
          type="button"
          id="button-send"
        >
          <i class="bi bi-arrow-up-circle-fill"></i>
        </button>
      </div>
    `
    : '';
}

window.addEventListener('load', function () {
  let params = new URL(document.location).searchParams;

  renderMessagesSidebarContent('1', params.get('id'));
  renderMessagesBox('1', params.get('id'));
  renderChatForm('1', params.get('id'));
});
