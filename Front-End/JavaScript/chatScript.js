document.addEventListener("DOMContentLoaded", async function () {
  const menuItems = document.querySelectorAll(".chat-sidebar-menu li");
  const contentSidebarTitle = document.querySelector(".content-sidebar-title");
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
        if (item.children[0].dataset.title === "Chats") {
          await getAllChats();
        } else if (item.children[0].dataset.title === "Add-Friends") {
          await getAllUsers();
        } else if (item.children[0].dataset.title === "Groups") {
          await getAllGroups();
        } else if (item.children[0].dataset.title === "Settings") {
          await getSettings();
        } else if (item.dataset.title === "Profile") {
          await getProfile();
        } else if (item.children[0].dataset.title === "Friends") {
          await getAllFriends();
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
console.log(document.querySelectorAll("[data-conversation]"));

document.querySelectorAll(".conversation-back").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    this.closest(".conversation").classList.remove("active");
    document.querySelector(".conversation-default").classList.add("active");
  });
});
// end: Coversation

document.addEventListener("DOMContentLoaded", getAllChats());

async function getAllChats() {
  const token = localStorage.getItem("token");
  const container = document.querySelector(".content-messages-list");
  container.innerHTML = "";

  try {
    const response = await axios.get("http://localhost:3000/user/friends", {
      headers: { Authorization: token },
    });

    await response.data.data.forEach((contact) => {
      createContact(contact);
    });
    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        document.querySelectorAll(".conversation").forEach(function (i) {
          i.classList.remove("active");
        });
        document
          .querySelector(this.dataset.conversation)
          .classList.add("active");
        await generateChat(item.id);
      });
    });
  } catch (error) {
    console.log(error, "error getting all friends");
  }
}
async function getAllFriends() {
  const token = localStorage.getItem("token");
  const container = document.querySelector(".content-messages-list");
  const conversations = document.querySelectorAll(".conversation");
  conversations[1].classList.remove("active");
  conversations[0].classList.add("active");
  container.innerHTML = "";
  try {
    const response = await axios.get("http://localhost:3000/user/friends", {
      headers: { Authorization: token },
    });

    await response.data.data.forEach((contact) => {
      createContact(contact);
    });
    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        const confirmation = confirm("Do you want to start Chattting?");
        if (confirmation) {
          const contactId = this.id;
        }
      });
    });
  } catch (error) {
    console.log(error, "error getting all friends");
  }
}
async function getAllUsers() {
  const token = localStorage.getItem("token");
  const container = document.querySelector(".content-messages-list");
  container.innerHTML = "";
  try {
    const response = await axios.get("http://localhost:3000/user/contacts", {
      headers: { Authorization: token },
    });
    await response.data.data.forEach((contact) => {
      createContact(contact);
    });

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
    console.log("Error getting all contacts");
  }
}
async function getAllGroups() {
  console.log("Getting all groups");
  const container = document.querySelector(".content-messages-list");
  container.innerHTML = "";
}
async function getSettings() {
  console.log("Getting settings");
  const container = document.querySelector(".content-messages-list");
  container.innerHTML = "";
}
async function getProfile() {
  console.log("Getting profile");
  const container = document.querySelector(".content-messages-list");
  container.innerHTML = "";
}
async function addContact(contactId) {
  const token = localStorage.getItem("token");
  try {
    const details = {
      contactId: contactId,
    };
    const response = await axios.post(
      "http://localhost:3000/user/add-contact",
      details,
      { headers: { Authorization: token } }
    );
  } catch (error) {
    console.log("Error adding contact");
  }
}
function createContact(data) {
  const container = document.querySelector(".content-messages-list");
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
  img.src =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";
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
async function generateChat(id) {
  const container = document.querySelector(".conversation-user");
  container.innerHTML = "";
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://localhost:3000/user/get-chat/${id}`,
      { headers: { Authorization: token } }
    );
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
        const token = localStorage.getItem("token");
        const receiver = localStorage.getItem("currentUser");
        const details = { receiver: receiver };
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
  } catch (error) {}
}

const button = document.getElementById("submit-button");
button.addEventListener("click", sendChat);
async function sendChat() {
  const token = localStorage.getItem("token");
  const receiver = localStorage.getItem("currentUser");
  try {
    const box = document.getElementById("chat-box");
    const detail = {
      message: box.value,
      receiver: receiver,
    };
    const respone = await axios.post(
      "http://localhost:3000/chat/send-chat",
      detail,
      { headers: { Authorization: token } }
    );

    box.value = "";
  } catch (error) {}
}
async function generateHead(userData) {
  const container = document.querySelector(".conversation-user");

  const img = document.createElement("img");
  const divWrapper = document.createElement("div");
  const divName = document.createElement("div");
  const divStatus = document.createElement("div");

  // Set attributes and text content
  img.classList.add("conversation-user-image");
  img.src =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";
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
async function getChatAPI(token, details) {
  const response = await axios.post(
    "http://localhost:3000/chat/get-chat",
    details,
    {
      headers: { Authorization: token },
    }
  );
  localStorage.setItem("Messages", JSON.stringify(response.data.data));
  const messages = JSON.parse(localStorage.getItem("Messages"));
  return messages;
}
async function generateMain(data) {
  try {
    const previousChats = data.forEach(async (item) => {
      await createMessage(item);
    });
  } catch (error) {
    console.log(error);
  }
}
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
