const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", function () {
	// toggle the type attribute
	const type = password.getAttribute("type") === "password" ? "text" : "password";
	password.setAttribute("type", type);
	// toggle the icon
	this.classList.toggle("bi-eye");
});

const passwordInput = document.getElementById('password');
// add an event listener to the input field
passwordInput.addEventListener('input', () => {
    // get the current input value
    const inputValue = passwordInput.value;
    // define a regular expression that matches spaces
    const spaceRegex = /\s/;
    // if the input value contains a space, remove it
    if (spaceRegex.test(inputValue)) {
        passwordInput.value = inputValue.replace(spaceRegex, '');
    }
});



const form = document.querySelector('#sign_in');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email_address = form.elements.email.value;
    const password = form.elements.password.value;
    var sign_in = await firebase.email_sign_in(email_address, password);
    if (sign_in[0]) {
    console.log("success");
    window.location.replace("../index.html");
    } else {
    if (!confirm("Either your email address or password are incorrect. Please try again, or if you need help, contact us for support")) {
        window.location.replace("../index.html");
        }
    }
});


// window.firebase.sign_in("aadvik.vashist@outlook.com", "password");

// function waitForSessionStorage(key) {
//   return new Promise((resolve) => {
//     const intervalId = setInterval(() => {
//       const value = sessionStorage.getItem(key);
//       if (value !== null) {
//         clearInterval(intervalId);
//         resolve(JSON.parse(value));
//       }
//     }, 100);
//   });
// }
// async function setElementValueOnceSessionStorageExists(elementId, sessionStorageKey) {
//   const value = await waitForSessionStorage(sessionStorageKey);
//   // Calculate the time difference in seconds
//   sessionStorage.setItem("last_login", value.lastLoginAt);
// }


// function updateTimer(elementId) {
//   const timeDiffInSeconds =  Math.floor(Date.now() / 1000) - sessionStorage.getItem("last_login") / 1000;
//   // Convert to hours, minutes, and seconds
//   var hours = Math.floor(timeDiffInSeconds / 3600); hours += (hours == 1) ? " hour, " : " hours, ";
//   var minutes = Math.floor((timeDiffInSeconds % 3600) / 60); minutes += (minutes == 1) ? " minute, and " : " minutes, and ";
//   var seconds = Math.floor(timeDiffInSeconds % 60); seconds += (seconds == 1) ? " second " : " seconds ";
//   console.log();

//   const element = document.getElementById('signed_in');

//   element.textContent = "It's been: " + hours + minutes + seconds + "since you last logged in";
// }

// // call updateTimer() every second
// setInterval(updateTimer, 1000);

// // Example usage

// setElementValueOnceSessionStorageExists('signed_in', 'user');