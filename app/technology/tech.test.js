// BEGIN: ed8c6549bwf9
setTimeout(() => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'imageData') {
      if (first_time) {
        const video = document.querySelector('.overlay');
        video.classList.add('hidden');
        first_time = false;
        document.getElementById("instructional_content").src = video.meta.video_path;
      }
      const imageBase64 = event.data.payload;
      drawImageOnCanvas(imageBase64);

      // // Create a URL for the base64 image data
      // const imageURL = `data:image/jpeg;base64,${imageBase64}`;

      // // Use the image URL as the source for your HTML video element
      // cam.src = imageURL;
    }
  });
}, 1000);
// END: ed8c6549bwf9