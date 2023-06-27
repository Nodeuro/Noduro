// Create the contact button element
var contactButton = document.createElement("button");
contactButton.id = "contactButton";
contactButton.innerHTML = "<i class='bi bi-question contact-icon'></i>";

// Add the contact button to the page
document.body.appendChild(contactButton);
// Add this to your JavaScript file
contactButton = document.querySelector("#contactButton");

contactButton.addEventListener("click", () => {
    noduro.openExternal("https://mailto:vashist.aadvik@gmail.com");
});

