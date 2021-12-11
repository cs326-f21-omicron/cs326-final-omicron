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

        const data = await res.json();

        for (let i = 0; i < data.length; i++) {
            const suggestion = data[i];
            const posts = suggestion.posts;
            const categoryTitle =
                suggestion.title.charAt(0).toUpperCase() +
                suggestion.title.slice(1);
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('px-4');
            let innerHtml = `
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
              <a class="col nounderline" href="/view?id=${post._id}">
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
                style="background-image: url(${post.image});"
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
                        src= "https://avatar-prod-us-east-2.webexcontent.com/Avtr~V1~6078fba4-49d9-4291-9f7b-80116aab6974/V1~8d90dcca-87c5-4a7c-9808-8965a02be966~07b1fecf53a948688dabf01402621a0a"
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
                innerHtml += `<h5 class="text-end mt-3">
        <a href="/home?category=${data[i]._id}" class="text-decoration-none">More postings</a>
      </h5>`;
            }
            suggestionDiv.innerHTML = innerHtml;
            document.getElementById('suggestion').appendChild(suggestionDiv);
        }
    } catch (err) {
        console.log(err);
    }
};

window.addEventListener('load', loadSuggestion);
