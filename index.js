let CANVAS_CONTEXT = null;
let CANVAS = null;
let LINE_WIDTH = 60;
let HTML_CODE = null;
let CLASS_PREFIX = "i_";


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

function renderHTML() {
  let htmlImage = document.getElementById('htmlImage');
  htmlImage.innerHTML = '';

  let mainDiv = document.createElement('div');
  let styleTag = document.createElement('style');
  mainDiv.appendChild(styleTag);

  let xMove = CANVAS.width / LINE_WIDTH;
  let yMove = xMove * 2.5; // font is 2.5 times higher than wider

  let classes = {};

  let mainItemClass = nextClassName(null);
  let lastClassName = mainItemClass;
  mainItemClass = CLASS_PREFIX + mainItemClass;
  styleTag.innerHTML += '.' + mainItemClass + '{display: inline; font-family:"Lucida Console", Monaco, monospace;font-size:0.8em;}'
  for (var y = 0; y < CANVAS.height; y += yMove) {
    let subdiv = document.createElement('div');
    for (var x = 0; x < CANVAS.width; x += xMove) {
      let pixelData = CANVAS_CONTEXT.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      let item = document.createElement('p');
      let color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
      let opacity = pixelData[3] / 255;

      let classKey = opacity > 0 ? (color + ':' + opacity) : 'invisible';

      let className = null;
      if (classKey in classes) {
        className = classes[classKey];
      } else {
        lastClassName = nextClassName(lastClassName);
        className = CLASS_PREFIX + lastClassName;
        styleTag.innerHTML += '.' + className + "{";
        if (opacity > 0) // if this is invisible, do not care about colour
          styleTag.innerHTML += "color:" + color + ";";
        if (Math.abs(1 - opacity) > 0.01)  // opacity is 99% or less
          styleTag.innerHTML += "opacity:" + opacity + ";";
        styleTag.innerHTML += "}";
        classes[classKey] = className;
      }
      item.className = className + ' ' + mainItemClass;

      item.innerHTML = 'X';
      subdiv.appendChild(item);
    }
    mainDiv.appendChild(subdiv);
  }
  htmlImage.appendChild(mainDiv);
  HTML_CODE.textContent = htmlImage.innerHTML;
}

function nextClassName(lastClassName) {
  if (!lastClassName)
    return 'a';

  let tail = '';
  let i = lastClassName.length - 1;
  let char = lastClassName[i];

  while (char === 'Z' && i > 0) {
    i--;
    char = lastClassName[i];
    tail = 'a' + tail;
  }
  if (char === 'Z')
    return 'aa' + tail;

  if (char == 'z')
    return lastClassName.slice(0, i) + 'A';

  return lastClassName.slice(0, i) + String.fromCharCode(char.charCodeAt(0) + 1) + tail;

}

function hexFormat(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + hexFormat(r) + hexFormat(g) + hexFormat(b);
}


function loadImage(src) {
  if (!src.type.match(/image.*/)) {
    console.log("The dropped file is not an image: ", src.type); // TODO show nice popup window
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
  HTML_CODE = document.getElementById('htmlCode');

  let target = document.getElementById("dropZone");
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

  /*
  Copy generated HTML code into clipboard when button is clicked
  */
  let btnCopyHTML = document.getElementById('btnCopyHTML');
  btnCopyHTML.addEventListener('click', () => {
    HTML_CODE.select();
    document.execCommand('copy');
  });
}
