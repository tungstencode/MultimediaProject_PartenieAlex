function mouseUpdate(e, canvas) {
  var mouse = { x: 0, y: 0 };
  if (e.layerX || e.layerX == 0) {
    mouse.x = e.layerX - canvas.offsetLeft;
    mouse.y = e.layerY - canvas.offsetTop;
  } else if (e.offsetX || e.offsetX == 0) {
    mouse.x = e.offsetX - canvas.offsetLeft;
    mouse.y = e.offsetY - canvas.offsetTop;
  }
  return mouse;
}

function calculateDimensions() {
  pieceWidth = Math.floor(img.width / difficulty);
  pieceHeight = Math.floor(img.height / difficulty);
  puzzleWidth = pieceWidth * difficulty;
  puzzleHeight = pieceHeight * difficulty;
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getAverageColor(canv, context) {
  let i = 0,
    count = 0,
    colorData,
    pixelInterval = 5,
    rgb = { r: 0, g: 0, b: 0 };

  colorData = context.getImageData(0, 0, canv.width, canv.height);

  colorData = colorData.data;
  length = colorData.length;
  while ((i += pixelInterval * 4) < length) {
    count++;
    rgb.r += colorData[i];
    rgb.g += colorData[i + 1];
    rgb.b += colorData[i + 2];
  }

  rgb.r = Math.floor(rgb.r / count);
  rgb.g = Math.floor(rgb.g / count);
  rgb.b = Math.floor(rgb.b / count);

  return rgb;
}
