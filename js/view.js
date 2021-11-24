const getPost = () => {
  if (window.location.href.includes('/view?id=')) {
    const postId = window.location.href.split('/view?id=')[1];
    fetch('http://localhost:8080/posts?id=' + postId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
        const post = data[0];
        const container = document.getElementById('post-container');
        container.innerHTML = `<h1>${post.title}</h1>
        <div class="d-flex flex-row mt-3">
          <img
            src="https://avatar-prod-us-east-2.webexcontent.com/Avtr~V1~6078fba4-49d9-4291-9f7b-80116aab6974/V1~8d90dcca-87c5-4a7c-9808-8965a02be966~07b1fecf53a948688dabf01402621a0a"
            alt="mdo"
            width="32"
            height="32"
            class="rounded-circle"
          />
          <span class="ml-2 d-flex align-items-center px-3">
            <a href="#" class="text-decoration-none">
              <span class="font-weight-bold">by ${post.user.username}</span>
            </a>
          </span>
          <span class="ml-auto d-flex align-items-center">
            <a href="#" class="text-decoration-none">
              <span class="font-weight-bold">
                <i class="bi bi-clock-history"></i>
                <span class="font-weight-bold">${new Date(
                  post.date
                ).toUTCString()}</span>
              </span>
            </a>
          </span>

          <!-- location -->
          <span class="ml-auto d-flex align-items-center px-3">
            <a href="#" class="text-decoration-none">
              <span class="font-weight-bold">
                <i class="bi bi-pin-map"></i>
                <span class="font-weight-bold">${post.location}</span>
              </span>
            </a>
          </span>

          <!-- send message button -->
          <div class="ml-auto d-flex align-items-center px-3">
            <a href="#" class="text-decoration-none">
              <span class="font-weight-bold">
                <i class="bi bi-chat-square-dots me-1"></i>
                <span class="font-weight-bold">Send message</span>
              </span>
            </a>
          </div>
      </div>
      <!-- Post content -->
      <div class="d-flex flex-column mt-3">
        <p class="mb-4 content-text-align">
          ${post.description}
        </p>
      </div>
      <!-- image -->
      <div class="d-flex flex-row mt-3">
        <img
          src="${post.image}"
          alt="mdo"
          width="100%"
          height="100%"
          class="rounded-lg"
        />
      </div>`;
      });
    });
  } else {
    window.location.href = '/';
  }
};

window.addEventListener('load', getPost);
