let dark_color =
    "linear-gradient(90deg, var(--theme-not-selected) 0%, var(--theme-half-selected) 33.33%, var(--theme-selected) 66.66%, var(--theme-selected) 100%)";
let light_color =
    "linear-gradient(90deg, var(--theme-selected) 0%, var(--theme-selected) 33.33%, var(--theme-half-selected) 66.66%, var(--theme-not-selected) 100%)";
let system_color =
    "linear-gradient(90deg, var(--theme-not-selected) 0%, var(--theme-selected) 33.33%, var(--theme-selected) 66.66%, var(--theme-not-selected) 100%)";

const commonResolutions = [
    [7680, 4320], // 8K (Full Ultra HD)
    [5120, 2880], // 5K (Ultra HD+)
    [3840, 2160], // 4K (Ultra HD)
    [3840, 1600], // 1600p Ultrawide
    [3440, 1440], // UWQHD (Ultra-Wide QHD)
    [2560, 1600], // 1600p (WQXGA)
    [2560, 1440], // 1440p (QHD)
    [2048, 1080], // 2K (DCI)
    [1920, 1080], // 1080p (Full HD)
    [1600, 900], // HD+
    [1366, 768], // WXGA
    [1280, 720] // 720p
];

var settings_folder = document.getElementById("settings_folder");
var settings_folder_text = document.getElementById("settings_folder_text");
var lessons_folder = document.getElementById("lessons_folder");
var lessons_folder_text = document.getElementById("lessons_folder_text");
if (localStorage.getItem("settings_folder") != null) {
    settings_folder_text.innerHTML = localStorage.getItem("settings_folder");
}
if (localStorage.getItem("lessons_folder") != null) {
    lessons_folder_text.innerHTML = localStorage.getItem("lessons_folder");
}
settings_folder.addEventListener("click", async function () {
    var folder =  await window.noduro.folder_picker();
    if (folder == null) {
        return;
    }
    isPageDirty = true;
    settings_folder_text.innerHTML = folder;
    localStorage.setItem("settings_folder", folder);

    // Do something with the selected folder path
});
lessons_folder.addEventListener("click", async function () {
    var folder =  await window.noduro.folder_picker();
    if (folder == null) {
        return;
    }
    isPageDirty = true;
    lessons_folder_text.innerHTML = folder;
    localStorage.setItem("lessons_folder", folder);
    // Do something with the selected folder path
});

// /Users/aadvik/Desktop/Important Projects/Noduro/data/settings/default_settings.json
var theme_val;
var track;
var default_settings_path = localStorage.getItem("settings_folder") + "/default_settings.json"
var user_settings_path = localStorage.getItem("settings_folder") + "/user_settings.json";

var theme_button = document.getElementById("triple_button");
var darkButton = document.getElementById("toggle_button_3");
var lightButton = document.getElementById("toggle_button_1");
var systemButton = document.getElementById("toggle_button_2");

var camera_object = document.getElementById("camera_test");

var video_flip = document.getElementById("flipVideo");
var video_resolution = document.getElementById("resolution");

var video_focus = document.getElementById("focus");
var video_lowLight = document.getElementById("lowLightCheckbox");
var video_lowLightSlider = document.getElementById("lowLightSlider");

var audio_main = document.getElementById("mainVolumeSlider");
var audio_sound_effects = document.getElementById("sfxSlider");
var audio_teacher = document.getElementById("teacherVolume");
var audio_urgent = document.getElementById("urgentVolume");

var privacy_audio = document.getElementById("record_audio");
var privacy_video = document.getElementById("record_video");
var privacy_local_storage = document.getElementById("local_storage");
var privacy_anonymize = document.getElementById("anonymize_data");

var reset_page = document.getElementById("reset_page");
var delete_passwords = document.getElementById("password_delete");
//DEFAULT VALUES
let canvas;
let context;
try{
    var settings_file = window.noduro.readJSONFile(user_settings_path, true);
}
catch {
    var settings_file = window.noduro.readJSONFile(default_settings_path, true);
    console.log("Error reading user_settings.json, using default settings");
}
var settings = settings_file.app;
function flip() {
    camera_object.style.transform = flipVideo.checked ? "scaleX(-1)" : "scaleX(1)";
}

function initialize(){
    if (settings.visual.theme == "Dark") {
        darkButton.classList.add("active");
        theme_val = "Dark";
        window.darkMode.dark();
        theme_button.style.backgroundImage =
            dark_color;
    } else if (settings.visual.theme == "Light") {
        lightButton.classList.add("active");
        theme_val = "Light";
        window.darkMode.light();
        theme_button.style.backgroundImage =
            light_color;
    } else {
        systemButton.classList.add("active");
        theme_val = "System";
        window.darkMode.system();
        theme_button.style.backgroundImage =
            system_color;
    }

    video_flip.checked = settings.video.flipVideo;
    if (settings.video.flipVideo) flip();
    video_focus.checked = settings.video.autofocus;

    if (settings.video.lowLight == -1){
        video_lowLight.checked = false;
    }
    else{
        video_lowLightSlider.value = settings.video.lowLight; video_lowLightSlider.classList.add('show'); video_lowLight.checked = true;
        camera_object.style.filter = `brightness(${100 + settings.video.lowLight * 10}%)`;

    }

    audio_main.value = settings.audio.master_volume;
    audio_sound_effects.value = settings.audio.sound_effects_volume;
    audio_teacher.value = settings.audio.teacher_volume;
    audio_urgent.value = settings.audio.urgent_volume;


    privacy_audio.checked = settings.privacy.record_audio;
    privacy_video.checked = settings.privacy.record_video;
    privacy_local_storage.checked = settings.privacy.local_storage;
    privacy_anonymize.checked = settings.privacy.anonymize_data;
}
function populateDropdown(res_width,res_height,element) {
    const resolutions = commonResolutions.filter(([width, height]) => width <= res_width && height <= res_height);
    const dropdown = document.getElementById(element);
    const selection = settings.video.resolution[0] +"x"+ settings.video.resolution[1];
    resolutions.forEach(([width, height]) => {
        const option = document.createElement('option');
        option.value = `${width}x${height}`;
        option.text = `${width}x${height}`; //(${width * height} pixels)
        dropdown.appendChild(option);
    });
    for (var i = 0; i < dropdown.options.length; i++) {
        // Check if the value of the current option matches the desired value
        if (dropdown.options[i].value === selection) {
          // If so, set the selectedIndex property to the index of the current option
            dropdown.selectedIndex = i;
            break; // Exit the loop
        }
    }
}

function during(){
    // Check if the browser supports getUserMedia API
    // Access the user's camera
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        camera_object.srcObject = stream;
        camera_object.onloadedmetadata = function () {
            camera_object.play();

            // Create a canvas element to manipulate the video stream
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            // Set the initial brightness to 100%
            let brightness = 100;
            context.filter = `brightness(${brightness}%)`;
            // Adjust for low light
            track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();

            // Retrieve the supported resolutions
            const res_width = capabilities.width.max;
            const res_height = capabilities.height.max;
            populateDropdown(res_width,res_height,'resolution');
            // Populate the dropdown with the supported resolutions
            // Listen for changes to the brightness slider
            video_lowLightSlider.addEventListener('input', function (event) {
                // Update the brightness value and apply the filter
                brightness = event.target.value;
                camera_object.style.filter = `brightness(${100 + parseInt(this.value) * 10}%)`;
            });
        };
    })
    .catch(function (error) {
        console.error('Error accessing the webcam:', error);
    });


    var triStateToggleButtons = document.querySelectorAll(".theme_button button");
    function activateButton(button) {
        isPageDirty = true;
        var id = button.getAttribute("id");
        button.classList.add("active");
        if (id == "toggle_button_3") {
            theme_val = "Dark";
            window.darkMode.dark();
            theme_button.style.backgroundImage =
                dark_color;
        } else if (id == "toggle_button_1") {
            theme_val = "Light";
            window.darkMode.light();
            theme_button.style.backgroundImage =
                light_color;
        } else {
            theme_val = "System";
            window.darkMode.system();
            theme_button.style.backgroundImage =
                system_color;
        }
    }
    function deactivateButtons(buttons) {
        buttons.forEach(function (button) {
            button.classList.remove("active");
        });
    }
    triStateToggleButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            deactivateButtons(triStateToggleButtons);
            activateButton(button);
        });
    });


    // Function to flip the video horizontally


    flipVideo.addEventListener("change", flip);

    //animate box to appear

    video_lowLight.addEventListener('change', function () {
    if (video_lowLight.checked) {
        video_lowLightSlider.classList.add('show');

    } else {
        video_lowLightSlider.classList.remove('show');
    }
    });



    delete_passwords.addEventListener('click', () => {
        var check = confirm("Are you sure you want to delete all saved passwords?");
        if (check==false) return;
        var x = window.firebase.delete_local_accounts();
        if (x==false) alert("Error: passwords not deleted");
        else alert("Passwords deleted successfully!");
    });

    reset_page.addEventListener('click', () => {
        var check = confirm("Are you sure you want to reset all settings?");
        if (check==false) return;
        window.noduro.writeJSONFile(user_settings_path,"",true);
        alert("Settings reset successfully!");
        
        location.reload();
        
    });
}

var isPageDirty = false;
function setDirty() {
  isPageDirty = true;
}

// // Function to set the page dirty flag when changes are made

// // Attach event listener to detect changes on inputs, selects, and textareas
var formElements = document.querySelectorAll('.option');
for (var i = 0; i < formElements.length; i++) {
  formElements[i].addEventListener('change', setDirty);
}


initialize();
during();

document.getElementById('submit_button').addEventListener('click', () => {
    // Function to save the settings
    settings.visual.theme = theme_val

    settings.video.resolution = video_resolution.value.split('x').map(function(str) {
    return parseInt(str, 10);
    });
    settings.video.flipVideo = video_flip.checked;
    if(!video_lowLight.checked) settings.video.lowLight = -1;
    else settings.video.lowLight = video_lowLightSlider.value;
    settings.video.autofocus = video_focus.checked;

    settings.audio.master_volume = audio_main.value;
    settings.audio.sound_effects_volume = audio_sound_effects.value;
    settings.audio.teacher_volume = audio_teacher.value;
    settings.audio.urgent_volume = audio_urgent.value;

    settings.privacy.record_audio = privacy_audio.checked;
    settings.privacy.record_video = privacy_video.checked;
    settings.privacy.local_storage = privacy_local_storage.checked;
    settings.privacy.anonymize_data = privacy_anonymize.checked;
    settings_file.settings = settings;
    const jsonContent = JSON.stringify(settings_file, null, 2);
    window.noduro.writeJSONFile(user_settings_path,jsonContent, true);
    isPageDirty = false;
    confirm("Settings saved successfully!");
});



function check_redirect(url) {
    if(!isPageDirty){
        window.location.href = url;
        return;
    }
    if (confirm("Are you sure you want to leave? Your changes will not be saved.")) {
        window.location.href = url;
    }

}
