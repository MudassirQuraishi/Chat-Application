/** @format */

//
const token = localStorage.getItem("token");
const API_BASE_URL = "http://localhost:3000";
const container = document.querySelector(".content-messages-list");
const contentMessagesContainer = document.getElementsByClassName("group-add");
const groupAddDiv = document.getElementById("groupAddDiv");
const modalOpen = document.getElementById("add-group-link");
const button = document.getElementById("submit-button");
const conversations = document.querySelectorAll(".conversation");

const cancelAddMemberButton = document.getElementById("cancelAddMembersBtn");
const groupAddButton = document.getElementsByClassName("group-add-button");
const profileToggleBtn = document.querySelector(".chat-sidebar-profile-toggle");
const infoButton = document.getElementById("info-button-group");
const addMembersModal = document.getElementById("addMembersModal");
const closeAddMembersModal = document.getElementById("closeAddMembersModal");
const addMembersbutton = document.getElementById("manage-button");
const multiMediaButton = document.getElementById("attachment");
const attachButton = document.getElementById("sendAttachmentButton");
const fileInput = document.getElementById("fileInput");
const attachmentModal = document.getElementById("attachmentModal");
const cancelButton = document.getElementById("cancelAttachmentButton");

multiMediaButton.addEventListener("click", multiMediaHandler);

document.addEventListener("DOMContentLoaded", getAllChats());

let profile_picture;
// Initialize Socket.io and establish a connection
const socket = io("http://127.0.0.1:3000", {
	auth: {
		token: token, // Provide the user's authentication token
	},
});
const chatSockets = {};
const groupSockets = {};

async function multiMediaHandler() {
	attachmentModal.style.display = "flex";
	const chatId = localStorage.getItem("currentUser");
	const fileInput = document.getElementById("fileInput");
	const uploadForm = document.getElementById("uploadForm");
	attachButton.addEventListener("click", async (e) => {
		e.preventDefault();
		const file = fileInput.files[0];
		const formData = new FormData(uploadForm);
		formData.append("file", file);
		const toUploadFile = formData.get("file");
		const data = {
			type: "multimedia",
			file: toUploadFile,
		};
		const response = await axios.post(`${API_BASE_URL}/chat/upload/${chatId}`, data, {
			headers: { Authorization: token, "Content-Type": "multipart/form-data" },
		});
		const res = response.data.saveFileToDb;
		const isLink = true;
		createMessage(res, profile_picture);
		attachmentModal.style.display = "none"; // Hide the modal
		fileInput.value = ""; // Clear the file input
	});
	cancelAttachmentButton.addEventListener("click", () => {
		attachmentModal.style.display = "none"; // Hide the modal
		fileInput.value = ""; // Clear the file input
	});
}

// Function to show or hide chat buttons based on "chatActive" value
function updateChatButtons() {
	// Get the value of "chatActive" from local storage
	const chatActive = localStorage.getItem("chatActive");

	// Select the normal and group chat buttons div elements
	const normalChatButtons = document.getElementById("normal-chat-buttons");
	const groupChatButtons = document.getElementById("group-chat-buttons");

	if (chatActive === "user") {
		// If "chatActive" is set to "user", show normal chat buttons and hide group chat buttons
		normalChatButtons.style.display = "flex";
		groupChatButtons.style.display = "none";
	} else if (chatActive === "group") {
		// If "chatActive" is set to "group", show group chat buttons and hide normal chat buttons
		normalChatButtons.style.display = "none";
		groupChatButtons.style.display = "flex";
	} else {
		// Handle the case where "chatActive" is neither "user" nor "group"
		// You can choose to show one set of buttons by default or implement custom error handling logic here.
		console.error("Invalid value for 'chatActive' in local storage: " + chatActive);
	}
}

/**
 * Function to handle the DOMContentLoaded event.
 * Initializes the chat sidebar menu, local storage for messages, and group messages.
 */
document.addEventListener("DOMContentLoaded", async function () {
	try {
		// Select relevant DOM elements
		const menuItems = document.querySelectorAll(".chat-sidebar-menu li");
		const contentSidebarTitle = document.querySelector(".content-sidebar-title");

		// Initialize local storage for messages and group messages if not present
		const groupMessages = localStorage.getItem("GroupMessages");
		const messages = localStorage.getItem("Messages");

		if (groupMessages === null) {
			const initialGroupMessages = [];
			localStorage.setItem("GroupMessages", JSON.stringify(initialGroupMessages));
		}

		if (messages === null) {
			const initialMessages = [];
			localStorage.setItem("Messages", JSON.stringify(initialMessages));
		}

		// Add event listeners to menu items
		menuItems.forEach((item) => {
			item.addEventListener("click", async function (event) {
				event.preventDefault();
				const previouslyActiveItem = document.querySelector(".chat-sidebar-menu li.active");

				if (previouslyActiveItem) {
					previouslyActiveItem.classList.remove("active");
				}

				item.classList.add("active");

				// Set the content sidebar title based on the selected item
				contentSidebarTitle.textContent = item.children[0].dataset.title || item.dataset.title;

				if (item.classList.contains("active")) {
					// Handle different menu item actions
					switch (contentSidebarTitle.textContent) {
						case "Chats":
							await getAllChats();
							break;
						case "Add-Friends":
							await getAllUsers();
							break;
						case "Groups":
							await getAllGroups();
							break;
						case "Settings":
							await getSettings();
							break;
						case "Profile":
							await getProfile();
							break;
						case "Friends":
							await getAllFriends();
							break;
						case "Requests":
							await getRequests();
							break;
						default:
							break;
					}
				}
			});
		});
	} catch (error) {
		console.error("Error handling DOMContentLoaded event:", error);
	}
});

/**
 * Function to toggle the 'active' class on the parent element of the profile toggle button.
 * @param {Event} e - The click event object.
 */
function toggleProfileSidebar(e) {
	try {
		e.preventDefault();
		const parentElement = this.parentElement;

		if (parentElement) {
			parentElement.classList.toggle("active");
		}
	} catch (error) {
		console.error("Error toggling profile sidebar:", error);
	}
}
// Add a click event listener to the profile toggle button
if (profileToggleBtn) {
	profileToggleBtn.addEventListener("click", toggleProfileSidebar);
}

/**
 * Close the profile sidebar if a click occurs outside of it.
 * @param {Event} e - The click event object.
 */
function closeProfileSidebarOnClick(e) {
	try {
		if (!e.target.matches(".chat-sidebar-profile, .chat-sidebar-profile *")) {
			const profileSidebar = document.querySelector(".chat-sidebar-profile");
			if (profileSidebar) {
				profileSidebar.classList.remove("active");
			}
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}
// Add a click event listener to the document
document.addEventListener("click", closeProfileSidebarOnClick);

/**
 * Toggle the active state of a conversation item dropdown.
 * @param {Event} e - The click event object.
 */
function toggleConversationItemDropdown(e) {
	try {
		e.preventDefault();
		const parentElement = this.parentElement;
		if (parentElement.classList.contains("active")) {
			parentElement.classList.remove("active");
		} else {
			// Deactivate all other conversation item dropdowns
			document.querySelectorAll(".conversation-item-dropdown").forEach(function (item) {
				item.classList.remove("active");
			});
			parentElement.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}
// Add a click event listener to all conversation item dropdown toggles
document.querySelectorAll(".conversation-item-dropdown-toggle").forEach(function (item) {
	item.addEventListener("click", toggleConversationItemDropdown);
});

/**
 * Handle clicks outside of conversation item dropdowns.
 * @param {Event} e - The click event object.
 */
function handleOutsideClick(e) {
	try {
		if (!e.target.matches(".conversation-item-dropdown, .conversation-item-dropdown *")) {
			// Deactivate all conversation item dropdowns
			document.querySelectorAll(".conversation-item-dropdown").forEach(function (item) {
				item.classList.remove("active");
			});
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}
// Add a click event listener to the document to handle clicks outside of dropdowns
document.addEventListener("click", handleOutsideClick);

/**
 * Adjust the number of rows in a textarea based on its content.
 * @param {Event} event - The input event object.
 */
function adjustTextareaRows(event) {
	try {
		const textarea = event.target;
		textarea.rows = textarea.value.split("\n").length;
	} catch (error) {
		console.error("Error adjusting textarea rows:", error);
	}
}
// Add an input event listener to all elements with the "conversation-form-input" class
document.querySelectorAll(".conversation-form-input").forEach(function (item) {
	item.addEventListener("input", adjustTextareaRows);
});

/**
 * Handle the click event on elements with a "data-conversation" attribute.
 * @param {Event} event - The click event object.
 */
function handleConversationClick(event) {
	try {
		event.preventDefault();

		// Deactivate all conversation elements
		document.querySelectorAll(".conversation").forEach(function (conversation) {
			conversation.classList.remove("active");
		});

		// Activate the selected conversation element
		const targetConversation = document.querySelector(event.target.dataset.conversation);
		if (targetConversation) {
			targetConversation.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling conversation click:", error);
	}
}
// Add a click event listener to all elements with a "data-conversation" attribute
document.querySelectorAll("[data-conversation]").forEach(function (item) {
	item.addEventListener("click", handleConversationClick);
});

/**
 * Handle the click event on elements with the class "conversation-back".
 * @param {Event} event - The click event object.
 */
function handleConversationBackClick(event) {
	try {
		event.preventDefault();

		// Deactivate the current conversation
		const currentConversation = event.target.closest(".conversation");
		if (currentConversation) {
			currentConversation.classList.remove("active");
		}

		// Activate the default conversation
		const defaultConversation = document.querySelector(".conversation-default");
		if (defaultConversation) {
			defaultConversation.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling conversation back click:", error);
	}
}
// Add a click event listener to all elements with the class "conversation-back"
document.querySelectorAll(".conversation-back").forEach(function (item) {
	item.addEventListener("click", handleConversationBackClick);
});

/**
 * Handle the opening and interactions with the modal.
 */
function handleModal() {
	console.log("moal opened");
	try {
		const modal = document.getElementById("myModal");
		const closeModalButton = document.getElementById("closeModal");
		const confirmButton = document.getElementById("confirmBtn");
		const cancelButton = document.getElementById("cancelBtn");

		// Show the modal by setting its display property to "block"
		modal.style.display = "block";

		// Add an event listener to close the modal when the close button is clicked
		closeModalButton.addEventListener("click", () => {
			modal.style.display = "none"; // Hide the modal
		});

		// Add an event listener to handle form submission

		confirmButton.addEventListener("click", async (e) => {
			try {
				e.preventDefault();

				// Retrieve form input values
				const groupName = document.getElementById("groupName").value;
				const groupDescription = document.getElementById("groupDescription").value;
				const groupDetails = {
					name: groupName,
					description: groupDescription,
				};

				// Send a POST request to the server to create the group
				const response = await axios.post(`${API_BASE_URL}/groups/create-group`, groupDetails, {
					headers: { Authorization: token },
				});

				// Handle the response as needed, e.g., show success message

				// Close the modal after successful submission
				modal.style.display = "none";
			} catch (error) {
				console.error("Error submitting form:", error);
				// Handle any errors from form submission
				// You can display an error message to the user if necessary
			}
		});

		// Add an event listener to cancel and close the modal
		cancelButton.addEventListener("click", () => {
			modal.style.display = "none"; // Hide the modal
		});
	} catch (error) {
		console.error("Error handling modal:", error);
		// Handle any unexpected errors related to modal interactions
	}
}
// Add a click event listener to open the modal
modalOpen.addEventListener("click", handleModal);

/**
 * Creates and appends a contact item to the container.
 *
 * @param {Object} data - Contact data including id, profile_picture, and username.
 */
async function createContact(data) {
	try {
		// Create the elements
		const li = document.createElement("li");
		const a = document.createElement("a");
		const img = document.createElement("img");
		const info = document.createElement("span");
		const nameSpan = document.createElement("span");
		const textSpan = document.createElement("span");
		const more = document.createElement("span");

		// Set attributes and text content
		a.href = "#";
		a.id = `${data.id}`;
		a.setAttribute("data-conversation", "#conversation-1"); // Set the data-conversation attribute
		img.classList.add("content-message-image");
		img.src = `${data.profile_picture}`;
		img.alt = "";
		nameSpan.classList.add("content-message-name");
		nameSpan.textContent = `${data.username}`;
		textSpan.classList.add("content-message-text");
		textSpan.textContent = "No Calls. Only Q Chat";

		// Append elements to build the structure
		a.appendChild(img);
		a.appendChild(info);
		info.appendChild(nameSpan);
		info.appendChild(textSpan);
		a.appendChild(more);
		li.appendChild(a);

		// Append the newly created structure to the container
		container.appendChild(li);
	} catch (error) {
		console.error("Error creating contact:", error);
		// Handle any errors that may occur during contact creation
	}
}

/**
 * Fetches and displays the user's friends.
 */
async function getAllFriends() {
	try {
		// Remove 'active' class from certain elements
		groupAddDiv.classList.remove("active");
		conversations[1].classList.remove("active");
		conversations[0].classList.add("active");

		// Clear the container content
		container.innerHTML = "";

		// Fetch user's friends using Axios
		const response = await axios.get(`${API_BASE_URL}/user/friends`, {
			headers: { Authorization: token },
		});

		// Check if the response is successful
		if (response.status === 200) {
			const friends = response.data.data;

			// Filter out the user themselves from the friends list
			const filteredFriends = friends.filter((friend) => friend.id !== friend.userId);

			// Check if there are any friends to display
			if (filteredFriends.length === 0) {
				console.log("You have no friends to display.");
				return;
			}

			// Create contacts for each friend and append them to the container
			filteredFriends.forEach((friend) => {
				createContact(friend);
			});
		} else {
			console.error("Failed to fetch friends. Status code:", response.status);
		}
	} catch (error) {
		console.error("Error while fetching friends:", error.message);
		// Optionally, you can display an error message to the user or take other actions.
		// For example:
		// const errorContainer = document.querySelector("#error-container");
		// if (errorContainer) {
		//   errorContainer.textContent = "An error occurred while fetching friends.";
		// }
	}
}

/**
 * Retrieves and displays all user chats with friends.
 */
async function getAllChats() {
	try {
		// Fetch the user's friends
		await getAllFriends();

		// Add click event listeners to chat heads
		document.querySelectorAll("[data-conversation]").forEach(function (item) {
			item.addEventListener("click", async function (e) {
				e.preventDefault();
				const chatId = item.id;
				if (!chatSockets[chatId]) {
					// Create a new socket connection for this chat
					chatSockets[chatId] = io("http://127.0.0.1:3000", {
						auth: {
							token: token, // Provide the user's authentication token
						},
					});
					// Handle chat events for this chat
					chatSockets[chatId].on("receive-message", (newMessage) => {
						// Handle incoming messages for this chat
						createMessage(newMessage, profile_picture);
					});
				}

				// Remove 'active' class from all conversations
				document.querySelectorAll(".conversation").forEach(function (i) {
					i.classList.remove("active");
				});

				// Show the selected conversation
				document.querySelector(this.dataset.conversation).classList.add("active");

				// Set the chat as active
				localStorage.setItem("chatActive", "user");

				// // Generate the chat for the selected friend
				await generateChat(chatId);
			});
		});
	} catch (error) {
		console.error("Error in getAllChats:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}

/**
 * Event listener for the button click.
 * Determines the active chat type (user or group) and sends the message accordingly.
 */
button.addEventListener("click", () => {
	try {
		// Get the active chat type from local storage
		const openedChat = localStorage.getItem("chatActive");
		const chatId = localStorage.getItem("currentUser");
		const groupId = localStorage.getItem("currentGroup");

		if (openedChat === "user") {
			console.log("Sending a user message...");
			sendChat(chatId);
		} else if (openedChat === "group") {
			console.log("Sending a group message...");
			sendGroupMsg(groupId);
		} else {
			console.error("Invalid chat type:", openedChat);
		}
	} catch (error) {
		console.error("Error handling button click:", error);
		// Handle errors, display an error message, or take appropriate actions.
	}
});

/**
 * Sends a chat message to the specified receiver in the active conversation.
 */
async function sendChat(chatId) {
	try {
		// Get receiver and conversation type from localStorage
		const receiver = localStorage.getItem("currentUser");
		const conversationType = localStorage.getItem("chatActive");

		// Get the message input box
		const messageBox = document.getElementById("chat-box");

		// Create the message detail object
		const messageDetail = {
			content: messageBox.value,
			receiver: receiver,
			conversation_type: conversationType,
			timeStamp: new Date(),
			messageStatus: "sent",
		};

		// Use the socket associated with this chat
		chatSockets[chatId].emit("send-message", messageDetail);
		createMessage(messageDetail, profile_picture);

		// Clear the message input box after sending
		messageBox.value = "";
	} catch (error) {
		console.error("Error sending chat:", error);
		// Handle the error as needed, e.g., displaying an error message to the user.
	}
}
/**
 * Creates and appends a chat message item to the conversation.
 * @param {Object} item - The message data to be displayed.
 */
async function createMessage(item, profile_picture) {
	console.log(item);
	try {
		// Create a new list item element
		if (item.isAttachment === true) {
			const listItem = document.createElement("li");

			// Determine the CSS class based on message status
			if (item.messageStatus === "received") {
				listItem.classList.add("conversation-item", "me");
			} else {
				listItem.classList.add("conversation-item");
			}

			// Create the conversation-item-side div
			const sideDiv = document.createElement("div");
			sideDiv.classList.add("conversation-item-side");

			// Create the image element
			const image = document.createElement("img");
			image.classList.add("conversation-item-image");
			image.src = `${profile_picture}`; // Use the actual sender's profile picture URL
			image.alt = "";

			// Append the image to the conversation-item-side div
			sideDiv.appendChild(image);

			// Create the conversation-item-content div
			const contentDiv = document.createElement("div");
			contentDiv.classList.add("conversation-item-content");

			// Create the conversation-item-wrapper div
			const wrapperDiv = document.createElement("div");
			wrapperDiv.classList.add("conversation-item-wrapper");

			// Create the conversation-item-box div
			const boxDiv = document.createElement("div");
			boxDiv.classList.add("conversation-item-box");

			// Create the conversation-item-text div
			const textDiv = document.createElement("div");
			textDiv.classList.add("conversation-item-text");

			// Create the paragraph element for the message content
			const messageParagraph = document.createElement("a");
			messageParagraph.textContent = item.content;
			messageParagraph.href = item.fileLocation;

			// Create the conversation-item-time div for the timestamp
			const timeDiv = document.createElement("div");
			timeDiv.classList.add("conversation-item-time");
			timeDiv.textContent = item.createdAt;

			// Append the message content and timestamp to the conversation-item-text div
			textDiv.appendChild(messageParagraph);
			textDiv.appendChild(timeDiv);

			// Create the conversation-item-dropdown div
			const dropdownDiv = document.createElement("div");
			dropdownDiv.classList.add("conversation-item-dropdown");

			// Create the dropdown toggle button
			const toggleButton = document.createElement("button");
			toggleButton.setAttribute("type", "button");
			toggleButton.classList.add("conversation-item-dropdown-toggle");
			toggleButton.innerHTML = `<i class="ri-more-2-line"></i>`;

			// Create the dropdown list
			const dropdownList = document.createElement("ul");
			dropdownList.classList.add("conversation-item-dropdown-list");

			// Create list items with links for the dropdown
			const forwardListItem = document.createElement("li");
			const forwardLink = document.createElement("a");
			forwardLink.href = "#";
			forwardLink.innerHTML = '<i class="ri-share-forward-line"></i> Forward';
			forwardListItem.appendChild(forwardLink);

			const deleteListItem = document.createElement("li");
			const deleteLink = document.createElement("a");
			deleteLink.href = "#";
			deleteLink.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';
			deleteListItem.appendChild(deleteLink);

			// Append the list items to the dropdown list
			dropdownList.appendChild(forwardListItem);
			dropdownList.appendChild(deleteListItem);

			// Append the dropdown toggle button and dropdown list to the conversation-item-dropdown div
			dropdownDiv.appendChild(toggleButton);
			dropdownDiv.appendChild(dropdownList);

			// Append the conversation-item-text and conversation-item-dropdown divs to the conversation-item-box div
			boxDiv.appendChild(textDiv);
			boxDiv.appendChild(dropdownDiv);

			// Append the conversation-item-box div to the conversation-item-wrapper div
			wrapperDiv.appendChild(boxDiv);

			// Append the conversation-item-wrapper div to the conversation-item-content div
			contentDiv.appendChild(wrapperDiv);

			// Append the conversation-item-content div to the list item
			listItem.appendChild(sideDiv);
			listItem.appendChild(contentDiv);

			// Get the conversation-wrapper ul element
			const conversationWrapper = document.querySelector(".conversation-wrapper");

			// Append the list item to the conversation-wrapper ul element
			conversationWrapper.appendChild(listItem);
		} else {
			const listItem = document.createElement("li");

			// Determine the CSS class based on message status
			if (item.messageStatus === "received") {
				listItem.classList.add("conversation-item", "me");
			} else {
				listItem.classList.add("conversation-item");
			}

			// Create the conversation-item-side div
			const sideDiv = document.createElement("div");
			sideDiv.classList.add("conversation-item-side");

			// Create the image element
			const image = document.createElement("img");
			image.classList.add("conversation-item-image");
			image.src = `${profile_picture}`; // Use the actual sender's profile picture URL
			image.alt = "";

			// Append the image to the conversation-item-side div
			sideDiv.appendChild(image);

			// Create the conversation-item-content div
			const contentDiv = document.createElement("div");
			contentDiv.classList.add("conversation-item-content");

			// Create the conversation-item-wrapper div
			const wrapperDiv = document.createElement("div");
			wrapperDiv.classList.add("conversation-item-wrapper");

			// Create the conversation-item-box div
			const boxDiv = document.createElement("div");
			boxDiv.classList.add("conversation-item-box");

			// Create the conversation-item-text div
			const textDiv = document.createElement("div");
			textDiv.classList.add("conversation-item-text");

			// Create the paragraph element for the message content
			const messageParagraph = document.createElement("p");
			messageParagraph.textContent = item.content;

			// Create the conversation-item-time div for the timestamp
			const timeDiv = document.createElement("div");
			timeDiv.classList.add("conversation-item-time");
			timeDiv.textContent = item.createdAt;

			// Append the message content and timestamp to the conversation-item-text div
			textDiv.appendChild(messageParagraph);
			textDiv.appendChild(timeDiv);

			// Create the conversation-item-dropdown div
			const dropdownDiv = document.createElement("div");
			dropdownDiv.classList.add("conversation-item-dropdown");

			// Create the dropdown toggle button
			const toggleButton = document.createElement("button");
			toggleButton.setAttribute("type", "button");
			toggleButton.classList.add("conversation-item-dropdown-toggle");
			toggleButton.innerHTML = `<i class="ri-more-2-line"></i>`;

			// Create the dropdown list
			const dropdownList = document.createElement("ul");
			dropdownList.classList.add("conversation-item-dropdown-list");

			// Create list items with links for the dropdown
			const forwardListItem = document.createElement("li");
			const forwardLink = document.createElement("a");
			forwardLink.href = "#";
			forwardLink.innerHTML = '<i class="ri-share-forward-line"></i> Forward';
			forwardListItem.appendChild(forwardLink);

			const deleteListItem = document.createElement("li");
			const deleteLink = document.createElement("a");
			deleteLink.href = "#";
			deleteLink.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';
			deleteListItem.appendChild(deleteLink);

			// Append the list items to the dropdown list
			dropdownList.appendChild(forwardListItem);
			dropdownList.appendChild(deleteListItem);

			// Append the dropdown toggle button and dropdown list to the conversation-item-dropdown div
			dropdownDiv.appendChild(toggleButton);
			dropdownDiv.appendChild(dropdownList);

			// Append the conversation-item-text and conversation-item-dropdown divs to the conversation-item-box div
			boxDiv.appendChild(textDiv);
			boxDiv.appendChild(dropdownDiv);

			// Append the conversation-item-box div to the conversation-item-wrapper div
			wrapperDiv.appendChild(boxDiv);

			// Append the conversation-item-wrapper div to the conversation-item-content div
			contentDiv.appendChild(wrapperDiv);

			// Append the conversation-item-content div to the list item
			listItem.appendChild(sideDiv);
			listItem.appendChild(contentDiv);

			// Get the conversation-wrapper ul element
			const conversationWrapper = document.querySelector(".conversation-wrapper");

			// Append the list item to the conversation-wrapper ul element
			conversationWrapper.appendChild(listItem);
		}
	} catch (error) {
		console.error("Error creating message:", error);
	}
}

/**
 * Generates the head of the chat section with user data.
 * @param {object} userData - The user data to display in the chat head.
 */
async function generateHead(userData) {
	try {
		const container = document.querySelector(".conversation-user");

		const img = document.createElement("img");
		const divWrapper = document.createElement("div");
		const divName = document.createElement("div");
		const divStatus = document.createElement("div");

		// Set attributes and text content
		img.classList.add("conversation-user-image");
		img.src = userData.profile_picture || "default_profile_image.jpg"; // Provide a default image if profile picture is not available
		img.alt = "User Profile Image";
		divWrapper.classList.add("conversation-user-details");
		divName.classList.add("conversation-user-name");
		divName.textContent = userData.username || "Unknown User"; // Provide a default username if not available
		divStatus.classList.add("conversation-user-status", "online");
		divStatus.textContent = "online";

		// Clear any existing content in the container
		container.innerHTML = "";

		// Append elements to build the structure
		divWrapper.appendChild(divName);
		divWrapper.appendChild(divStatus);
		container.appendChild(img);
		container.appendChild(divWrapper);
		updateChatButtons();
	} catch (error) {
		console.error("Error generating chat head:", error);
		// Handle the error as needed, e.g., displaying a default user image and name.
	}
}

/**
 * Generates the main body of the chat by creating messages.
 * @param {Array} data - An array of chat messages to be displayed.
 */
async function generateMain(data, profile_picture) {
	try {
		// Clear any existing chat messages
		clearChatMessages();

		// Iterate through the chat data and create messages
		for (const item of data) {
			await createMessage(item, profile_picture);
		}
	} catch (error) {
		console.error("Error generating chat messages:", error);
		// Handle the error as needed, e.g., displaying an error message to the user.
	}
}

/**
 * Clears existing chat messages from the chat area.
 */
function clearChatMessages() {
	const chatArea = document.querySelector(".conversation-wrapper");

	chatArea.innerHTML = ""; // Remove all chat messages from the chat area
}

/**
 * Generates a chat interface for the given user.
 * @param {string} id - The ID of the user with whom the chat is generated.
 */
async function generateChat(id) {
	try {
		// Clearing the container
		const container = document.querySelector(".conversation-user");
		container.innerHTML = "";

		// Fetch chat data for the specified user
		const response = await axios.get(`${API_BASE_URL}/user/get-chat/${id}`, {
			headers: { Authorization: token },
		});

		const userData = response.data.user;
		localStorage.setItem("currentUser", id);
		localStorage.setItem("chatStatus", "true");

		// Generate and display the chat head
		await generateHead(userData);
		let messages = 0;
		const chats = await getChatAPI(id);

		if (messages === 0 || messages < chats.length) {
			messages = chats.length;
			await generateMain(chats, profile_picture);
		}

		// Reference to the conversation wrapper
		//
		// const receiver = localStorage.getItem("currentUser");
		// const existingMessages = localStorage.getItem("Messages");
		// const length = JSON.parse(existingMessages).length;
		// const details = { receiver: receiver, existingMessages: length };
	} catch (error) {
		console.error("Error generating chat:", error);
	}
}
/**
 * Fetches all messages of a chat using the API.
 * @param {string} token - Authorization token for API access.
 * @param {Object} details - Details needed for fetching the chat.
 * @returns {Array} An array of chat messages.
 * @throws {Error} If there's an issue with the API request or response.
 */
async function getChatAPI(chatId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/chat/get-chat/${chatId}`, {
			headers: { Authorization: token },
		});

		if (response.status === 200) {
			const messages = response.data.data;
			localStorage.setItem("Messages", JSON.stringify(messages));
			return messages;
		} else {
			throw new Error(`Failed to fetch chat messages. Status code: ${response.status}`);
		}
	} catch (error) {
		console.error("Error fetching chat messages:", error);
		throw error; // Re-throw the error for higher-level handling, if needed.
	}
}

/**
 * Retrieves and displays all friend requests.
 */
async function getRequests() {
	// Remove 'active' class from groupAddDiv
	groupAddDiv.classList.remove("active");

	// Clear the container content
	container.innerHTML = "";

	try {
		// Fetch friend requests from the server
		const response = await axios.get(`${API_BASE_URL}/user/get-requests`, {
			headers: { Authorization: token },
		});

		// Check if the response is successful
		if (response.status === 200) {
			const requests = response.data.data;

			// Create contacts for each request and append them to the container
			for (const contact of requests) {
				createContact(contact);
			}

			// Add click event listeners to request items
			document.querySelectorAll("[data-conversation]").forEach(function (item) {
				item.addEventListener("click", async function (e) {
					e.preventDefault();
					console.log("Opened Chat");

					// Confirm adding the person as a friend
					const confirmation = confirm("Do you want to add this person as your friend?");
					const request = {
						confirmation: confirmation,
						contactId: item.id,
					};

					// Send the request to add the user as a friend
					const response = await axios.post(`${API_BASE_URL}/user/add-user`, request, {
						headers: { Authorization: token },
					});

					// Check if the user was added successfully
					if (response.status === 200) {
						// Remove the request item from the container
						item.parentElement.parentElement.remove(item.parentElement);
						console.log("User added successfully");
					}
				});
			});
		} else {
			console.error("Failed to fetch friend requests. Status code:", response.status);
		}
	} catch (error) {
		console.error("Error in getRequests:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}

/**
 * Adds a new contact by sending a POST request to the server.
 *
 * @param {string} contactId - The ID of the contact to be added.
 */
async function addContact(contactId) {
	try {
		// Prepare the details for adding a contact
		const details = {
			contactId: contactId,
		};

		// Send a POST request to the server to add the contact
		const response = await axios.post(`${API_BASE_URL}/user/add-contact`, details, {
			headers: { Authorization: token },
		});

		// Check if the contact was added successfully
		if (response.status === 200) {
			console.log("Contact added successfully");
			// Optionally, you can perform additional actions after adding the contact.
		} else {
			console.error("Failed to add contact. Status code:", response.status);
			// Optionally, you can handle errors here, such as displaying an error message to the user.
		}
	} catch (error) {
		console.error("Error in addContact:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}

/**
 * Fetches and displays all users who are currently using the app.
 */
async function getAllUsers() {
	try {
		// Remove the 'active' class from certain elements
		groupAddDiv.classList.remove("active");
		container.innerHTML = "";

		// Fetch the list of user contacts using Axios
		const response = await axios.get(`${API_BASE_URL}/user/contacts`, {
			headers: { Authorization: token },
		});

		// Check if the response is successful
		if (response.status === 200) {
			const contacts = response.data.data;

			// Create contacts for each user and append them to the container
			contacts.forEach((contact) => {
				createContact(contact);
			});

			// Add click event listeners to user items to handle adding them as friends
			document.querySelectorAll("[data-conversation]").forEach(function (item) {
				item.addEventListener("click", async function (e) {
					e.preventDefault();
					console.log("Opened Chat");

					const confirmation = confirm("Do you want to add this person as your friend?");
					if (confirmation) {
						const contactId = this.id;
						await addContact(contactId);
					}
				});
			});
		} else {
			console.error("Failed to fetch user contacts. Status code:", response.status);
			// Optionally, you can handle errors here, such as displaying an error message to the user.
		}
	} catch (error) {
		console.error("Error in getAllUsers:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}

/**
 * Creates a group card element and appends it to the container.
 * @param {Object} data - Group data including id, profile_picture, and group_name.
 */
function createGroupCard(data) {
	try {
		// Create the elements
		const li = document.createElement("li");
		const a = document.createElement("a");
		const img = document.createElement("img");
		const info = document.createElement("span");
		const nameSpan = document.createElement("span");
		const textSpan = document.createElement("span");
		const more = document.createElement("span");

		// Set attributes and text content
		a.href = "#";
		a.id = `${data.id}`;
		a.setAttribute("data-conversation", "#conversation-1"); // Set the data-conversation attribute
		img.classList.add("content-message-image");
		img.src = `${data.profile_picture}`;
		img.alt = "";
		nameSpan.classList.add("content-message-name");
		nameSpan.textContent = `${data.group_name}`;
		textSpan.classList.add("content-message-text");
		textSpan.textContent = "No Calls. Only Q Chat";

		// Append elements to build the structure
		a.appendChild(img);
		a.appendChild(info);
		info.appendChild(nameSpan);
		info.appendChild(textSpan);
		a.appendChild(more);
		li.appendChild(a);

		// Append the newly created structure to the container
		container.appendChild(li);
	} catch (error) {
		console.error("Error in createGroupCard:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}

/**
 * Send a group chat message.
 */
async function sendGroupMsg(groupId) {
	try {
		// Get the receiver (current group) and conversation type from local storage
		const receiver = localStorage.getItem("currentGroup");
		const conversation_type = localStorage.getItem("chatActive");

		// Get the message text from the chat box
		const chatBox = document.getElementById("chat-box");
		const message = chatBox.value;

		// Check if the message is empty before sending
		if (!message.trim()) {
			console.log("Message cannot be empty.");
			return;
		}

		// Create a message detail object
		const messageDetail = {
			content: message,
			conversation_type: conversation_type,
			receiver: receiver,
			timeStamp: new Date(),
			messageStatus: "sent",
		};

		//Use the socket associated with this group
		groupSockets[groupId].emit("send-group-message", messageDetail);
		createMessage(messageDetail, profile_picture);

		// Clear the chat box after sending
		chatBox.value = "";
	} catch (error) {
		console.error("Error sending group message:", error.message);
		// You can add additional error handling logic here, such as displaying an error message to the user.
	}
}

/**
 * Fetch and display all groups.
 */
async function getAllGroups() {
	try {
		// Remove 'active' class from certain elements
		conversations[1].classList.remove("active");
		conversations[0].classList.add("active");

		// Clear the container content
		container.innerHTML = "";
		groupAddDiv.classList.toggle("active");

		// Fetch user's groups using Axios
		const response = await axios.get(`${API_BASE_URL}/groups/get-groups`, {
			headers: { Authorization: token },
		});

		if (response && response.data && response.data.data) {
			const groups = response.data.data;

			// Iterate through the fetched groups and create group cards
			for (const group of groups) {
				await createGroupCard(group);
			}

			// Add click event listeners to group cards for opening group chats
			document.querySelectorAll("[data-conversation]").forEach(function (item) {
				item.addEventListener("click", async function (e) {
					e.preventDefault();
					const groupId = item.id;

					if (!groupSockets[groupId]) {
						groupSockets[groupId] = io("http://127.0.0.1:3000", {
							auth: {
								token: token,
							},
						});
						groupSockets[groupId].on("group-message", (newGroupMessage) => {
							createMessage(newGroupMessage, profile_picture);
						});
					}

					document.querySelectorAll(".conversation").forEach(function (i) {
						i.classList.remove("active");
					});
					document.querySelector(this.dataset.conversation).classList.add("active");
					localStorage.setItem("chatActive", "group");
					await generateGroupChat(item.id);
				});
			});
		}
	} catch (error) {
		console.error("Error fetching groups:", error.message);
		// You can add additional error handling logic here, such as displaying an error message to the user.
	}
}

/**
 * Generate the group chat header.
 * @param {Object} userData - User/group data containing profile information.
 */
async function groupHead(userData) {
	try {
		const container = document.querySelector(".conversation-user");

		const img = document.createElement("img");
		const divWrapper = document.createElement("div");
		const divName = document.createElement("div");
		const divStatus = document.createElement("div");

		// Set attributes and text content
		img.classList.add("conversation-user-image");
		img.src = `${userData.profile_picture}`;
		img.alt = "";
		divWrapper.classList.add("conversation-user-details");
		divName.classList.add("conversation-user-name");
		divName.textContent = `${userData.group_name}`;
		divStatus.classList.add("conversation-user-status", "online");
		divStatus.textContent = "online";

		// Append elements to build the structure
		divWrapper.appendChild(divName);
		divWrapper.appendChild(divStatus);

		// Clear the container before appending new elements
		container.innerHTML = "";

		// Append the newly created structure to the container
		container.appendChild(img);
		container.appendChild(divWrapper);
		updateChatButtons();
	} catch (error) {
		console.error("Error generating group header:", error.message);
		// You can add additional error handling logic here, such as displaying an error message to the user.
	}
}

/**
 * Generate the main content of the group chat.
 * @param {Object} data - Data containing previous chat messages.
 */
async function groupMain(data, profile_picture) {
	try {
		// Loop through previous chat messages and create messages asynchronously
		for (const item of data) {
			console.log(item);
			await createMessage(item, profile_picture);
		}
	} catch (error) {
		console.error("Error generating group chat main content:", error.message);
		// You can add additional error handling logic here, such as displaying an error message to the user.
	}
}

/**
 * Get group chat messages from the server.
 * @param {string} token - User's authentication token.
 * @param {Object} details - Details for fetching group chat messages.
 * @returns {Promise<Object>} A promise that resolves to the response from the server.
 */
async function getGroupAPI(groupId) {
	try {
		const response = await axios.get(`${API_BASE_URL}/chat/get-groupchat/${groupId}`, {
			headers: { Authorization: token },
		});

		if (response.status === 200) {
			const groupMessages = response.data.data;
			localStorage.setItem("GroupMessages", JSON.stringify(groupMessages));
			return groupMessages;
		} else {
			console.error("Failed to fetch group chat messages. Status code:", response.status);
		}
	} catch (error) {
		console.error("Error while fetching group chat messages:", error.message);
		throw error; // Rethrow the error to handle it further up the call stack if needed.
	}
}

/**
 * Generates and displays a group chat.
 * @param {string} id - The ID of the group chat.
 */
async function generateGroupChat(id) {
	const container = document.querySelector(".conversation-user");
	container.innerHTML = "";

	try {
		const response = await axios.get(`${API_BASE_URL}/user/get-group-chat/${id}`, {
			headers: { Authorization: token },
		});

		const userData = response.data.group;
		localStorage.setItem("currentGroup", userData.id);
		localStorage.setItem("chatStatus", "true");
		await groupHead(userData);

		// Assuming you have a reference to the container element where you want to append this structure

		// Main chat area
		const conversationWrapper = document.querySelector(".conversation-wrapper");

		let groupMessages = 0;
		const groupChats = await getGroupAPI(id);

		if (groupMessages === 0 || groupChats < groupChats.length) {
			groupMessages = groupChats.length;
			await groupMain(groupChats, userData.profile_picture);
		}

		// Clear the interval when needed (e.g., when leaving the chat page)
		// clearInterval(messageInterval);
	} catch (error) {
		console.error("Error while generating group chat:", error.message);
	}
}

/**
 * Clears the container content and removes the 'active' class from groupAddDiv.
 * @returns {Promise<void>}
 */
async function getSettings() {
	try {
		// Clear the container content
		container.innerHTML = "";

		// Remove 'active' class from groupAddDiv
		groupAddDiv.classList.remove("active");
	} catch (error) {
		console.error("Error in getSettings:", error);
		// Handle errors, display an error message, or take appropriate actions.
	}
}

/**
 * Clears the container content, removes the 'active' class from groupAddDiv, and logs a message.
 * @returns {Promise<void>}
 */
async function getProfile() {
	try {
		console.log("Getting profile");

		// Clear the container content
		container.innerHTML = "";

		// Remove 'active' class from groupAddDiv
		groupAddDiv.classList.remove("active");
	} catch (error) {
		console.error("Error in getProfile:", error);
		// Handle errors, display an error message, or take appropriate actions.
	}
}

/**
 * Displays a modal for creating a group.
 */
function createGroup() {
	console.log("create group");
	const modal = document.getElementById("myModal");
	const closeModal = document.getElementById("closeModal");

	// Show the modal
	modal.style.display = "block";

	// Close the modal when the close button is clicked
	closeModal.addEventListener("click", function () {
		modal.style.display = "none";
	});

	// Close the modal when clicking outside of it
	window.addEventListener("click", function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	});
}

/**
 * Event listener for the infoButton click.
 * Opens a modal to manage group members if the user is an admin.
 */
infoButton.addEventListener("click", async () => {
	const groupId = localStorage.getItem("currentGroup");

	try {
		// Check if the user is an admin of the group
		const checkAdmin = await axios.get(`${API_BASE_URL}/groups/${groupId}/isAdmin`, {
			headers: { Authorization: token },
		});
		const { isAdmin } = checkAdmin.data;

		if (isAdmin === true) {
			// Open the modal to manage group members
			addMembersModal.style.display = "block";

			// Fetch the list of group members using Axios
			const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/contacts`, {
				headers: { Authorization: token },
			});

			const { nonExistingUsers, existingUsers, nonAdminUsers } = response.data.data;
			const addUserBoxes = document.getElementById("invite-members");
			const existingUserBoxes = document.getElementById("group-members");
			const addAdminBoxes = document.getElementById("add-admin");
			addUserBoxes.innerHTML = "";
			existingUserBoxes.innerHTML = "";
			if (nonExistingUsers.length > 0) {
				addUserBoxes.innerHTML = `<p>Invite Users</p> <br/>`;
				const boxedDiv = document.createElement("div");
				nonExistingUsers.forEach((nonExistingUser) => {
					const checkBox = document.createElement("input");
					checkBox.type = "checkbox";
					checkBox.name = "addUsers";
					checkBox.value = nonExistingUser.id;
					checkBox.id = `addUserBox-${nonExistingUser.id}`;

					const label = document.createElement("label");
					label.setAttribute("for", `addUserBox-${nonExistingUser.id}`);
					label.innerText = nonExistingUser.username;

					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const addMembersbutton = document.createElement("button");

				// Set attributes and properties for the button
				addMembersbutton.setAttribute("type", "submit");
				addMembersbutton.setAttribute("id", "confirmAddMembersBtn");
				addMembersbutton.textContent = "Add Members";
				buttonDiv.appendChild(addMembersbutton);

				addUserBoxes.appendChild(boxedDiv);
				addUserBoxes.appendChild(buttonDiv);
				addMembersbutton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						// Get all checkboxes with the name "selectedUsers"
						const checkboxes = document.querySelectorAll('input[name="addUsers"]');

						// Create an array to store the IDs of checked checkboxes
						const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								// If a checkbox is checked, add its value (which should be the user ID) to the array
								checkedUserIds.push(checkbox.value);
							}
						});

						// Prepare the data for the group invitation
						const details = {
							user_ids: checkedUserIds,
						};

						// Get the current group's ID from local storage
						//groupId
						const getGroup = JSON.parse(localStorage.getItem("currentGroup"));

						// Send an invite to the selected users
						const response = await axios.post(`${API_BASE_URL}/groups/${getGroup}/invite`, details, {
							headers: { Authorization: token },
						});

						// // Handle the response as needed
						console.log("Invitation sent successfully:", response);

						// Close the "Add Members" modal
						addMembersModal.style.display = "none";

						// You can perform additional actions based on the response, such as updating the UI.
					} catch (error) {
						console.error("Error handling Add Member button click:", error);

						// Handle errors, display an error message, or take appropriate actions.
					}
				});
			}
			if (existingUsers.length > 0) {
				existingUserBoxes.innerHTML = `<p>Manage users</p> <br/>`;
				const boxedDiv = document.createElement("div");
				existingUsers.forEach((existingUser) => {
					const checkBox = document.createElement("input");
					checkBox.type = "checkbox";
					checkBox.name = "deleteusers";
					checkBox.value = existingUser.id;
					checkBox.id = `addUserBox-${existingUser.id}`;

					const label = document.createElement("label");
					label.setAttribute("for", `addUserBox-${existingUser.id}`);
					label.innerText = existingUser.username;
					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const delbutton = document.createElement("button");

				// Set attributes and properties for the button
				delbutton.setAttribute("type", "submit");
				delbutton.setAttribute("id", "deleteUserButton");
				delbutton.textContent = "Delete Member";
				buttonDiv.appendChild(delbutton);

				existingUserBoxes.appendChild(boxedDiv);
				existingUserBoxes.appendChild(buttonDiv);
				delbutton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						// Get all checkboxes with the name "selectedUsers"
						const checkboxes = document.querySelectorAll('input[name="deleteusers"]');

						// Create an array to store the IDs of checked checkboxes
						const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								// If a checkbox is checked, add its value (which should be the user ID) to the array
								checkedUserIds.push(checkbox.value);
							}
						});

						// Prepare the data for the group invitation
						const details = {
							user_ids: checkedUserIds,
						};

						// Send an invite to the selected users
						const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/delete`, details, {
							headers: { Authorization: token },
						});

						// // Handle the response as needed
						console.log("User removed  successfully:", response);

						// Close the "Add Members" modal
						addMembersModal.style.display = "none";

						// You can perform additional actions based on the response, such as updating the UI.
					} catch (error) {
						console.error("Error handling Add Member button click:", error);

						// Handle errors, display an error message, or take appropriate actions.
					}
				});
			}
			if (nonAdminUsers.length > 0) {
				addAdminBoxes.innerHTML = `<p>Make Admin</p> <br/>`;
				const boxedDiv = document.createElement("div");
				nonAdminUsers.forEach((nonAdminUser) => {
					const checkBox = document.createElement("input");
					checkBox.type = "checkbox";
					checkBox.name = "makeadmin";
					checkBox.value = nonAdminUser.id;
					checkBox.id = `addUserBox-${nonAdminUser.id}`;

					const label = document.createElement("label");
					label.setAttribute("for", `addUserBox-${nonAdminUser.id}`);
					label.innerText = nonAdminUser.username;
					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const addAdminButton = document.createElement("button");

				// Set attributes and properties for the button
				addAdminButton.setAttribute("type", "submit");
				addAdminButton.setAttribute("id", "makeAdminButton");
				addAdminButton.textContent = "Make Admin";
				buttonDiv.appendChild(addAdminButton);

				addAdminBoxes.appendChild(boxedDiv);
				addAdminBoxes.appendChild(buttonDiv);

				addAdminButton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						// Get all checkboxes with the name "selectedUsers"
						const checkboxes = document.querySelectorAll('input[name="makeadmin"]');

						// Create an array to store the IDs of checked checkboxes
						const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								// If a checkbox is checked, add its value (which should be the user ID) to the array
								checkedUserIds.push(checkbox.value);
							}
						});

						// Prepare the data for the group invitation
						const details = {
							user_ids: checkedUserIds,
						};

						// Send an invite to the selected users
						const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/admin`, details, {
							headers: { Authorization: token },
						});

						// // Handle the response as needed
						console.log("Admin updated  successfully:", response);

						// Close the "Add Members" modal
						addMembersModal.style.display = "none";

						// You can perform additional actions based on the response, such as updating the UI.
					} catch (error) {
						console.error("Error handling Add Member button click:", error);

						// Handle errors, display an error message, or take appropriate actions.
					}
				});
			}
		}
	} catch (error) {
		console.error("Error handling infoButton click:", error);
		// You can add specific error handling for different error scenarios here.
	}
});

/**
 * Close the "Add Members" modal when the close button is clicked.
 */
closeAddMembersModal.addEventListener("click", () => {
	addMembersModal.style.display = "none";
});

/**
 * Close the "Add Members" modal when the cancel button is clicked.
 */
cancelAddMemberButton.addEventListener("click", () => {
	addMembersModal.style.display = "none";
});

async function getSelfDetails() {
	const selfDetails = await axios.get(`${API_BASE_URL}/user/self`, { headers: { Authorization: token } });
	profile_picture = selfDetails.data.data.profile_picture;
}
getSelfDetails();
