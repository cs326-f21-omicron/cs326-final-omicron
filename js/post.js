const getPost = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('id')) {
    try {
      const res = await fetch(`/posts?id=${urlParams.get('id')}`, {
        method: 'GET'
      });

      const data = await res.json();

      const post = data[0];
      const container = document.getElementById('post-container');
      container.innerHTML = `
        
      <h1>${post.title}</h1>
      <div class="d-flex flex-row mt-3">

        <!-- author -->
        <span class="d-flex align-items-center pe-4">
          <a href="#" class="text-decoration-none">
            <span class="font-weight-bold">
              <i class="bi bi-person-circle me-1"></i>
              ${post.user.name}
            </span>
          </a>
        </span>

        <!-- time -->
        <span class="d-flex align-items-center pe-4">
          <a href="#" class="text-decoration-none">
            <span class="font-weight-bold">
              <i class="bi bi-clock me-1"></i>
              <span class="font-weight-bold">
              ${new Date(post.date).toLocaleString()}
              </span>
            </span>
          </a>
        </span>

        <!-- location -->
        <span class="ml-auto d-flex align-items-center pe-4">
          <a href="https://www.google.com/maps/search/${post.location}/" target="_blank" class="text-decoration-none">
            <span class="font-weight-bold">
              <i class="bi bi-pin-map me-1"></i>
              <span class="font-weight-bold">${post.location}</span>
            </span>
          </a>
        </span>

        <!-- send message button -->
        <div class="ml-auto d-flex align-items-center pe-4">
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
    } catch (err) {
      console.log(err);
    }
  } else {
    window.location.href = '/';
  }
};

window.addEventListener('load', getPost);
