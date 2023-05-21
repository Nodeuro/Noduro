var files = JSON.parse(localStorage.getItem("files"));
var lessons = JSON.parse(localStorage.getItem("lessons"));

for (index = 0; index < files.length; index++) {
    add_element("recommended-div", lessons[index], files[index]);
    add_element("saved-div", lessons[index], files[index]);
    animations("recommended-div");
    animations("saved-div");
}

function add_element(div_name, image_source, name) {
    var list = document.getElementById(div_name);
    var entry = document.createElement("div");
    entry.setAttribute("class", "card");
    entry.setAttribute("id", name);
    // create a new div element
    var image = document.createElement("img");
    image.setAttribute("class", "image");

    image.setAttribute("alt", name);

    image.src = image_source;
    // elem.setAttribute("height", "768");
    // elem.setAttribute("width", "1024");
    entry.appendChild(image);
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
        // if (!document.getElementById("scrolling-div").classList.contains("open-scrolling-div")){
        document.getElementById(div_name).classList.add("open-scrolling-div");
        document.getElementById(div_name + "_recommendation_text").classList.add("text-opened");
        document.getElementById(div_name + "_left_shadow").classList.add("box_appear");
        document.getElementById(div_name + "_right_shadow").classList.add("box_appear");
        document.getElementById(div_name + "_left_shadow").classList.remove("before");
        document.getElementById(div_name + "_right_shadow").classList.remove("before");
        // Set the hasScrolled variable to true so that this code only runs once
        lastscroll = Date.now();
        setTimeout(function () {
            if (Date.now() - lastscroll > 10000) {
                // console.log("setting back")
                document.getElementById(div_name).classList.remove("open-scrolling-div");
                document.getElementById(div_name + "_recommendation_text").classList.remove("text-opened");

                document.getElementById(div_name + "_left_shadow").classList.add("before");
                document.getElementById(div_name + "_right_shadow").classList.add("before");
                document.getElementById(div_name + "_left_shadow").classList.remove("box_appear");
                document.getElementById(div_name + "_right_shadow").classList.remove("box_appear");
            }
        }, 10000);
    });
}
