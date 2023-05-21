const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");
const toggleConfirmPassword = document.querySelector("#toggleConfirmPassword");
const confirm_password = document.querySelector("#confirm_password");


toggleConfirmPassword.addEventListener("click", function () {
	// toggle the type attribute
	const type = password.getAttribute("type") === "password" ? "text" : "password";
	password.setAttribute("type", type);
    confirm_password.setAttribute("type", type);
	// toggle the icon
	toggleConfirmPassword.classList.toggle("bi-eye");
    togglePassword.classList.toggle("bi-eye");
});
togglePassword.addEventListener("click", function () {
	// toggle the type attribute
	const type = confirm_password.getAttribute("type") === "password" ? "text" : "password";
	password.setAttribute("type", type);
    confirm_password.setAttribute("type", type);
	// toggle the icon
	toggleConfirmPassword.classList.toggle("bi-eye");
    togglePassword.classList.toggle("bi-eye");
});

// prevent form submit
// const form = document.querySelector("form");
// form.addEventListener('sign_in',function(e){
// 	e.preventDefault();
//     console.log("button.clicked")
//     const auth = getAuth();
//     createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//         // Signed in 
//         const user = userCredential.user;
//         // ...
//     })
//     .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         // ..
//     });

// });

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

const form = document.querySelector('#sign_up');
form.addEventListener('submit',async (event) => {
    event.preventDefault();
    const email_address = form.elements.email.value;
    const password = form.elements.password.value;
    const confirm_password = form.elements.confirm_password.value;
    const first_name = form.elements.first_name.value;
    const last_name = form.elements.last_name.value;
    const date_of_birth = form.elements.date_of_birth.value;
    if (password != confirm_password) {
        alert("Your passwords do not match. Please try again");
    }
    else if (password.length < 1 || email_address.length < 1 || confirm_password.length < 1) {
        alert("Please fill out all fields");
    }
    else{
        var sign_up = await firebase.email_sign_up(email_address, password, first_name, last_name,date_of_birth);
        if (sign_up[0]) {
            console.log("success");
            window.location.replace("../index.html");
        }
        else if(sign_up[1].message == "Firebase: Error (auth/email-already-in-use)."){
            alert("This email is already in use. If you have an account, please try signing in, or clicking forgot password. If you need help, contact us for support")
        }
        else {
            alert(sign_up[1].message + "\nIf you may have an account, please try signing in, or clicking forgot password. Please try again, or if you need help, contact us for support")
        }
    }
});

// document.getElementById("submit").addEventListener("click", async () => {
//     const firstname = document.getElementById("firstname");
//     const lastname = document.getElementById("lastname");
//     const displayname = document.getElementById("displayname");
//     const darkmode = document.getElementById("darkmode");



//     if (darkmode.value == "Dark") {
//         await window.darkMode.dark();
//     } else if (darkmode.value == "Light") {
//         await window.darkMode.light();
//     } else {
//         await window.darkMode.system();
//     }
// });