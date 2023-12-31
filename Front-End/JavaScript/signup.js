/** @format */

// DOM Elements for Sign Up
const username = document.getElementById("username-signup");
const email = document.getElementById("email-signup");
const phoneNumber = document.getElementById("contact-number");
const password = document.getElementById("password");
const sign_up_btn = document.querySelector("#sign-up-btn");
const signupButton = document.getElementById("signup-button");

// DOM Elements for Sign In
const signinName = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const sign_in_btn = document.querySelector("#sign-in-btn");
const signinButton = document.getElementById("signin-button");
const container = document.querySelector(".container");

// Event Listeners
sign_up_btn.addEventListener("click", () => {
	container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
	container.classList.remove("sign-up-mode");
});

signupButton.addEventListener("click", signup);
signinButton.addEventListener("click", signin);

/**
 * Function for handling user sign-up.
 */
async function signup() {
	try {
		// Form validation
		if (isInputEmpty(username) || isInputEmpty(email) || isInputEmpty(phoneNumber) || isInputEmpty(password)) {
			throw new Error("Please enter all details");
		}

		// User details
		const signupDetails = {
			username: username.value,
			email: email.value,
			phoneNumber: phoneNumber.value,
			password: password.value,
		};

		// Make a POST call to the backend to save user information
		const response = await axios.post("http://3.26.103.91:3000/users/signup", signupDetails);

		if (response.status === 200) {
			alert("Account created successfully. Log in to continue.");
			clearInputs(username, email, phoneNumber, password);
			container.classList.remove("sign-up-mode");
		} else if (response.status === 201) {
			alert("User already exists. Log in to continue.");
		}
	} catch (error) {
		handleError(error, "Error signing up");
	}
}

/**
 * Function for handling user sign-in.
 */
async function signin() {
	try {
		// Form validation
		if (isInputEmpty(signinName) || isInputEmpty(signinPassword)) {
			throw new Error("Please fill in all details");
		}

		// User details
		const signinDetails = {
			username: signinName.value,
			password: signinPassword.value,
		};

		// Make a POST call to the backend to verify user credentials
		const response = await axios.post("http://3.26.103.91:3000/users/login", signinDetails);

		if (response.status === 200) {
			// Store the user information (encrypted ID) in local storage for authentication
			localStorage.setItem("token", response.data.encryptedId);
			clearInputs(signinName, signinPassword);
			alert("Logged in successfully.");
			window.location.href = "../Html/chat.html"; // Redirect to chat page
		} else if (response.status === 401) {
			alert("Invalid password. Please enter the correct password.");
			clearInputs(signinPassword);
		} else if (response.status === 404) {
			alert("User not found. Please sign up.");
			clearInputs(signinName, signinPassword);
			container.classList.add("sign-up-mode");
		}
	} catch (error) {
		handleError(error, "Login failed. Please refresh and try again.");
	}
}

/**
 * Helper function to check if an input field is empty.
 * @param {HTMLInputElement} input - The input field to check.
 * @returns {boolean} True if the input is empty, false otherwise.
 */
function isInputEmpty(input) {
	return input.value.trim() === "";
}

/**
 * Helper function to clear input fields.
 * @param {...HTMLInputElement} inputs - Input fields to clear.
 */
function clearInputs(...inputs) {
	inputs.forEach((input) => (input.value = ""));
}

/**
 * Helper function to handle errors.
 * @param {Error} error - The error object.
 * @param {string} message - The error message to display.
 */
function handleError(error, message) {
	console.error(message);
	console.error(error.message);
	alert(message);
}
