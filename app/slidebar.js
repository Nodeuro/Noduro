
var files = JSON.parse(localStorage.getItem("files"));
var lessons = JSON.parse(localStorage.getItem("lessons"));

for (index = 0; index < files.length; index++) {
    add_element("recommended_div", lessons[index], files[index]);
    add_element("saved_div", lessons[index], files[index]);
    animations("recommended_div");
    animations("saved_div");
}

function add_element(div_name, image_source, name) {
    var list = document.getElementById(div_name);
    var entry = document.createElement("div");
    entry.setAttribute("class", "card");
    entry.setAttribute("id", name);

    // Add click event listener to redirect to tech.html
    entry.addEventListener("click", function() {
        sessionStorage.setItem("lesson", name);
        window.location.href = "./technology/tech.html";
    });

    // create a new div element
    var image = document.createElement("img");
    image.setAttribute("alt", name);
    image.src = image_source;
    entry.appendChild(image);

    // Add overlay div
    var overlay = document.createElement("div");
    overlay.setAttribute("class", "overlay_text");
    var link = document.createElement("h1");
    link.textContent = name;
    overlay.appendChild(link);
    entry.appendChild(overlay);

    // add list element
    list.appendChild(entry);
}


// Initialize a boolean variable to keep track of whether the user has scrolled before

function animations(div_name) {
    const myDiv = document.querySelector("#" + div_name);
    let lastscroll = 0;
    // Add a scroll event listener to the div element
    myDiv.addEventListener("scroll", function () {
        // console.log("scrolling")
        // Check if the user has already scrolled
        // If this is the first time the user has scrolled, do something
        // if (!document.getElementById("scrolling_div").classList.contains("open_scrolling_div")){
        document.getElementById(div_name).classList.add("open_scrolling_div");
        document.getElementById(div_name + "_recommendation_text").classList.add("text_opened");
        document.getElementById(div_name + "_left_shadow").classList.add("box_appear");
        document.getElementById(div_name + "_right_shadow").classList.add("box_appear");
        document.getElementById(div_name + "_left_shadow").classList.remove("before");
        document.getElementById(div_name + "_right_shadow").classList.remove("before");
        // Set the hasScrolled variable to true so that this code only runs once
        lastscroll = Date.now();
        setTimeout(function () {
            if (Date.now() - lastscroll > 10000) {
                // console.log("setting back")
                document.getElementById(div_name).classList.remove("open_scrolling_div");
                document.getElementById(div_name + "_recommendation_text").classList.remove("text_opened");

                document.getElementById(div_name + "_left_shadow").classList.add("before");
                document.getElementById(div_name + "_right_shadow").classList.add("before");
                document.getElementById(div_name + "_left_shadow").classList.remove("box_appear");
                document.getElementById(div_name + "_right_shadow").classList.remove("box_appear");
            }
        }, 10000);
    });
}
