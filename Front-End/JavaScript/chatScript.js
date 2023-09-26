//
const token = localStorage.getItem("token");
const API_BASE_URL = "http://localhost:3000";
const container = document.querySelector(".content-messages-list");
const contentMessagesContainer = document.getElementsByClassName("group-add");
const groupAddDiv = document.getElementById("groupAddDiv");
const modalOpen = document.getElementById("add-group-link");
const button = document.getElementById("submit-button");
const conversations = document.querySelectorAll(".conversation");
const addMemberButton = document.getElementById("confirmAddMembersBtn");
const cancelAddMemberButton = document.getElementById("cancelAddMembersBtn");

// infoButton.addEventListener("click", openInfo);
button.addEventListener("click", () => {
  const openedChat = localStorage.getItem("chatActive");
  if (openedChat === "user") {
    console.log("user");
    sendChat();
  } else {
    sendGroupMsg();
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const menuItems = document.querySelectorAll(".chat-sidebar-menu li");
  const contentSidebarTitle = document.querySelector(".content-sidebar-title");
  const messages = localStorage.getItem("Messages");
  const groupMessages = localStorage.getItem("GroupMessages");

  if (groupMessages === null) {
    let groupMessages = [];
    localStorage.setItem("GroupMessages", JSON.stringify(groupMessages));
  }
  if (messages === null) {
    let messages = [];
    localStorage.setItem("Messages", JSON.stringify(messages));
  }
  menuItems.forEach((item) => {
    item.addEventListener("click", async function (event) {
      event.preventDefault();
      const previouslyActiveItem = document.querySelector(
        ".chat-sidebar-menu li.active"
      );
      if (previouslyActiveItem) {
        previouslyActiveItem.classList.remove("active");
      }
      item.classList.add("active");
      contentSidebarTitle.textContent = item.children[0].dataset.title;
      if (item.dataset.title !== undefined) {
        contentSidebarTitle.textContent = item.dataset.title;
      }
      if (item.classList.contains("active")) {
        switch (item.children[0].dataset.title) {
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
});
// start: Sidebar
document
  .querySelector(".chat-sidebar-profile-toggle")
  .addEventListener("click", function (e) {
    e.preventDefault();
    this.parentElement.classList.toggle("active");
  });

document.addEventListener("click", function (e) {
  if (!e.target.matches(".chat-sidebar-profile, .chat-sidebar-profile *")) {
    document.querySelector(".chat-sidebar-profile").classList.remove("active");
  }
});
// end: Sidebar

// start: Coversation
document
  .querySelectorAll(".conversation-item-dropdown-toggle")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      if (this.parentElement.classList.contains("active")) {
        this.parentElement.classList.remove("active");
      } else {
        document
          .querySelectorAll(".conversation-item-dropdown")
          .forEach(function (i) {
            i.classList.remove("active");
          });
        this.parentElement.classList.add("active");
      }
    });
  });

document.addEventListener("click", function (e) {
  if (
    !e.target.matches(
      ".conversation-item-dropdown, .conversation-item-dropdown *"
    )
  ) {
    document
      .querySelectorAll(".conversation-item-dropdown")
      .forEach(function (i) {
        i.classList.remove("active");
      });
  }
});

document.querySelectorAll(".conversation-form-input").forEach(function (item) {
  item.addEventListener("input", function () {
    this.rows = this.value.split("\n").length;
  });
});

document.querySelectorAll("[data-conversation]").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".conversation").forEach(function (i) {
      i.classList.remove("active");
    });
    document.querySelector(this.dataset.conversation).classList.add("active");
  });
});

document.querySelectorAll(".conversation-back").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    this.closest(".conversation").classList.remove("active");
    document.querySelector(".conversation-default").classList.add("active");
  });
});
// end: Coversation
modalOpen.addEventListener("click", () => {
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
    e.preventDefault();
    // Add your code to handle form submission here
    // For example, you can access form input values using document.getElementById
    const groupName = document.getElementById("groupName").value;
    const groupDescription = document.getElementById("groupDescription").value;
    const groupUsers = document.getElementById("groupUsers").value;

    const groupDetails = {
      name: groupName,
      description: groupDescription,
      users: groupUsers,
    };
    console.log(groupDetails);
    const response = await axios.post(
      `${API_BASE_URL}/groups/create-group`,
      groupDetails,
      { headers: { Authorization: token } }
    );
    console.log(response);

    // Perform form validation and submission logic here
    // After submission, you can close the modal if needed
    modal.style.display = "none"; // Hide the modal after submission
  });

  // Add an event listener to cancel and close the modal
  cancelButton.addEventListener("click", () => {
    modal.style.display = "none"; // Hide the modal
  });
});

document.addEventListener("DOMContentLoaded", getAllChats());

//Function to get all chats
async function getAllChats() {
  try {
    //Here we will get the friends of the user
    await getAllFriends();
    // this will allow them to start chat with the user
    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelectorAll(".conversation").forEach(function (i) {
          i.classList.remove("active");
        });
        document
          .querySelector(this.dataset.conversation)
          .classList.add("active");
        localStorage.setItem("chatActive", "user");
        //when the user clicks on the chat head a chat will be generated
        await generateChat(item.id);
      });
    });
  } catch (error) {
    console.log(error, "error getting all friends", error.message);
  }
}
async function getAllGroups() {
  conversations[1].classList.remove("active");
  conversations[0].classList.add("active");

  container.innerHTML = "";
  groupAddDiv.classList.toggle("active");
  const response = await axios.get(`${API_BASE_URL}/groups/get-groups`, {
    headers: { Authorization: token },
  });
  response.data.data.forEach(async (group) => {
    createGroupCard(group);
  });
  document.querySelectorAll("[data-conversation]").forEach(function (item) {
    item.addEventListener("click", async function (e) {
      e.preventDefault();
      document.querySelectorAll(".conversation").forEach(function (i) {
        i.classList.remove("active");
      });
      document.querySelector(this.dataset.conversation).classList.add("active");
      localStorage.setItem("chatActive", "group");
      await generateGroupChat(item.id);
    });
  });
}
async function getAllFriends() {
  try {
    groupAddDiv.classList.remove("active");
    conversations[1].classList.remove("active");
    conversations[0].classList.add("active");
    container.innerHTML = "";

    const response = await axios.get(`${API_BASE_URL}/user/friends`, {
      headers: { Authorization: token },
    });
    for (const contact of response.data.data) {
      if (contact.id !== contact.userId) {
        createContact(contact);
      }
    }
  } catch (error) {
    console.log(error, "error getting all friends", error.message);
  }
}
async function getRequests() {
  groupAddDiv.classList.remove("active");
  container.innerHTML = "";
  try {
    const response = await axios.get(`${API_BASE_URL}/user/get-requests`, {
      headers: { Authorization: token },
    });
    for (const contact of response.data.data) {
      createContact(contact);
    }
    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("Opened Chat");

        const confirmation = confirm(
          "Do you want to add this person as your friend?"
        );
        const request = {
          confirmation: confirmation,
          contactId: item.id,
        };
        console.log(request);
        const response = await axios.post(
          `${API_BASE_URL}/user/add-user`,
          request,
          { headers: { Authorization: token } }
        );
        console.log(response);
        if (response.status === 200) {
          item.parentElement.parentElement.remove(item.parentElement);
          console.log("User added successfully");
        }
      });
    });
  } catch (error) {
    console.log("Error adding contact");
  }
}
async function getAllUsers() {
  try {
    groupAddDiv.classList.remove("active");
    container.innerHTML = "";
    const response = await axios.get(`${API_BASE_URL}/user/contacts`, {
      headers: { Authorization: token },
    });
    for (const contact of response.data.data) {
      createContact(contact);
    }

    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("Opened Chat");

        const confirmation = confirm(
          "Do you want to add this person as your friend?"
        );
        if (confirmation) {
          const contactId = this.id;
          await addContact(contactId);
        }
      });
    });
  } catch (error) {
    console.log("Error getting all contacts", error.message);
  }
}
async function getSettings() {
  container.innerHTML = "";
  groupAddDiv.classList.remove("active");
}
async function getProfile() {
  console.log("Getting profile");
  groupAddDiv.classList.remove("active");

  container.innerHTML = "";
}
//creates the contact label
async function createContact(data) {
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
  a.setAttribute("data-conversation", "#conversation-1"); //  // Set the data-conversation attribute
  img.classList.add("content-message-image");
  console.log();
  img.src = `${data.profile_picture}`;
  img.alt = "";
  nameSpan.classList.add("content-message-name");
  nameSpan.textContent = `${data.username}`;
  textSpan.classList.add("content-message-text");
  textSpan.textContent = "No Calls.Only Q Chat";

  // Append elements to build the structure
  a.appendChild(img);
  a.appendChild(info);
  info.appendChild(nameSpan);
  info.appendChild(textSpan);
  a.appendChild(more);
  li.appendChild(a);

  // Append the newly created structure to the container
  container.appendChild(li);
}
//generates chat
async function generateChat(id) {
  // clearing the container
  const container = document.querySelector(".conversation-user");
  container.innerHTML = "";

  try {
    const response = await axios.get(`${API_BASE_URL}/user/get-chat/${id}`, {
      headers: { Authorization: token },
    });
    const userData = response.data.user;
    localStorage.setItem("currentUser", userData.id);
    localStorage.setItem("chatStatus", "true");
    await generateHead(userData);

    // Assuming you have a reference to the container element where you want to append this structure

    //main
    const conversationWrapper = document.querySelector(".conversation-wrapper");

    setInterval(async () => {
      // Apply fade-out transition
      conversationWrapper.classList.remove("fade-in");
      conversationWrapper.classList.add("fade-out");

      setTimeout(async () => {
        const receiver = localStorage.getItem("currentUser");
        const existingMessages = localStorage.getItem("Messages");
        const length = JSON.parse(existingMessages).length;
        const details = { receiver: receiver, existingMessages: length };

        let messages = 0;
        const response = await getChatAPI(token, details);
        if (messages === 0 || messages < response.length) {
          conversationWrapper.innerHTML = "";
          conversationWrapper.classList.remove("fade-out");
          messages = response.length;
          await generateMain(response);
        }
        conversationWrapper.classList.add("fade-in");
      }, 500);
    }, 1000);
  } catch (error) {
    console.log(error);
  }
}
//genreates the head of the chat section
async function generateHead(userData) {
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
  divName.textContent = `${userData.username}`;
  divStatus.classList.add("conversation-user-status", "online");
  divStatus.textContent = "online";

  // Append elements to build the structure
  divWrapper.appendChild(divName);
  divWrapper.appendChild(divStatus);

  // Append the newly created structure to the container
  container.appendChild(img);
  container.appendChild(divWrapper);
}
//gets alll the messages of the chat
async function getChatAPI(token, details) {
  const response = await axios.post(`${API_BASE_URL}/chat/get-chat`, details, {
    headers: { Authorization: token },
  });
  localStorage.setItem("Messages", JSON.stringify(response.data.data));
  const messages = JSON.parse(localStorage.getItem("Messages"));
  return messages;
}
//genereates the manin body
async function generateMain(data) {
  try {
    const previousChats = data.forEach(async (item) => {
      await createMessage(item);
    });
  } catch (error) {
    console.log(error);
  }
}
//creates message
async function createMessage(item) {
  // Create a new list item element
  const listItem = document.createElement("li");
  if (item.messageStatus === "recieved") {
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
  image.src =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";
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
  messageParagraph.textContent = `${item.content}`;
  // Create the conversation-item-time div for the timestamp
  const timeDiv = document.createElement("div");
  timeDiv.classList.add("conversation-item-time");
  const time = item.createdAt;
  timeDiv.textContent = `${time.slice(11, 16)}`;
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
//function to add contact
async function addContact(contactId) {
  try {
    const details = {
      contactId: contactId,
    };
    const response = await axios.post(
      `${API_BASE_URL}/user/add-contact`,
      details,
      {
        headers: { Authorization: token },
      }
    );
  } catch (error) {
    console.log("Error adding contact");
  }
}
//function to send chat
async function sendChat() {
  const receiver = localStorage.getItem("currentUser");
  const converstaion_type = localStorage.getItem("chatActive");
  try {
    const box = document.getElementById("chat-box");
    const detail = {
      message: box.value,
      receiver: receiver,
      converstaion_type: converstaion_type,
    };
    const respone = await axios.post(`${API_BASE_URL}/chat/send-chat`, detail, {
      headers: { Authorization: token },
    });

    box.value = "";
  } catch (error) {}
}

//Groups
//genreate Group Chat
async function generateGroupChat(id) {
  const container = document.querySelector(".conversation-user");
  container.innerHTML = "";

  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/get-group-chat/${id}`,
      {
        headers: { Authorization: token },
      }
    );

    const userData = response.data.group;
    localStorage.setItem("currentGroup", userData.id);
    localStorage.setItem("chatStatus", "true");
    await groupHead(userData);

    // Assuming you have a reference to the container element where you want to append this structure

    //main
    const conversationWrapper = document.querySelector(".conversation-wrapper");
    setInterval(async () => {
      // Apply fade-out transition
      conversationWrapper.classList.remove("fade-in");
      conversationWrapper.classList.add("fade-out");

      setTimeout(async () => {
        const receiver = localStorage.getItem("currentGroup");
        const existingMessages = localStorage.getItem("GroupMessages");
        const details = { receiver: receiver, existingMessages: length };

        let messages = 0;
        const response = await getGroupAPI(token, details);
        if (messages === 0 || messages < response.length) {
          conversationWrapper.innerHTML = "";
          conversationWrapper.classList.remove("fade-out");
          messages = response.length;
          await groupMain(response);
        }
        conversationWrapper.classList.add("fade-in");
      }, 500);
    }, 1000);
  } catch (error) {}
}
//generate groupHead
async function groupHead(userData) {
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

  // Append the newly created structure to the container
  container.appendChild(img);
  container.appendChild(divWrapper);
}
//get group messages

async function getGroupAPI(token, details) {
  const response = await axios.post(
    `${API_BASE_URL}/chat/get-groupchat`,
    details,
    { headers: { Authorization: token } }
  );
  localStorage.setItem("GroupMessages", JSON.stringify(response.data.data));
  return response;

  // return messages;
}
async function groupMain(data) {
  try {
    const previousChats = data.data.data.forEach(async (item) => {
      await createMessage(item);
    });
  } catch (error) {
    console.log(error);
  }
}
async function createGroupMsg() {}
function createGroupCard(data) {
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
  a.setAttribute("data-conversation", "#conversation-1"); //  // Set the data-conversation attribute
  img.classList.add("content-message-image");
  console.log();
  img.src = `${data.profile_picture}`;
  img.alt = "";
  nameSpan.classList.add("content-message-name");
  nameSpan.textContent = `${data.group_name}`;
  textSpan.classList.add("content-message-text");
  textSpan.textContent = "No Calls.Only Q Chat";

  // Append elements to build the structure
  a.appendChild(img);
  a.appendChild(info);
  info.appendChild(nameSpan);
  info.appendChild(textSpan);
  a.appendChild(more);
  li.appendChild(a);

  // Append the newly created structure to the container
  container.appendChild(li);
}
async function sendGroupMsg() {
  const receiver = localStorage.getItem("currentGroup");
  const converstaion_type = localStorage.getItem("chatActive");
  try {
    const box = document.getElementById("chat-box");
    const detail = {
      message: box.value,
      receiver: receiver,
      converstaion_type: converstaion_type,
    };
    const response = await axios.post(
      `${API_BASE_URL}/chat/send-group-chat`,
      detail,
      { headers: { Authorization: token } }
    );
    box.value = "";
  } catch (error) {
    console.log("error sending message");
  }
}

function addDivider() {
  // Create a new div element for the divider
  var divider = document.createElement("div");
  divider.className = "conversation-divider";

  // Create a span element for the anchor tag
  var span = document.createElement("span");

  // Create an anchor tag
  var anchor = document.createElement("a");
  anchor.href = "#"; // You can set the href attribute to your desired link
  anchor.textContent = "Load Previous Elements";

  // Append the anchor tag to the span
  span.appendChild(anchor);

  // Append the span to the divider
  divider.appendChild(span);

  // Append the divider to the conversation container
  var conversation = document.getElementById("conversation");
  conversation.appendChild(divider);
}
async function createGroup() {
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
const modalButton = document.getElementById("confirmBtn");
modalButton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Group Created");
});

// JavaScript code to open the "Add Members" modal
const infoButton = document.getElementById("info-button");
const addMembersModal = document.getElementById("addMembersModal");
const closeAddMembersModal = document.getElementById("closeAddMembersModal");

infoButton.addEventListener("click", async () => {
  const groupId = localStorage.getItem("currentGroup");
  try {
    const checkAdmin = await axios.get(
      `${API_BASE_URL}/groups/${groupId}/isAdmin`,
      {
        headers: { Authorization: token },
      }
    );
    const { isAdmin } = checkAdmin.data;
    if (isAdmin === true) {
      // Open the modal
      addMembersModal.style.display = "block";

      // Fetch the user list using Axios
      const response = await axios.get(`${API_BASE_URL}/user/contacts`, {
        headers: { Authorization: token },
      });
      const users = response.data.data;
      const userCheckboxes = document.getElementById("userCheckboxes");
      userCheckboxes.innerHTML = "";

      users.forEach((user) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "selectedUsers";
        checkbox.value = user.id;
        checkbox.id = `userCheckbox-${user.id}`;

        const label = document.createElement("label");
        label.setAttribute("for", `userCheckbox-${user.id}`);
        label.innerText = user.username;

        userCheckboxes.appendChild(checkbox);
        userCheckboxes.appendChild(label);
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// Close the "Add Members" modal when the close button is clicked
closeAddMembersModal.addEventListener("click", () => {
  addMembersModal.style.display = "none";
});

cancelAddMemberButton.addEventListener("click", () => {
  addMembersModal.style.display = "none";
});

addMemberButton.addEventListener("click", async (e) => {
  e.preventDefault();
  // Get all checkboxes with the name "selectedUsers"
  const checkboxes = document.querySelectorAll('input[name="selectedUsers"]');

  // Create an array to store the IDs of checked checkboxes
  const checkedUserIds = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      // If a checkbox is checked, add its value (which should be the user ID) to the array
      checkedUserIds.push(checkbox.value);
    }
  });
  const details = {
    user_ids: checkedUserIds,
  };
  const getGroup = JSON.parse(localStorage.getItem("currentGroup"));
  const response = await axios.post(
    `${API_BASE_URL}/groups/${getGroup}/invite`,
    details,
    { headers: { Authorization: token } }
  );

  // Now, checkedUserIds contains the IDs of all checked checkboxes
  console.log("Checked User IDs:", checkedUserIds);
  addMembersModal.style.display = "none";

  // You can then use this array to perform further actions, such as adding the selected users to a group.
});
