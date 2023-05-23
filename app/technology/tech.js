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

var canvas = document.getElementById("camera");
var ctx = canvas.getContext("2d");

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
// var cam = document.getElementById('camera');
var first_time = true;
window.addEventListener('message', (event) => {
  if (event.data.type === 'imageData') {
    if (first_time) {
      const video = document.querySelector('.overlay');
      video.classList.add('hidden');
      first_time = false;
    }
    const imageBase64 = event.data.payload;
    drawImageOnCanvas(imageBase64);

    // // Create a URL for the base64 image data
    // const imageURL = `data:image/jpeg;base64,${imageBase64}`;

    // // Use the image URL as the source for your HTML video element
    // cam.src = imageURL;
  }
});
