// navigator.mediaDevices.getUserMedia({video: true})
//   .then(function(stream) {
//     document.getElementById('camera').srcObject = stream;

//     const track = stream.getVideoTracks()[0];
//     const settings = track.getSettings();
//     const width = settings.width;
//     const height = settings.height;
//     document.getElementById('camera').setAttribute('width', width);
//     document.getElementById('camera').setAttribute('height', height);
//   })
//   .catch(function() {
//     alert('could not connect stream');
//   });
//starting

var default_settings_path = "/src/settings/default_settings.json";
var user_settings_path = "/src/settings/user_settings.json";
try{
  var settings = window.noduro.readJSONFile(user_settings_path);
}
catch {
  var settings = window.noduro.readJSONFile(default_settings_path);
  console.log("Error reading user_settings.json, using default settings");
}

const overlay = document.querySelector('.overlay');
var noduro_instruction_data = noduro.get_lesson_data("0");

for (let i = 0; i < noduro_instruction_data.steps.length; i++) {
  noduro_instruction_data.steps[i].displayed_step = false;
  noduro_instruction_data.steps[i].time_spent = 0;
}
//will appear later
const reload_button = document.querySelector('.reload');
const playButton = document.getElementById('play_button');
const playButton_Icon = document.getElementById('play_button_icon'); 
const timelineProgress = document.querySelector('.timeline-progress');
const timeline_clickable = document.querySelector('.timeline-clickable');
const video_element = document.getElementById("instructional_content");
const info_button = document.querySelector(".info-button");
const info_div = document.querySelector('.info-div');
var info_open = false;
var focus_display = document.getElementById("focus_display");
const fps_div = document.getElementById("fps_div");
const timelineContainer = document.querySelector('.timeline-container');

const time_on_step = document.getElementById("time_on_step");
const step_counter = document.getElementById("step_counter");
const canvas = document.getElementById("camera");
const ctx = canvas.getContext("2d");

if (settings.video.lowLight != -1){
ctx.filter = `brightness(${100 + settings.video.lowLight * 10}%)`;
}
function updateProgress() {
  const progress = (video_element.currentTime / video_element.duration) * 100;
  timelineProgress.style.width = `${progress}%`;
}

setInterval(updateProgress, 100);

var delay = Date.now();
playButton.addEventListener('click', () => {
  delay =  Date.now();
  if (video_element.paused) {
    video_element.play();
    playButton_Icon.classList.add('bi-pause');
    playButton_Icon.classList.remove('bi-play-fill');
  }
  else {
    video_element.pause();
    playButton_Icon.classList.add('bi-play-fill');
    playButton_Icon.classList.remove('bi-pause');

  }
});


const focusValues = [];
const fpsValues = [];
var playback = 1;
function write_focus(focus) {
  focusValues.push(parseFloat(focus));
  if (focusValues.length > 3) {
    focusValues.shift();
  }
  const movingAverage = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;
  focus_display.innerHTML = 100 - 5 * Math.round(movingAverage * 20) + "% Focused";
  playback = 1 - Math.round(movingAverage *10) / 10 ;
}

function write_fps (fps) {
  fpsValues.push(parseFloat(fps));
  if (fpsValues.length > 15) {
    fpsValues.shift();
  }
  const movingAverage = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
  const colorScale = (movingAverage - 14) / 6; // Scale the moving average to a value between 0 and 1
  const redValue = Math.round(Math.min(Math.max(255 * (1 - colorScale), 0), 255)); // Calculate the red value based on the color scale
  const greenValue = Math.round(Math.min(Math.max(255 * colorScale, 0), 255)); // Calculate the green value based on the color scale
  const blueValue = 0;
  const colorString = `rgb(${redValue}, ${greenValue}, ${blueValue})`; // Construct the color string
  fps_div.style.backgroundColor = colorString; // Set the background color of the element
}
// Define image object
var image = new Image();

// Function to draw base64 image on canvas
function drawImageOnCanvas(base64String) {
    // Set image source to base64 string
    image.src = "data:image/png;base64," + base64String;

    // When the image is loaded, draw it on the canvas
    image.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var aspectRatio = image.width / image.height;
      var targetWidth = canvas.width;
      var targetHeight = canvas.width / aspectRatio;

      if (targetHeight > canvas.height) {
          targetHeight = canvas.height;
          targetWidth = canvas.height * aspectRatio;
      }

      var x = (canvas.width - targetWidth) / 2;
      var y = (canvas.height - targetHeight) / 2;

      ctx.drawImage(image, x, y, targetWidth, targetHeight);
  };
}
var curr_step = 0;
var step_done = false;
var time_on_current_timer = 0;
time_on_step.innerHTML =  `<sup>0</sup>/<sub>${noduro_instruction_data.steps[curr_step].duration}</sub>`;
step_counter.innerHTML =  `<sup>1</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;

window.noduro.startPythonFile("../python/modeling/gesture/gesture_tracker_timing_study.py", settings)
// window.noduro.startPythonFile("../python/run.py")
// var cam = document.getElementById('camera');
var first_time = true;
  window.addEventListener('message', (event) => {
    if (event.data.type === 'imageData' && info_open == false) {
      if (first_time) {
        setTimeout(() => {
          overlay.remove();
          curr_step = 0;
          step_done = false;
          time_on_current_timer = Date.now();
          const steps = noduro_instruction_data.steps;

          for (let i = 1; i < steps.length; i++) {
            const step = steps[i];
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('timeline-split');
            const x = Math.round(step.start / video_element.duration * timelineContainer.offsetWidth);
            stepDiv.style.left = x + "px";
            timelineContainer.appendChild(stepDiv);
          }
        
          setInterval(videoManager, 100);
        }, 1000);
        first_time = false;
        video_element.src = noduro_instruction_data.meta.video_path;
          const steps = noduro_instruction_data.steps;

      }
      const imageBase64 = event.data.payload;
      drawImageOnCanvas(imageBase64[0]);
      write_fps(imageBase64[1]);
      if (imageBase64.length > 2){
        write_focus(imageBase64[2]);
      }
    }
  });

  // Assuming you have a JSON object stored in a variable called 'jsonData'

  // Parse the JSON object

  // Get a reference to the div you want to add the items to

  // Iterate over the items in the parsedData object
// function add_accordian(name, display_name, container_class, header_class, content_class){
//   var curr_data = noduro_instruction_data[name];
    
//   // Add "Ingredients" as an h1 element to the info_div
//   const details = document.createElement('div');
//   details.classList.add(container_class);
//   const ingredientsHeader = document.createElement('button');
//   ingredientsHeader.innerHTML = display_name;
//   ingredientsHeader.classList.add(header_class);
//   details.appendChild(ingredientsHeader);
//   if (typeof curr_data[Object.keys(curr_data)[0]]  === 'object'){
  
//     for (const ingredient of curr_data) {
//       const ingredientElement = document.createElement('p');
//       ingredientElement.textContent = Object.values(ingredient);
//       ingredientElement.classList.add(content_class);
//       details.appendChild(ingredientElement);
//     }
//   }
//   else {
//     for (const ingredient of Object.keys(curr_data)) {
//       const ingredientElement = document.createElement('p');
//       ingredientElement.classList.add(content_class);
//       ingredientElement.textContent = ingredient + ": " + curr_data[ingredient];
//       details.appendChild(ingredientElement);
//     }
//   }
//   info_div.appendChild(details);
// }
// add_accordian("ingredients", "Ingredients", "accordion", "accordion-button", "accordion-content");
// add_accordian("nutrition", "Nutrition Facts", "accordion", "accordion-button", "accordion-content");
// add_accordian("steps", "Instruction", "accordion", "accordion-button", "accordion-content");  
// add_accordian("tags", "Tags", "accordion", "accordion-button", "accordion-content");

// // for (const ingredient of curr_data) {
// //   const ingredientElement = document.createElement('p');
// //   ingredientElement.textContent = Object.values(ingredient);
// //   div_a.appendChild(ingredientElement);
// // }
// // info_div.appendChild(div_a);
// const accordionButtons = document.querySelectorAll('.accordion-button');

// accordionButtons.forEach(button => {
//   button.addEventListener('click', () => {
//     button.classList.toggle('active');
//     const accordionContent = button.nextElementSibling;
//     if (accordionContent.style.display === 'block') {
//       accordionContent.style.display = 'none';
//     } else {
//       accordionContent.style.display = 'block';
//     }
//   });
// });

  info_button.addEventListener('click', () => {
    info_div.classList.toggle('info_div_active');
    info_open = !info_open;
    if (info_open) {
      video_element.pause();
      playButton_Icon.classList.add('bi-play-fill');
      playButton_Icon.classList.remove('bi-pause');
      info_button.classList.add('info_button_active');

    }
    else {
      video_element.play();
      playButton_Icon.classList.add('bi-pause');
      playButton_Icon.classList.remove('bi-play-fill');
      info_button.classList.remove('info_button_active');

      // Remove all the h1 elements from the info_div
      const ingredientsHeader = info_div.querySelector('h1');
      while (ingredientsHeader.nextSibling) {
        info_div.removeChild(ingredientsHeader.nextSibling);
      }
      info_div.removeChild(ingredientsHeader);
    }
  });




function videoManager() {
  video_element.playbackRate = playback;
  time_on_step.innerHTML =  `<sup>${parseInt((Date.now()-time_on_current_timer) / 1000) + noduro_instruction_data.steps[curr_step].time_spent}</sup>/<sub>${noduro_instruction_data.steps[curr_step].duration}</sub>`;
  if (video_element.currentTime > noduro_instruction_data.steps[curr_step].end || (video_element.currentTime >= video_element.duration) && step_done == false ){
    video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
    timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
  }
  else if (step_done == true){
    noduro_instruction_data.steps[curr_step].time_spent += parseInt((Date.now()-time_on_current_timer) / 1000);
    curr_step += 1;
    step_counter.innerHTML =  `<sup>${curr_step+1}</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;
    step_done = false;
    time_on_current_timer = Date.now();
    if(noduro_instruction_data.steps[curr_step].start - video_element.currentTime > 0.5){
      video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
      timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
    }
  
}
}
timeline_clickable.addEventListener('mousedown', (event) => {
  if (Date.now() - delay >  1000) {
    const timelineWidth = timeline_clickable.offsetWidth;
    const clickX = event.offsetX - timeline_clickable.offsetLeft;
    const clickY = event.offsetY;
    const percent = clickX / timelineWidth;
    const newTime = percent * video_element.duration;
    if (newTime > noduro_instruction_data.steps[curr_step].start && newTime < noduro_instruction_data.steps[curr_step].end && (clickX > playButton.offsetWidth + playButton.offsetLeft|| clickY < 6)) {
      video_element.currentTime = newTime;
      video_element.pause();
      setTimeout(function(){video_element.play();}, 1000);
    }
  }
});


document.addEventListener('keydown', function(event) {
  if (event.code === 'Enter') {
    step_done = true;
  }
  else if (event.code === 'Backspace' || event.code === 'ArrowLeft') {
    if (curr_step > 0) {
      noduro_instruction_data.steps[curr_step].time_spent += parseInt((Date.now()-time_on_current_timer) / 1000);
      curr_step -= 1;
      video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
      timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
      step_counter.innerHTML =  `<sup>${curr_step+1}</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;
      video_element.play();
      time_on_current_timer = Date.now();

    }
  }
});

reload_button.addEventListener('click', () => {
  const confirmation = confirm("Changes will not be saved. Do you want to continue?");
  if (confirmation) {
    location.reload();
  }
});
