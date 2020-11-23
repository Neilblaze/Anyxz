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


