async function renderMessagesSidebarContent(userID) {
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
          href="#"
          class="
            list-group-item list-group-item-action
            py-3
            lh-tight
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
              <small>${chatGroupInfo.lastMessage.author.name}: ${chatGroupInfo.lastMessage.text}</small>
            </div>
          </div>
        </a>
      </div>
    `;
    sidebarContentDiv.appendChild(chatGroupInfoDiv);
  }
}

async function renderMessagesBox(chatGroupID, userID) {
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

window.addEventListener('load', function () {
  renderMessagesSidebarContent(1);
  renderMessagesBox(1, 1);
});
