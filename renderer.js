// initialize_current_page();
async function signIn(email, password) {
    // await firebase.google_sign_in();
    // await firebase.email_sign_in("aadvik.vashist@outlook.com", "password");
    // handle the result
    var current_user = await user.get_most_recent_user();
    if (current_user.result == true) {
        console.log("success");
        document.getElementById("welcome").innerHTML =
            "Welcome back, " + current_user.user.first_name;
        let check_persist = await user.check_user_persist(current_user.user.email);
        if (!check_persist) {
            document.getElementById("sign_in").innerHTML =
                "<a class = 'sign_in_link' href= './login/login.html'> Sign In </a> to Noduro";
        }
    } else {
        document.getElementById("welcome").innerHTML = "Welcome to Noduro";
        document.getElementById("sign_in").innerHTML =
            "<a class = 'sign_in_link' href= './sign_up/sign_up.html'> Sign up </a> to Noduro to get started";
    }
}


get_lesson_data("rec_div");
get_lesson_data("saved_div");

document.addEventListener("DOMContentLoaded", function () {
    const obj = document.getElementById('doughnut_chart');
    createChartInObject(obj, data);
});
var numOfLessons = 45;
var rating = 4.2;
animateOnIntersection("accuracy_animated", "accuracy", "%", 0,  numOfLessons, 1000, "Accuracy");

animateOnIntersection("number_of_lessons_animated", "number_of_lessons", "", 0, numOfLessons, 1000, "lessons completed");
animateOnIntersection("average_rating_animated", "average_rating", "", 0, rating, 1000,"Average Rating");
animateOnIntersection("lesson_time_animated", "lesson_time", "", 0, 125, 1000,"Average Time");
animateOnIntersection("this_month_animated", "this_month", "", 0.0, 6.1, 1000,"per month");




signIn();
//HEADER ONLY LOADS ONCE

let element = document.querySelector(".animation");

//MAIN DIV ANIM ONLY ONCE
// console.log((Date.now()  - parseInt(sessionStorage.getItem('index_animation'))));
if (Date.now() - parseInt(sessionStorage.getItem("index_animation")) < 2000) {
    element.classList.remove("animation");
}

window.addEventListener("unload", function () {
    sessionStorage.setItem("index_animation", Date.now());
});

