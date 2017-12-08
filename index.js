let CANVAS_CONTEXT = null;
let CANVAS = null;
let LINE_WIDTH = 60;


function renderImage(src) {
  let image = new Image();
  image.onload = function() {
    CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    let parentBounds = CANVAS.parentNode.getBoundingClientRect();
    CANVAS.width = image.width;
    CANVAS.height = image.height;
    CANVAS_CONTEXT.drawImage(image, 0, 0, image.width, image.height);
    renderHTML();
  };
  image.src = src;
}

function renderHTML(){
  let mainDiv = document.getElementById('htmlImage');
  let xMove = CANVAS.width / LINE_WIDTH;
  let yMove = xMove * 2.5; // font is 2.5 times higher than wider
  for(var y = 0; y < CANVAS.height; y+=yMove){
    let subdiv = document.createElement('div');
    for(var x = 0; x < CANVAS.width; x+=xMove){
      let pixelData = CANVAS_CONTEXT.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      let item = document.createElement('span');
      item.style.color = 'rgb('+pixelData[0]+','+pixelData[1]+','+pixelData[2]+')';
      if (pixelData[3] != 255)
        item.style.opacity = 100 * pixelData[3] / 255;
      item.innerHTML = 'X';
      subdiv.appendChild(item);
    }
    mainDiv.appendChild(subdiv);
  }
}

function loadImage(src) {
  if (!src.type.match(/image.*/)) {
    console.log("The dropped file is not an image: ", src.type);  // TODO show nice popup window
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    renderImage(e.target.result);
  };
  reader.readAsDataURL(src);
}

window.onload = () => {
  // Init global variables
  CANVAS = document.getElementById("imageCanvas");
  CANVAS_CONTEXT = CANVAS.getContext("2d");

  var target = document.getElementById("dropZone");
  target.addEventListener(
    "dragover",
    function(e) {
      e.preventDefault();
    },
    true
  );
  target.addEventListener(
    "drop",
    function(e) {
      e.preventDefault();
      loadImage(e.dataTransfer.files[0]);
    },
    true
  );
}
