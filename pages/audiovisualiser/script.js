// make references to HTML elements
var file = document.getElementById("audio-file");
var audio = document.getElementById("audio-controls");
var canvas = document.getElementById("canvas");

var pulseB = true;
var lineB = false;
var dotB = false;
var barB = false;

var lightB = true;
var darkB = false;

//provide the 2D rendering surface
var canvasContext = canvas.getContext('2d');

// starts off light
var bgColor = "#eeeeee";
var drawColor = "#333333";

var cWidth; 
var cHeight;

var audioContext;
var analyser;

//automatic resizing
(function() {

	audioContext = new AudioContext();
	analyser = audioContext.createAnalyser();

	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		cWidth = canvas.width;
		cHeight = canvas.height;
		draw(); 
	}
	resizeCanvas();

	function draw() {
		canvasContext.fillStyle = bgColor;
		canvasContext.fillRect(0, 0, cWidth, cHeight);
	}

})();

document.getElementById("pulse").addEventListener("click", pulseF);
document.getElementById("line").addEventListener("click", lineF);
document.getElementById("dot").addEventListener("click", dotF);
document.getElementById("bar").addEventListener("click", barF);
document.getElementById("light").addEventListener("click",lightF);
document.getElementById("dark").addEventListener("click", darkF);

function lightF() {
	bgColor = "#eeeeee";
	drawColor = "#333333";
	document.getElementById("panel").style.color = drawColor;
	if (darkB) {
		document.getElementById("panel").classList.remove("dark");
		document.getElementById("panel").classList.add("light");
		reset();
	}
	lightB = true;
	darkB = false;
}

function darkF() {
	bgColor = "#333333";
	drawColor = "#cccccc";
	document.getElementById("panel").style.color = drawColor;
	if (lightB) {
		document.getElementById("panel").classList.remove("light");
		document.getElementById("panel").classList.add("dark");
		reset();
	}
	lightB = false;
	darkB = true;
}

function reset() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	cWidth = canvas.width;
	cHeight = canvas.height;
	canvasContext.fillStyle = bgColor;
	canvasContext.fillRect(0, 0, cWidth, cHeight);
}

function pulseF() {
	pulseB = true;
	lineB = false;
	dotB = false;
	barB = false;
	analyser.fftSize = 128;
	console.log('pulse');
}

function lineF() {
	pulseB = false;
	lineB = true;
	dotB = false;
	barB = false;
	analyser.fftSize = 2048;
	console.log('line');
}

function barF() {
	pulseB = false;
	lineB = false;
	dotB = false;
	barB = true;
	analyser.fftSize = 1024;
	console.log('bar');
}

function dotF() {
	pulseB = false;
	lineB = false;
	dotB = true;
	barB = false;
	analyser.fftSize = 2048;
	console.log('dot');
}

file.onchange = function() {

	//make sure canvas variables are accessible inside the animation method
	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var canvasContext = canvas.getContext("2d");

	var files = this.files;
	audio.src = URL.createObjectURL(files[0]);
	audio.volume = 0.5;
	audio.load();
	audio.play();
	
	var src = audioContext.createMediaElementSource(audio);
  	analyser.smoothingTimeConstant = 0.95;

	src.connect(analyser);
	analyser.connect(audioContext.destination);
	
	var slots = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(slots);

	// used globally
	cWidth = canvas.width;
	cHeight = canvas.height;
	var x = 1.5;

	// used for pulse
	var radius;

	// used for line
	var endpoints = analyser.frequencyBinCount;
	var lineLength = (cWidth/8) * 2.5;
	var lineY;

	// used for bar
	var bars = analyser.frequencyBinCount;
	var barWidth = (cWidth/bars) * 2.5;
	var barHeight;

	// used for dots
	var dots = analyser.frequencyBinCount;
	var dotWidth = (cWidth/dots) * 2.5;
	var dotHeight;

	function frameRender() {
		requestAnimationFrame(frameRender);

		x = 1.5;

		analyser.getByteFrequencyData(dataArray)

		canvasContext.fillStyle = bgColor;
		canvasContext.fillRect(0, 0, cWidth, cHeight);

		if (pulseB) {
			for (var i = 0; i < 64; i += 4) {
				radius = dataArray[i];

				var r = 15 * (i/3);
				var g = 50;
				var b = 80 * (radius/2);

				canvasContext.globalAlpha = 0.4;
				canvasContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
				canvasContext.beginPath();
				canvasContext.arc(cWidth * 0.5, cHeight * 0.5, radius*2, 0, 2 * Math.PI, false);
				canvasContext.fill();
			}
		} else if (lineB) {
			canvasContext.beginPath();
			canvasContext.moveTo(-30, cHeight - (cHeight * 0.2));

			for (var i = 0; i < endpoints; i++) {
				lineY = dataArray[i];
				canvasContext.lineTo(x, 50 + cHeight - lineY * 2.3);

				x += 8;
			}

			canvasContext.globalAlpha = 1;
			canvasContext.lineWidth = 3;
			canvasContext.strokeStyle = drawColor;
			canvasContext.stroke();
		} else if (barB) {
			for (var i = 0; i < bars; i++) {
				barHeight = dataArray[i] ^ 1.5;

				var r = barHeight + (30 * (i/bars));
				var g = (250 * (i/bars))^0.25;
				var b = 50;

				canvasContext.globalAlpha = 1;
				canvasContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
				canvasContext.fillRect(x, cHeight - 2.0 * barHeight, barWidth, 2.8 * barHeight);

				x += barWidth + 8;
			}
		} else if (dotB) {
			x = -10;
			for (var i = 0; i < bars; i++) {
				dotHeight = dataArray[i] ^ 1.15;

				canvasContext.globalAlpha = 1;
				canvasContext.fillStyle = drawColor;
				canvasContext.fillRect(x, cHeight - 2.0 * dotHeight, dotWidth, 2);

				x += dotWidth + 2;
			}
		}

	}

	//different Render functions

	//switch statement for cases
	frameRender();
	audio.play();

}
