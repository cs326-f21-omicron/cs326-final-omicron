const loadSuggestion = async () => {
  fetch(
    'http://localhost:8080/suggestion?userId=' + 'uy312afbnw231oapqks31lap312',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
    .then((res) => {
      console.log(res.body);
      res.json().then((data) => {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          const suggestion = data[i];
          const posts = suggestion.posts;
          const suggestionDiv = document.createElement('div');
          suggestionDiv.classList.add('px-4');
          suggestionDiv.innerHTML = `
          <h2 class="pb-2">${suggestion.name}</h2>
          <div
            class="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 pt-3"
          >
            ${posts
              .map((post) => {
                return `
              <div class="col">
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
                style="background-image: url(${post.imageUrl});"
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
                    <li class="me-auto">
                      <img
                        src="${post.user_profile}"
                        alt="Bootstrap"
                        width="32"
                        height="32"
                        class="rounded-circle border border-white"
                      />
                    </li>
                    <li class="d-flex align-items-center me-3">
                      <svg class="bi me-2" width="1em" height="1em">
                        <use xlink:href="#geo-fill" />
                      </svg>
                      <small>${post.location}</small>
                    </li>
                      <li class="d-flex align-items-center">
                        <svg class="bi me-2" width="1em" height="1em">
                          <use xlink:href="#calendar3" />
                        </svg>
                        <small>${post.time}</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              `;
              })
              .join('')}
          </div>
          </div>

          <h5 class="text-end mt-3">
            <a href="#" class="text-decoration-none">More postings</a>
          </h5>
          `;
          document.getElementById('suggestion').appendChild(suggestionDiv);
        }
      });
    })
    .catch((err) => console.log(err));
};

window.addEventListener('load', loadSuggestion);
