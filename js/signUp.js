const processSignup = async () => {
  const username = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const res = await fetch('/signup', {
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
      alert('Sign up successful. Please login.');
      window.location.href = './login';
    } else {
      alert('Email already exists');
    }
  } catch (err) {
    console.log(err);
  }
};

const formHandler = (e) => {
  e.preventDefault();
  e.stopPropagation();

  processSignup();
};

window.onload = () => {
  document.getElementById("form").addEventListener("submit", formHandler);
};