const loadSuggestion = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let requestUrl = '/suggestion';
  if (urlParams.has('category')) {
    requestUrl += `?category=${urlParams.get('category')}`;
  }
  try {
    const res = await fetch(requestUrl, {
      method: 'GET',
    });

    if (res.status === 400) {
      throw new Error('Bad Request');
    }

    const data = await res.json();
    let innerHtml = '';
    console.log(data.length);
    if (data.length !== 0) {
      for (let i = 0; i < data.length; i++) {
        const suggestion = data[i];
        const posts = suggestion.posts;
        const categoryTitle =
          suggestion.title.charAt(0).toUpperCase() +
          suggestion.title.slice(1);
        const suggestionDiv = document.createElement('div');
        suggestionDiv.classList.add('px-4');
        suggestionDiv.classList.add('pb-5');
        innerHtml = `
      <h2 class="pb-2">${categoryTitle}</h2>
      <div
        class="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 pt-3"
      >
        ${posts
            .map((post) => {
              //calculate how many days ago the post was created
              const date = new Date(post.date);
              const now = new Date();
              const diffTime = Math.abs(now - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return `
              <a class="col nounderline" href="/post?id=${post._id}">
              <div
                class="
                  card card-cover
                  h-100
                  overflow-hidden
                  text-white
                  bg-dark
                  rounded-5
                  shadow-lg
                  custom-img
                  border-0
                "
                style="background-image: linear-gradient(
                  rgba(0, 0, 0, 0.5), 
                  rgba(0, 0, 0, 0.5)
                ), url(${post.image});"
              >
                <div
                  class="
                    d-flex
                    flex-column
                    h-100
                    p-5
                    pb-3
                    text-white text-shadow-1
                  "
                >
                  <h2 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                    ${post.title}
                  </h2>
                  <ul class="d-flex list-unstyled mt-auto">
                      <li class="d-flex align-items-center me-4">
                        <i class="bi bi-pin-map me-2"></i>
                        <small>${post.location}</small>
                      </li>
                      <li class="d-flex align-items-center">
                        <i class="bi bi-clock me-2"></i>
                        <small>${diffDays}d</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </a>
              `;
            })
            .join('')}
          </div>
        </div>   
`;
        if (!urlParams.has('category')) {
          innerHtml += `<h5 class="text-end mt-4">
        <a href="/home?category=${data[i]._id}" class="text-decoration-none">More postings</a>
      </h5>`;
        }
        suggestionDiv.innerHTML = innerHtml;
        document
          .getElementById('suggestion')
          .appendChild(suggestionDiv);
      }
    } else {
      innerHtml = `<h2 class="pb-2">Please add your hobbies to see your suggestion</h2>`;
      document.getElementById('suggestion').innerHTML = innerHtml;
    }
  } catch (err) {
    console.log(err);
    window.location.href = '/login';
  }
};

window.addEventListener('load', loadSuggestion);
