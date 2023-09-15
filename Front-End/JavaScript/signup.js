// signup_information
const username = document.getElementById("username-signup");
const email = document.getElementById("email-signup");
const phoneNumber = document.getElementById("contact-number");
const password = document.getElementById("password");

// signin_information

const signupButton = document.getElementById("signup-button");
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
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
        { credentials: "include" },
        signupDetails
      );
      console.log(response.status);
      if (response.status === 200 || response.status === 201) {
        container.classList.remove("sign-up-mode");
      }
    } catch (error) {
      console.log(error);
      console.log("Error Signing Up");
      alert("Error Signing Up");
    }
  }
}
