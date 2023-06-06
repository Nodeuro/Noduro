

let lastCalledTime;
let count = 0;
var info_open = false;
const focusValues = [];
const fpsValues = [];
var playback = 1;
function write_focus(focus) {
    focusValues.push(parseFloat(focus));
    if (focusValues.length > 3) {
        focusValues.shift();
    }
    const movingAverage =
        focusValues.reduce((a, b) => a + b, 0) / focusValues.length;
    playback = 1 - Math.round(movingAverage * 10) / 10;
    return 100 - 5 * Math.round(movingAverage * 20) + "% Focused";
}

function write_fps(fps) {
    fpsValues.push(parseFloat(fps));
    if (fpsValues.length > 15) {
        fpsValues.shift();
    }
    const movingAverage =
        fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const colorScale = (movingAverage - 16) / 20; // Scale the moving average to a value between 0 and 1
    const redValue = Math.round(
        Math.min(Math.max(255 * (1 - colorScale), 0), 255)
    ); // Calculate the red value based on the color scale
    const greenValue = Math.round(Math.min(Math.max(255 * colorScale, 0), 255)); // Calculate the green value based on the color scale
    const blueValue = 0;
    const colorString = `rgb(${redValue}, ${greenValue}, ${blueValue})`; // Construct the color string
    return [movingAverage, colorString]; // Set the background color of the element
}

function draw(landmark, context) {
    context.fillStyle = "#00FF00";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawConnectors(context, landmark.leftHandLandmarks, HAND_CONNECTIONS, {
        color: "#CC0000",
        lineWidth: 5,
    });
    drawLandmarks(context, landmark.leftHandLandmarks, {
        color: "#00FF00",
        lineWidth: 2,
    });
    drawConnectors(context, landmark.rightHandLandmarks, HAND_CONNECTIONS, {
        color: "#00CC00",
        lineWidth: 5,
    });
    drawLandmarks(context, landmark.rightHandLandmarks, {
        color: "#FF0000",
        lineWidth: 2,
    });
}
function onResults(results, gpdict, skip, overlay_context, fps_div, focus_text) {
    // Calculate fps
    if (!lastCalledTime) {
        lastCalledTime = performance.now();
    }
    const delta = (performance.now() - lastCalledTime) / 1000;
    lastCalledTime = performance.now();
    const fps = write_fps(skip / delta);
    fps_div.style.backgroundColor = fps[1];

    const foc = focus_from_result_obj(results, gpdict);
    const focus = write_focus(foc);
    focus_text.innerHTML = focus;

    draw(results, overlay_context);
}
const holistic = new Holistic({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    },
});
holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

// holistic.onResults(
//     onResults,
//     document.getElementById("fps"),
//     document.getElementById("focus")
// );
var camera_stream_image = false;
function initialize_model(fps_div, focus_text, videoElement, camera_canvas, overlay_canvas, camera_context, overlay_context, skip, gpdict) {
    if (skip == undefined) {
        var skip = 3;
    }
    if (typeof gpdict === 'string' || gpdict instanceof String) {
        var gpdict = window.noduro.readJSONFile(gpdict, true).model.points;
    }
    if (camera_context == undefined) camera_context = camera_canvas.getContext("2d");
    if (overlay_context == undefined) overlay_context = overlay_canvas.getContext("2d");
    holistic.onResults((results) => onResults(results, gpdict, skip, overlay_context, fps_div, focus_text));
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            if (!info_open) {
            if (count % skip == 0) {
                await holistic.send({ image: videoElement });
                count = 1;
            } else {
                count++;
            }
            camera_context.fillRect(
                0,
                0,
                camera_canvas.width,
                camera_canvas.height
            );
            
            camera_context.drawImage(
                videoElement,
                0,
                0,
                camera_canvas.width,
                camera_canvas.height
            );
            if (!camera_stream_image) {
                window.postMessage({type: 'started', payload: "mediapipe has initalized"}, '*');
                camera_stream_image = true;
            }
        }
        },
        width: camera_canvas.width,
        height: camera_canvas.height,
    });
    camera.start();
}    
// const videoElement = document.getElementsByClassName("input_video")[0];
// const camera_canvas = document.getElementById("output_video");
// const overlay_canvas = document.getElementById("results_overlay");
// intialize_model(document.getElementById("fps"), document.getElementById("focus"), videoElement, camera_canvas, overlay_canvas, camera_context, overlay_context);