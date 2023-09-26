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
  // Doing form validation that the user has entered all the neccessary fields
  if (
    username.value === "" ||
    email.value === "" ||
    phoneNumber.value === "" ||
    password.value === ""
  ) {
    alert("Please enter all details");
  } else {
    //If the user has entered all the neccessary fields, then save the data in an object and make a network call to the backend
    try {
      const signupDetails = {
        username: username.value,
        email: email.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
      };
      // Make a POST call to the backend to save the user information in the database
      const response = await axios.post(
        "http://localhost:3000/users/signup",
        signupDetails
      );
      //After getting the response check for the response status and move forward accordingly
      if (response.status === 200 || response.status === 201) {
        if (response.status === 200) {
          alert("Created successfully, Login to Continue");
        } else if (response.status === 201) {
          alert("User already exits, Login to Continue");
        }
        //Clear the input fields if a successful response was received
        username.value = "";
        email.value = "";
        phoneNumber.value = "";
        password.value = "";
        //Now shift the mode from signu to signin
        container.classList.remove("sign-up-mode");
      }
    } catch (error) {
      //If a 500 status code is returned or there was an internal server error then notify the user
      console.log(error.message);
      alert("Error Signing Up");
    }
  }
}

//Signin Function
async function signin(e) {
  // Doing form validation that the user has entered all the neccessary fields
  if (siginName.value === "" || siginPassword.value === "") {
    alert("Please Fill All Details");
  } else {
    //If all the neccesary fields have been filled then save the data in an object
    try {
      const siginDetials = {
        username: siginName.value,
        password: siginPassword.value,
      };
      //Now make a POST network call to the backend to verify whether the userdata exists in the database or not
      const response = await axios.post(
        "http://localhost:3000/users/login",
        siginDetials
      );
      //Now redirect the user according to the response status
      if (response.status === 200) {
        //Status 200 means that a succesfull llogin attempt was made, then we will store the user information as an encryptedID in the localstorage which will be used frequently for user authentication.
        localStorage.setItem("token", response.data.encryptedId);
        siginName.value = "";
        siginPassword.value = "";
        alert("Logged In Successfully");
        //Only after loggging in succesfully we will redirect user to the chat page
        window.location.href = "../Html/chat.html";
      } else if (response.status === 401) {
        //Status 401 means that the user password is incorrect, alert the user to enter the correct password
        siginPassword.value = "";
        alert("Invalid password");
      } else if (response.status === 404) {
        //Statsu code 404 means that there is no user with the specified details,, alert the user to signup
        siginName.value = "";
        siginPassword = "";
        alert("User not found, Please sign up");
        container.classList.add("sign-up-mode");
      }
    } catch (error) {
      console.log("Error During Login");
      console.log(error.message);
      alert("Login Failed please refresh");
    }
  }
}
