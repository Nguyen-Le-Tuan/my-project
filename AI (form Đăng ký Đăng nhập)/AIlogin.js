let form = document.querySelector("form");

function login(e) {
  e.preventDefault();
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let users = JSON.parse(localStorage.getItem("users"));
  if(users){
    for (let i = 0; i < users.length; i++) {
      if (username === users[i].username && password === users[i].password) {
        alert("Login successful");
        window.location.href = "#";
        return;
      }
    }
  }
  alert("Wrong username or password");
}

form.addEventListener("submit", login);