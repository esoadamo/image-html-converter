// Global variables are initializated upon window load
let CANVAS_CONTEXT = null;
let CANVAS = null;
let LINE_WIDTH = null;
let HTML_CODE = null;
let CLASS_PREFIX = null;
let FONT_SIZE = null;


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

  let mainDiv = document.createElement('span');
  let styleTag = document.createElement('style');
  mainDiv.appendChild(styleTag);

  let xMove = CANVAS.width / LINE_WIDTH.value;
  let yMove = xMove * 1.68; // font is 1.68 times higher than wider

  let charset = document.getElementById('charset').value.split('');

  let classes = {};

  let mainItemClass = nextClassName(null);
  let lastClassName = mainItemClass;
  mainItemClass = CLASS_PREFIX.value + mainItemClass;
  styleTag.innerHTML += `.${mainItemClass}{display:inline;font-family:"Lucida Console",Monaco,monospace;font-size:${FONT_SIZE.value}px;} ${CLASS_PREFIX.value}{display:block;height:${FONT_SIZE.value}px;}`
  let imgData = CANVAS_CONTEXT.getImageData(0, 0, CANVAS.width, CANVAS.height).data;
  for (var y = 0; y < CANVAS.height; y += yMove) {
    let subdiv = document.createElement(CLASS_PREFIX.value);
    for (var x = 0; x < CANVAS.width; x += xMove) {
      let pixelData = CANVAS_CONTEXT.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

      let color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
      let opacity = pixelData[3] / 255;

      let classKey = opacity > 0 ? (color + ':' + opacity) : 'invisible';

      let className = null;
      if ((classKey in classes)) {
        className = classes[classKey];
      } else {
        lastClassName = nextClassName(lastClassName);
        className = CLASS_PREFIX.value + lastClassName;
        styleTag.innerHTML += className + "{";
        if (opacity > 0) // if this is invisible, do not care about colour
          styleTag.innerHTML += "color:" + color + ";";
        if (Math.abs(1 - opacity) > 0.01) // opacity is 99% or less
          styleTag.innerHTML += "opacity:" + opacity + ";";
        styleTag.innerHTML += "}";
        classes[classKey] = className;
      }

      let item = document.createElement(className);
      item.className = mainItemClass;

      item.innerHTML = charset[Math.floor(Math.random() * charset.length)];
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
    let i = lastClassName.length -1;
    let char = lastClassName[i];
    while (char === 'z' && i > 0) {
        i--;
        char = lastClassName[i];
        tail = 'a' + tail;
    }
    if (char === 'z')
        return 'aa' + tail;
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
    alert("The dropped file is not an image: " + src.type);
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('dropZone').style.visibility = "hidden";
    document.getElementById('menu').style.visibility = "visible";
    renderImage(e.target.result);
  };
  reader.readAsDataURL(src);
}

window.onload = () => {
  // Init global variables
  CANVAS = document.getElementById("imageCanvas");
  CANVAS_CONTEXT = CANVAS.getContext("2d");
  HTML_CODE = document.getElementById('htmlCode');
  CLASS_PREFIX = document.getElementById('cssPrefix');
  LINE_WIDTH = document.getElementById('lineWidth');
  FONT_SIZE = document.querySelector('#fontSize');

  /*
  Handle image dropdowns
  */
  let dropDownZone = document.getElementById("dropZone");
  dropDownZone.addEventListener(
    "dragover",
    function(e) {
      e.preventDefault();
    },
    true
  );
  dropDownZone.addEventListener(
    "drop",
    function(e) {
      e.preventDefault();
      loadImage(e.dataTransfer.files[0]);
    },
    true
  );

  /*
  Change image backgound upon change
  */
  let inputBackground = document.getElementById('imageBackround');
  inputBackground.addEventListener('input', () => {
    let background = inputBackground.value.slice(0, 1) == '#' ? inputBackground.value : ('#' + inputBackground.value);
    document.getElementById('imagePreview').style.background = background;
    document.getElementById('htmlImage').style.background = background;
  });

  /*
  Render HTML image and generate code upon button click
  */
  let btnRender = document.getElementById('btnRender');
  btnRender.addEventListener('click', renderHTML);

  /*
  Copy generated HTML code into clipboard when button is clicked
  */
  let btnCopyHTML = document.getElementById('btnCopyHTML');
  btnCopyHTML.addEventListener('click', () => {
    HTML_CODE.select();
    document.execCommand('copy');
  });
}
