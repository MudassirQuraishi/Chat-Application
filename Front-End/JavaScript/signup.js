// signup_information
const username = document.getElementById("username-signup");
const email = document.getElementById("email-signup");
const phoneNumber = document.getElementById("contact-number");
const password = document.getElementById("password");
const sign_up_btn = document.querySelector("#sign-up-btn");
const signupButton = document.getElementById("signup-button");

// signin_information
const siginName = document.getElementById("signin-email");
const siginPassword = document.getElementById("signin-password");
const sign_in_btn = document.querySelector("#sign-in-btn");
const signinButton = document.getElementById("signin-button");
const container = document.querySelector(".container");

//Event Listeners
{
  sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
  });

  sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
  });

  signupButton.addEventListener("click", signup);
  signinButton.addEventListener("click", signin);
}
//signup function
async function signup(e) {
  e.preventDefault();
  if (
    username.value === "" ||
    email.value === "" ||
    phoneNumber.value === "" ||
    password.value === ""
  ) {
    alert("Please enter all details");
  } else {
    try {
      const signupDetails = {
        username: username.value,
        email: email.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
      };
      const response = await axios.post(
        "http://localhost:3000/user/signup",
        signupDetails
      );
      console.log(response.status);
      if (response.status === 200 || response.status === 201) {
        if (response.status === 200) {
          alert("Created successfully, Login to Continue");
        } else if (response.status === 201) {
          alert("User already exits, Login to Continue");
        }
        container.classList.remove("sign-up-mode");
      }
    } catch (error) {
      console.log(error);
      console.log("Error Signing Up");
      alert("Error Signing Up");
    }
  }
}
async function signin(e) {
  e.preventDefault();
  if (siginName.value === "" || siginPassword.value === "") {
    alert("Please Fill All Details");
  } else {
    try {
      const siginDetials = {
        username: siginName.value,
        password: siginPassword.value,
      };
      const response = await axios.post(
        "http://localhost:3000/user/login",
        siginDetials
      );
      if (response.status === 200) {
        localStorage.setItem("token", response.data.encryptedId);
        alert("Logged In Successfully");
      } else if (response.status === 401) {
        siginPassword.value = "";
        alert("Invalid password");
      } else if (response.status === 404) {
        siginName.value = "";
        siginPassword = "";
        alert("User not found, Please sign up");
        container.classList.add("sign-up-mode");
      }
    } catch (error) {
      console.log("Error During Login");
      console.log(error);
      alert("Login Failed please refresh");
    }
  }
}
