var MAX_HEIGHT = 100;

function renderImage(src) {
  var image = new Image();
  image.onload = function() {
    var canvas = document.getElementById("imageCanvas");
    if (image.height > MAX_HEIGHT) {
      image.width *= MAX_HEIGHT / image.height;
      image.height = MAX_HEIGHT;
    }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
  };
  image.src = src;
}

function loadImage(src) {
  if (!src.type.match(/image.*/)) {
    console.log("The dropped file is not an image: ", src.type);
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    renderImage(e.target.result);
  };
  reader.readAsDataURL(src);
}

window.onload = () => {
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
