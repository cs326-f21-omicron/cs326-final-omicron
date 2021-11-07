window.logIn = async () => {
  username = document.getElementById('email').value;
  password = document.getElementById('password').value;
  // firebase
  //   .auth()
  //   .signInWithEmailAndPassword(email, password)
  //   .catch(function (error) {
  //     // Handle Errors here.
  //     var errorCode = error.code;
  //     var errorMessage = error.message;
  //     // ...
  //   });
  fetch('http://localhost:8080/login', {
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
        // Store the token in local storage
        window.location.href = '/home';
      } else {
        alert('Invalid username or password');
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // window.location.href = './home.html';
};

window.signUp = () => {
  window.location.href = './signup.html';
};
