let image = 'https://source.unsplash.com/1600x900/?nature';

const imgToBase64 = (img) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(img);
  });
};

const createNewPost = async (event) => {
  event.preventDefault();
  title = document.getElementById('title').value;
  description = document.getElementById('description').value;
  locationn = document.getElementById('locationn').value;
  if (title === '' || description === '' || location === '') {
    alert('Please fill out all fields');
    return;
  }
  data = {
    title,
    description,
    location: locationn,
    image,
  };
  fetch('http://localhost:8080/newpost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.status === 200) {
      // Store the token in local storage
      alert('Post created successfully');
      window.location.href = '/home';
    } else {
      console.log('Error creating new post');
      alert('Something when wrong');
    }
  });
};

window.addEventListener('load', async () => {
  categories = [];
  const response = await fetch('http://localhost:8080/categories');
  const data = await response.json();
  data.forEach((category) => {
    categories.push(category.title);
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
