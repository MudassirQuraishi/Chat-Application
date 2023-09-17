document.addEventListener("DOMContentLoaded", async function () {
  const menuItems = document.querySelectorAll(".chat-sidebar-menu li");
  const contentMessages = document.querySelector(".content-messages-list");
  const contentSidebarTitle = document.querySelector(".content-sidebar-title");
  menuItems.forEach((item) => {
    item.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent the default link behavior

      // Remove 'active' class from previously active item
      const previouslyActiveItem = document.querySelector(
        ".chat-sidebar-menu li.active"
      );
      if (previouslyActiveItem) {
        previouslyActiveItem.classList.remove("active");
      }

      // Add 'active' class to the clicked item
      item.classList.add("active");

      // Change the text content of the content-sidebar-title based on the clicked item
      contentSidebarTitle.textContent = item.children[0].dataset.title;
      if (item.dataset.title !== undefined) {
        contentSidebarTitle.textContent = item.dataset.title;
      }
      // Check which li is active and insert data accordingly
      if (item.classList.contains("active")) {
        // Insert data into content-messages based on the active item
        if (item.children[0].dataset.title === "Chats") {
          await getAllChats();
        } else if (item.children[0].dataset.title === "Contacts") {
          await getAllContacts();
        } else if (item.children[0].dataset.title === "Groups") {
          await getAllGroups();
        } else if (item.children[0].dataset.title === "Settings") {
          await getSettings();
        } else if (item.dataset.title === "Profile") {
          await getProfile();
        }
      }
    });
  });
});

//function to get all chats
async function getAllChats() {
  console.log("Getting all chats");
}
async function getAllContacts() {
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
    console.log(document.querySelectorAll("[data-conversation]"));
    document.querySelectorAll("[data-conversation]").forEach(function (item) {
      item.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("Opened Chat");
        document.querySelectorAll(".conversation").forEach(function (i) {
          i.classList.remove("active");
        });
        document
          .querySelector(this.dataset.conversation)
          .classList.add("active");
        await generateChat(this.id);
      });
    });
  } catch (error) {
    console.log("Error getting all contacts");
  }
}
async function getAllGroups() {
  console.log("Getting all groups");
}
async function getSettings() {
  console.log("Getting settings");
}
async function getProfile() {
  console.log("Getting profile");
}
function createContact(data) {
  console.log(data);

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

    // Assuming you have a reference to the container element where you want to append this structure
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

    //main
    const containerMain = document.querySelector(".conversation-main");

    // Create the <ul> element with class "conversation-wrapper"
    const ul = document.createElement("ul");
    ul.classList.add("conversation-wrapper");

    // Create multiple <li> elements and append them to the <ul>
    for (let i = 0; i < numberOfItems; i++) {
      // Replace 'numberOfItems' with the desired number of <li> elements
      const li = document.createElement("li");
      // Add content or attributes to the <li> elements as needed
      ul.appendChild(li);
    }

    // Append the <ul> to the container
    container.appendChild(ul);
    container.appendChild(containerMain);

    //asdas
  } catch (error) {}
}
const button = document.getElementById("submit-button");
button.addEventListener("click", sendChat);
async function sendChat() {
  const box = document.getElementById("chat-box");
  console.log(box.value);
  box.value = "";
}
