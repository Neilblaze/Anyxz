//initializing the element, but not showing it yet [look at `gotResult` function]
const eventContainer = document.querySelector("#dom-elements");

const imgUpload = document.querySelector("#image-upload");
const captureFrameBtn = document.querySelector("#capture-frame-btn");
const prevImgContainer = document.querySelector("#prev-img-container");
const prevVidContainer = document.querySelector("#vid-cap-container");
const recordBtn = document.querySelector("#record-canvas-btn");
const backgroundColour = document.querySelector("#background-color-picker");
const recIconClone = document.querySelector("#record-icon").cloneNode(true);
const loadingTime = document.querySelector("#loading-time");

let video;
let uNet;
let sgImage;
let bg;
let runitOnceUnet = false;
let recording = false; // initial state = 0
let recorder;
const chunks = [];
let updateTimer;
let timeCount = 30; //loading time component
let chkCameraPermissionOnce = true;
let runWebcamWarningOnce = true;

console.log("=> 2940");

// BOOTSTRAP UTILS
const VidInsPopover = new bootstrap.Popover(
  document.querySelector(".popover-dismiss-vid"),
  {
    trigger: "focus",
  }
);

const ImgInsPopover = new bootstrap.Popover(
  document.querySelector(".popover-dismiss-img"),
  {
    trigger: "focus",
  }
);

const webcamWarningModal = new bootstrap.Modal(
  document.getElementById("webcam-warning-modal"),
  { show: false }
);

const audioDenyToastNotif = new bootstrap.Toast(
  document.querySelector("#audio-denial-toast"),
  {
    delay: 5000,
  }
);

// load uNet model
function preload() {
  uNet = ml5.uNet("face");
}

//showing application loading time
const captureInterval = setInterval(() => {
  if (timeCount !== 0) {
    timeCount = timeCount - 1;
    loadingTime.innerText = `Estimated loading time: ${timeCount} seconds`;
  }
}, 1000);

// Add auto reload function upon t = 30

//p5js initial setup
function setup() {
  createCanvas(540, 400);
  video = createCapture(VIDEO); // check out the stream, check if you can find the difference between no stream vs stream log
  video.size(200, 150); // displaying the main image(video) on the side
  video.class("webcam-feed");
  sgImage = createImage(width, height);
  uNet.segment(video, gotResult); // initial segmentation
  bg = loadImage("./assets/site_loading_svg.svg"); // initial loading svg
}

//adding the dom elements, from p5js. this function runs continuously
function draw() {
  background(bg);
  image(sgImage, 0, 0, width, height);
}

function gotResult(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  //showing webcam permission warning error
  if (!chkCameraPermissionOnce && runWebcamWarningOnce) {
    webcamWarningModal.show();
    runWebcamWarningOnce = false;
  }

  // Refactor required!

  //checking if the user gave permission
  if (video) {
    video.loadPixels();
    //checking if user gave permission
    if (!(video.pixels[1] > 0) && chkCameraPermissionOnce) {
      console.error("User didn't gave permisson");
      chkCameraPermissionOnce = false;
    }
  }

  //doing stuff after the initial uNet model has loaded and working, running this only once
  if (!runitOnceUnet) {
    runitOnceUnet = true;
    bg = "#34eb89"; //initial image (parrot-greem)
    const video = document.querySelector("video"); //getting the video after its created by p5js
    video.parentNode.insertBefore(eventContainer, video.nextSibling); //inserting the eventContainer after the video element [https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib]
    eventContainer.style.display = "block";
    loadingTime.style.display = "none";
    clearInterval(captureInterval);
  }
  sgImage = result.backgroundMask;
  uNet.segment(video, gotResult);
}

//starts capturing video from canvas and saving that data on `chunks` [https://stackoverflow.com/questions/42437971/exporting-a-video-in-p5-js]
function startRecording() {
  //handling music
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(
      (strm) => {
        //Dom markup
        const counterSpan = document.createElement("span");
        recordBtn.innerText = "stop recording";
        recordBtn.className = "btn btn-danger";
        counterSpan.className = "badge bg-secondary";
        counterSpan.innerText = 0;
        recordBtn.appendChild(counterSpan);
        updateTimer = setInterval(() => {
          counterSpan.innerText = Number(counterSpan.innerText) + 1; //updating VC counter timer
        }, 1000);
        //clearing the chunks
        chunks.length = 0;
        let canvasStream = document.querySelector("canvas").captureStream(30);
        //merging both the audio and the video stream
        let combined = new MediaStream([
          ...canvasStream.getTracks(),
          ...strm.getTracks(),
        ]);

        recorder = new MediaRecorder(combined);

        recorder.ondataavailable = (e) => {
          if (e.data.size) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = exportVideo;
        recorder.start(); //starting the recorder
      },
      (error) => {
        // Something went wrong, user didn't gave audio permission.
        audioDenyToastNotif.show();
        //Dom markup
        const counterSpan = document.createElement("span");
        recordBtn.innerText = "stop recording";
        recordBtn.className = "btn btn-danger";
        counterSpan.className = "badge bg-secondary";
        counterSpan.innerText = 0;
        recordBtn.appendChild(counterSpan);
        updateTimer = setInterval(() => {
          counterSpan.innerText = Number(counterSpan.innerText) + 1; //updating video capture counter timer
        }, 1000);

        //clearing the chunks
        chunks.length = 0;
        let canvasStream = document.querySelector("canvas").captureStream(30);
        //getting the video stream
        let combined = new MediaStream([...canvasStream.getTracks()]);

        recorder = new MediaRecorder(combined);

        recorder.ondataavailable = (e) => {
          if (e.data.size) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = exportVideo;
        recorder.start(); //starting the recorder
      }
    );
}

//displays captured video on the dom
function exportVideo(e) {
  const blob = new Blob(chunks);
  const vid = document.createElement("video");
  vid.id = "preview-video";
  vid.style.width = "400px";
  vid.style.height = "295px";
  vid.controls = true;
  vid.src = URL.createObjectURL(blob);
  prevVidContainer.appendChild(vid);
  vid.play();
  //creting video download btn
  const downloadVideoBtn = document.createElement("a");
  downloadVideoBtn.innerText = "Download";
  downloadVideoBtn.className = "btn btn-light";
  downloadVideoBtn.id = "download-video-btn";
  prevVidContainer.appendChild(downloadVideoBtn);
  //connecting the download btn with the video source
  downloadVideoBtn.href = vid.src;
  downloadVideoBtn.download = "anyxz.mp4";
}

//Image upload handler
imgUpload.addEventListener("change", (e) => {
  bg = "#000000";
  background(bg); //try setting bg to #eee
  const imgSrc = window.URL.createObjectURL(e.target.files[0]);
  bg = loadImage(imgSrc); //changing background to imported image
  background(bg);
});

//Image preview and download handler
captureFrameBtn.addEventListener("click", () => {
  saveFrames("out", "png", 1, 25, (data) => {
    //removing an image if theres more than 6 images
    if (prevImgContainer.childElementCount > 5) {
      prevImgContainer.removeChild(
        prevImgContainer.getElementsByTagName("div")[
        prevImgContainer.childElementCount - 1
        ]
      );
    }
    const imgCard = document.createElement("div");
    const img = new Image(300, 220);
    const downloadBtn = document.createElement("a");
    img.src = data[0].imageData;
    downloadBtn.href = data[0].imageData;
    img.className = "card-img-top";
    img.style.width = "300px"; //need this to override bootstrap style
    imgCard.className = "col-6 col-md-6";
    downloadBtn.className = "btn btn-primary";
    downloadBtn.innerText = "Download";
    downloadBtn.id = "download-img-btn";
    imgCard.append(img);
    imgCard.appendChild(downloadBtn);
    prevImgContainer.insertBefore(imgCard, prevImgContainer.firstChild);
    downloadBtn.download = `${data[0].filename}.${data[0].ext}`;
  });
});

//handling record-btn click
recordBtn.addEventListener("click", () => {
  //starts recording
  if (!recording) {
    recording = true;
    const previewVideo = document.querySelector("#preview-video");
    const downloadVideoBtn = document.querySelector("#download-video-btn");

    if (previewVideo) {
      prevVidContainer.removeChild(previewVideo);
    }
    if (downloadVideoBtn) {
      prevVidContainer.removeChild(downloadVideoBtn);
    }
    startRecording();
  }
  //stops recording
  else {
    clearInterval(updateTimer);
    recording = false;
    recordBtn.innerText = "start a new recording"; //using innerHTML, which also removes the `counterSpan` element
    recordBtn.className = "btn btn-light";
    recordBtn.appendChild(recIconClone);
    recorder.stop(); //recorder.stop calls `exportVideo` function
  }
});

//color picker
backgroundColour.addEventListener("change", (e) => {
  bg = e.target.value;
  background(bg);
});


//  this is the code for dark mode
let input = document.querySelector('#toggle');
input.addEventListener('click', () => {
  document.body.classList.toggle('switch');

})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}