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
        <a
          href="/messages?id=${chatGroupInfo.id}"
          class="
            list-group-item list-group-item-action
            py-3
            lh-tight
            ${chatGroupID === chatGroupInfo.id ? 'active' : ''}
          "
          ${chatGroupID === chatGroupInfo.id ? 'aria-current="true"' : ''}
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
    `;
    sidebarContentDiv.appendChild(chatGroupInfoDiv);
  }
}

async function renderMessagesBoxContent(userID, chatGroupID) {
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

  gotoBottom('messagesBox');
}

function renderChatForm(userID, chatGroupID) {
  const chatFormElement = document.getElementById('chatForm');
  if (!chatGroupID) {
    chatFormElement.classList.add('d-none');
  }
}

async function postNewMessage(authorID, chatGroupID, text) {
  const res = await fetch(`/chatGroup/${chatGroupID}/messages/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      authorID,
      text,
    }),
  });
  const data = await res.json();
  // console.log(data);
  return data;
}

function gotoBottom(id) {
  const element = document.getElementById(id);
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

window.addEventListener('load', async function () {
  const params = new URL(document.location).searchParams;

  await renderMessagesSidebarContent('1', params.get('id'));
  await renderMessagesBoxContent('1', params.get('id'));

  renderChatForm('1', params.get('id'));
});

document
  .getElementById('chatForm')
  .addEventListener('submit', async function (e) {
    const params = new URL(document.location).searchParams;

    e.preventDefault();
    e.stopPropagation();

    const chatText = document.getElementById('chatText').value.trim();
    if (chatText) {
      await postNewMessage('1', params.get('id'), chatText);

      await renderMessagesSidebarContent('1', params.get('id'));
      await renderMessagesBoxContent('1', params.get('id'));

      document.getElementById('chatText').value = '';
    }
  });
