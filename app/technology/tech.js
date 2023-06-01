
var default_settings_path = "/src/settings/default_settings.json";
var user_settings_path = "/src/settings/user_settings.json";
try {
	var settings = window.noduro.readJSONFile(user_settings_path);
}
catch {
	var settings = window.noduro.readJSONFile(default_settings_path);
	console.log("Error reading user_settings.json, using default settings");
}

const overlay = document.querySelector('.overlay');
// window.noduro.startPythonFile("../python/modeling/gesture/gesture_tracker_timing_study.py", settings)
window.noduro.startExeFile("./dist/main/gesture_tracker_timing_study.py.exe", settings)
async function getLessonData() {
	var noduro_instruction_data = await noduro.folder_picker();
	noduro_instruction_data = noduro.get_lesson_path(noduro_instruction_data);

	for (let i = 0; i < noduro_instruction_data.steps.length; i++) {
		noduro_instruction_data.steps[i].displayed_step = false;
		noduro_instruction_data.steps[i].time_spent = 0;
		// continue with the rest of your code here
	}
	return noduro_instruction_data;
}
	// window.noduro.startPythonFile("../python/modeling/gesture/gesture_tracker_timing_study.py", settings)

async function main() {
	noduro_instruction_data = await getLessonData();


	//will appear later
	const reload_button = document.querySelector('.reload');
	const playButton = document.getElementById('play_button');
	const playButton_Icon = document.getElementById('play_button_icon');
	const timelineProgress = document.querySelector('.timeline_progress');
	const timeline_clickable = document.querySelector('.timeline_clickable');
	const video_element = document.getElementById("instructional_content");
	const info_button = document.querySelector(".info_button");
	const info_div = document.querySelector('.info_div');
	const accordion_div = document.querySelector('.info_accordion');

	var info_open = false;
	var focus_display = document.getElementById("focus_display");
	const fps_div = document.getElementById("fps_div");
	const timelineContainer = document.querySelector('.timeline_container');

	const time_on_step = document.getElementById("time_on_step");
	const step_counter = document.getElementById("step_counter");
	const canvas = document.getElementById("camera");
	const ctx = canvas.getContext("2d");

	if (settings.video.lowLight != -1) {
		ctx.filter = `brightness(${100 + settings.video.lowLight * 10}%)`;
	}
	function updateProgress() {
		const progress = (video_element.currentTime / video_element.duration) * 100;
		timelineProgress.style.width = `${progress}%`;
	}

	setInterval(updateProgress, 100);

	var delay = Date.now();
	playButton.addEventListener('click', () => {
		delay = Date.now();
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
		playback = 1 - Math.round(movingAverage * 10) / 10;
	}

	function write_fps(fps) {
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
		image.onload = function () {
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
	time_on_step.innerHTML = `<sup>0</sup>/<sub>${noduro_instruction_data.steps[curr_step].duration}</sub>`;
	step_counter.innerHTML = `<sup>1</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;


	// window.noduro.startExeFile("./dist/main/gesture_tracker_timing_study.py.exe", settings)
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
						stepDiv.classList.add('timeline_split');
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
			let alt_data = JSON.parse(imageBase64[1]);
			write_fps(alt_data.fps);
			write_focus(alt_data.focus);
		}
	});


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
		time_on_step.innerHTML = `<sup>${parseInt((Date.now() - time_on_current_timer) / 1000) + noduro_instruction_data.steps[curr_step].time_spent}</sup>/<sub>${noduro_instruction_data.steps[curr_step].duration}</sub>`;
		if (video_element.currentTime > noduro_instruction_data.steps[curr_step].end || (video_element.currentTime >= video_element.duration) && step_done == false) {
			video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
			timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
		}
		else if (step_done == true) {
			noduro_instruction_data.steps[curr_step].time_spent += parseInt((Date.now() - time_on_current_timer) / 1000);
			curr_step += 1;
			step_counter.innerHTML = `<sup>${curr_step + 1}</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;
			step_done = false;
			time_on_current_timer = Date.now();
			if (noduro_instruction_data.steps[curr_step].start - video_element.currentTime > 0.5) {
				video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
				timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
			}

		}
	}
	timeline_clickable.addEventListener('mousedown', (event) => {
		if (Date.now() - delay > 1000) {
			const timelineWidth = timeline_clickable.offsetWidth;
			const clickX = event.offsetX - timeline_clickable.offsetLeft;
			const clickY = event.offsetY;
			const percent = clickX / timelineWidth;
			const newTime = percent * video_element.duration;
			if (newTime > noduro_instruction_data.steps[curr_step].start && newTime < noduro_instruction_data.steps[curr_step].end && (clickX > playButton.offsetWidth + playButton.offsetLeft || clickY < 6)) {
				video_element.currentTime = newTime;
				video_element.pause();
				setTimeout(function () { video_element.play(); }, 1000);
			}
		}
	});


	document.addEventListener('keydown', function (event) {
		if (event.code === 'Enter') {
			step_done = true;
		}
		else if (event.code === 'Backspace' || event.code === 'ArrowLeft') {
			if (curr_step > 0) {
				noduro_instruction_data.steps[curr_step].time_spent += parseInt((Date.now() - time_on_current_timer) / 1000);
				curr_step -= 1;
				video_element.currentTime = noduro_instruction_data.steps[curr_step].start;
				timelineProgress.style.width = `${(video_element.currentTime / video_element.duration) * 100}%`;
				step_counter.innerHTML = `<sup>${curr_step + 1}</sup>/<sub>${noduro_instruction_data.steps.length}</sub>`;
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




	function display_facts(json_file, mainDiv, div_class) {
		const ingredientsDiv = document.createElement('div'); ingredientsDiv.classList.add(div_class);
		const stepsDiv = document.createElement('div'); stepsDiv.classList.add(div_class);
		const nutritionalFactsDiv = document.createElement('div'); nutritionalFactsDiv.classList.add(div_class);
		const tagsDiv = document.createElement('div'); tagsDiv.classList.add(div_class);
		//Create the header

		const ingredientsHeader = document.createElement('button');
		const stepsHeader = document.createElement('button');
		const nutritionalFactsHeader = document.createElement('button');
		const tagsHeader = document.createElement('button');

		//put the text in the header
		ingredientsHeader.innerHTML = 'Ingredients';
		stepsHeader.innerHTML = 'Steps';
		nutritionalFactsHeader.innerHTML = 'Nutritional Facts';
		tagsHeader.innerHTML = 'Tags';

		//add the header to the div
		ingredientsDiv.appendChild(ingredientsHeader);
		stepsDiv.appendChild(stepsHeader);
		nutritionalFactsDiv.appendChild(nutritionalFactsHeader);
		tagsDiv.appendChild(tagsHeader);

		//add the content div
		const ingredientsContent = document.createElement('div');
		const stepsContent = document.createElement('div');
		const nutritionalFactsContent = document.createElement('div');
		const tagsContent = document.createElement('div');

		//add the "p" for for the actual content
		const ingredientsP = document.createElement('p');
		const stepsP = document.createElement('p');
		const nutritionalFactsP = document.createElement('p'); nutritionalFactsP.classList.add('capitalize');
		const tagsP = document.createElement('p'); tagsP.classList.add('capitalize');

		//add ingredients content to p
		for (const ingredient of json_file.ingredients) {
			if (/\d/.test(ingredient.quantity)) {
				ingredientsP.innerHTML += ingredient.quantity + " " + ingredient.name + "<br>";
			} else {
				ingredientsP.innerHTML += ingredient.name + " " + ingredient.quantity + "<br>";
			}
		}
		ingredientsContent.appendChild(ingredientsP);
		ingredientsDiv.appendChild(ingredientsContent);
		//Steps
		for (const step of json_file.steps) {
			stepsP.innerHTML += step.index + ": " + step.description + "<br>";
		}
		stepsContent.appendChild(stepsP);
		stepsDiv.appendChild(stepsContent);
		//Nutritional Facts
		for (const fact in json_file.nutrition) {
			nutritionalFactsP.innerHTML += `${fact}: ${json_file.nutrition[fact]}<br>`;
		}
		nutritionalFactsContent.appendChild(nutritionalFactsP);
		nutritionalFactsDiv.appendChild(nutritionalFactsContent);
		//Tags
		for (const fact in json_file.tags) {
			var tag = `${fact.replace(/_/g, ' ')}: ${Array.isArray(json_file.tags[fact]) ? json_file.tags[fact].join(', ') : json_file.tags[fact]}<br>`;
			tagsP.innerHTML += tag;
		}
		tagsContent.appendChild(tagsP);
		tagsDiv.appendChild(tagsContent);

		//add the divs to the main div
		mainDiv.appendChild(ingredientsDiv);
		mainDiv.appendChild(stepsDiv);
		mainDiv.appendChild(nutritionalFactsDiv);
		mainDiv.appendChild(tagsDiv);
	}

	display_facts(noduro_instruction_data, accordion_div, 'accordion');

	const accordionButtons = document.querySelectorAll('.accordion button');

	// accordionButtons.forEach(button => {
	//   button.addEventListener('click', () => {
	//     button.parentElement.classList.toggle('div-active');
	//     button.nextElementSibling.classList.toggle('active');

	//   });
	// });
	accordionButtons.forEach(button => {
		button.addEventListener('click', () => {
			const buttonHeight = button.offsetHeight;
			const contentHeight = button.nextElementSibling.offsetHeight;
			const totalHeight = buttonHeight + contentHeight;
			const parentElement = button.parentElement;
			if (parentElement.style.height === `${totalHeight}px`) {
				parentElement.style.height = `${buttonHeight}px`;
			} else {
				parentElement.style.height = `${totalHeight}px`;
			}
			button.nextElementSibling.classList.toggle('active');
		});
	});
}

main();
