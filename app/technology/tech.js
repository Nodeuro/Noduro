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
const overlay = document.querySelector('.overlay');
var noduro_instruction_data = noduro.get_lesson_data("0");

//will appear later
const playButton = document.getElementById('play_button');
const playButton_Icon = document.getElementById('play_button_icon'); 
const timelineProgress = document.querySelector('.timeline-progress');
const timeline_div = document.querySelector('.video_playbar');

var video_element = document.getElementById("instructional_content");


var canvas = document.getElementById("camera");
var ctx = canvas.getContext("2d");


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

timeline_div.addEventListener('mousedown', (event) => {
  if (Date.now() - delay >  1000) {
  const timelineWidth = timeline_div.offsetWidth;
  const clickX = event.offsetX- timeline_div.offsetLeft;
  const percent = clickX / timelineWidth;
  const newTime = percent * video_element.duration;
  video_element.currentTime = newTime;
  }
});



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
window.noduro.startPythonFile("../python/modeling/gesture/gesture_tracker_timing_study.py")
// window.noduro.startPythonFile("../python/run.py")
// var cam = document.getElementById('camera');
var first_time = true;
  window.addEventListener('message', (event) => {
    if (event.data.type === 'imageData') {
      if (first_time) {
        setTimeout(() => {
          overlay.remove();
        }, 1000);
        first_time = false;
        video_element.src = noduro_instruction_data.meta.video_path;

      }
      const imageBase64 = event.data.payload;
      drawImageOnCanvas(imageBase64);
    }
  });

