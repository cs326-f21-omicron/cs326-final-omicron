let image = 'https://source.unsplash.com/1600x900/?nature';

const imgToBase64 = (img) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(img);
    });
};

const createNewPost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const locationn = document.getElementById('locationn').value;
    const category = document.getElementById('category').value;
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
    };
    fetch('/newpost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.status === 200) {
            alert('Post created successfully');
            window.location.href = '/home';
        } else {
            console.log('Error creating new post');
            alert('Something when wrong');
        }
    });
};

window.addEventListener('load', async () => {
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
    document.getElementById('file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        imgToBase64(file).then((base64) => {
            // document.getElementById('image').src = base64;
            image = base64;
        });
    });
    document.getElementById('submit').addEventListener('click', createNewPost);
});
