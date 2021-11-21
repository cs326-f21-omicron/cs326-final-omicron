window.signUp = async () => {
  const username = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  console.log(username, password);

  fetch('http://localhost:8080/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.href = './login';
      } else {
        alert('Email already exists');
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // firebase
  //   .auth()
  //   .createUserWithEmailAndPassword(email, password)
  //   .then(() => {
  //     window.location.href = './dashboard.html';
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     alert(errorMessage);
  //   });
};

window.logIn = () => {
  window.location.href = './login.html';
};
