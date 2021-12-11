const loadPost = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const postId = urlParams.get('id');
    const res = await fetch('/posts?id=' + postId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });

    const post = await res.json();
    postData = post[0];
    document.getElementById('title').value = postData.title;
    document.getElementById('description').value = postData.description;
    document.getElementById('locationn').value = postData.location;

    const response = await fetch('/categories');
    const categories = await response.json();
    const categorySelect = document.getElementById('category');
    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category._id;
        option.innerText =
            category.title.charAt(0).toUpperCase() + category.title.slice(1);
        categorySelect.appendChild(option);
    });

    document.getElementById('category').value = postData.category.$id;
    document.getElementById('file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        imgToBase64(file).then((base64) => {
            // document.getElementById('image').src = base64;
            image = base64;
        });
    });
    document.getElementById('update').addEventListener('click', updatePost);
    document.getElementById('delete').addEventListener('click', deletePost);
};

let image = 'https://source.unsplash.com/1600x900/?nature';

const imgToBase64 = (img) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(img);
    });
};

const updatePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const locationn = document.getElementById('locationn').value;
    const category = document.getElementById('category').value;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const postId = urlParams.get('id');
    if (title === '' || description === '' || location === '') {
        alert('Please fill out all fields');
        return;
    }
    const data = {
        title,
        description,
        location: locationn,
        image,
        category,
        id: postId,
    };
    fetch('/post', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.status === 200) {
            alert('Post updated successfully');
            window.location.href = '/home';
        } else {
            console.log('Error creating new post');
            alert('Something when wrong');
        }
    });
};

const deletePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const postId = urlParams.get('id');
    const res = await fetch('/post', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            id: postId,
        }),
    });
    if (res.status === 200) {
        alert('Post deleted successfully');
        window.location.href = '/home';
    } else {
        alert('Something went wrong');
    }
};

window.addEventListener('load', loadPost);
