//initializing the element, but not showing it yet [look at `gotResult` function]
const eventContainer = document.querySelector("#dom-elements"); 

const imgUpload = document.querySelector("#image-upload");
const captureFrameBtn = document.querySelector("#capture-frame-btn");
const prevImgContainer = document.querySelector("#prev-img-container");
const prevVidContainer = document.querySelector(
  "#vid-cap-container"
);
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

