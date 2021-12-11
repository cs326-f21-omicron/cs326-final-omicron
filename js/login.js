const processLogin = async () => {
  const username = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (res.status === 200) {
      window.location.href = '/home';
    } else if (res.status === 401) {
      alert('Wrong username or password');
    } else {
      alert('Invalid username or password');
    }
  } catch (err) {
    console.log(err);
  }
};

const formHandler = (e) => {
  e.preventDefault();
  e.stopPropagation();

  processLogin();
};

window.onload = () => {
  document.getElementById("form").addEventListener("submit", formHandler);
};