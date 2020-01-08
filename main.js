
$(document).ready(function () {
  $("#conta").hide();
});


function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  file = evt.dataTransfer.files[0];
  console.log(file);
  compress(file);
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

window.addEventListener('dragover', handleDragOver, false);
window.addEventListener('drop', handleFileSelect, false);

var t = null;

window.onresize = () => {
  if (canvas) {
    if (t != null) clearTimeout(t);
    t = setTimeout(function () {
      compress(file);
    }, 20);
  }
};

$("#uploadedFile").change((e) => {
  console.log("uploaded");
  console.log(e.target.files[0]);
  file = e.target.files[0];
  compress(file);
});

function compress(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = event => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const elem = document.createElement('canvas');

      const height = window.innerHeight * 0.8;
      const scaleFactor = height / img.height;

      elem.height = height;
      elem.width = img.width * scaleFactor;

      const ctx = elem.getContext('2d');
      ctx.drawImage(img, 0, 0, elem.width, elem.height);

      const data = ctx.canvas.toDataURL(img, 'image/jpeg', 1);
      var result = new Image();
      result.src = data;

      init(result);
    },
      reader.onerror = error => console.log(error);
  };
}

var difficulty = $("#dificulty").val();
$("#dificulty").change((e) => {
  difficulty = parseInt(e.target.value);
  onImage();
});
$("#dificulty").on("click", ((e) => {
  difficulty = parseInt(e.target.value);
  onImage();
}));

const hoverColor = '#ffffff';
var scale;
var file;
var canvas;
var ctx;
var img;
var pieces;
var puzzleWidth;
var puzzleHeight;
var pieceWidth;
var pieceHeight;
var clickedPiece;

var mouse;

function init(_img) {
  img = _img;
  img.addEventListener('load', onImage, false);
}

function onImage(e) {
  $("#conta").show();
  $("#uploadButton").hide();
  var conta = document.getElementById('conta');
  scale = Math.min(conta.clientWidth / img.width, conta.clientHeight / img.height);
  pieceWidth = Math.floor(img.width / difficulty);
  pieceHeight = Math.floor(img.height / difficulty);
  puzzleWidth = pieceWidth * difficulty;
  puzzleHeight = pieceHeight * difficulty;
  setCanvas();
  initPuzzle();
}

function initPuzzle() {
  pieces = [];
  mouse = { x: 0, y: 0 };
  clickedPiece = null;
  ctx.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
  build();
}

function build() {
  var piece;
  var curX = 0;
  var curY = 0;
  for (let i = 0; i < difficulty * difficulty; i++) {
    piece = {};
    piece.index = i;
    piece.solX = curX;
    piece.solY = curY;
    pieces.push(piece);
    curX += pieceWidth;
    if (curX >= puzzleWidth) {
      curX = 0;
      curY += pieceHeight;
    }
  }
  $("#randomize").on("click", shufflePuzzle);
}

function shufflePuzzle() {
  pieces = shuffleArray(pieces);
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var piece;

  for (let i = 0; i < pieces.length; i++) {
    var randomX = Math.floor(Math.random() * (puzzleWidth / 2));
    var randomY = Math.floor(Math.random() * (puzzleHeight / 2));
    piece = pieces[i];
    piece.curX = randomX;
    piece.curY = randomY;
    ctx.drawImage(img, piece.solX, piece.solY, pieceWidth, pieceHeight, randomX, randomY, pieceWidth, pieceHeight);
  }
  $("#solve").unbind("click").on("click", solve);
  document.onmousedown = onPuzzleClick;
}
// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
  if (checkSorted(array)) {
    shuffleArray(array);
  }
  return array;
}

function checkSorted(o) {
  for (var i = 0; i < o.length - 1; i++) {
    if (o[i].index > o[i + 1].index) {
      return false;
    }
  }
  return true;
}

function mouseUpdate(e) {
  if (e.layerX || e.layerX == 0) {
    mouse.x = e.layerX - canvas.offsetLeft;
    mouse.y = e.layerY - canvas.offsetTop;
  }
  else if (e.offsetX || e.offsetX == 0) {
    mouse.x = e.offsetX - canvas.offsetLeft;
    mouse.y = e.offsetY - canvas.offsetTop;
  }
}

function checkPieceClicked() {
  var piece;
  for (let i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    if (mouse.x < piece.curX || mouse.x > (piece.curX + pieceWidth) || mouse.y < piece.curY || mouse.y > (piece.curY + pieceHeight)) {
    }
    else {
      return piece;
    }
  }
  return null;
}

function onPuzzleClick(e) {
  mouseUpdate(e);
  clickedPiece = checkPieceClicked();
  if (clickedPiece != null) {
    new Audio('./media/hold.wav').play();
    ctx.clearRect(clickedPiece.curX, clickedPiece.curY, pieceWidth, pieceHeight);
    updatePuzzle(e);
    ctx.save();
    ctx.globalAlpha = .9;
    ctx.drawImage(img, clickedPiece.solX, clickedPiece.solY, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    ctx.restore();
    document.onmousemove = updatePuzzle;
    document.onmouseup = dropPiece;
  }
}

function updatePuzzle(e) {
  mouseUpdate(e);
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var i;
  var piece;
  for (i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    if (piece == clickedPiece) {
      continue;
    }
    ctx.drawImage(img, piece.solX, piece.solY, pieceWidth, pieceHeight, piece.curX, piece.curY, pieceWidth, pieceHeight);
  }
  ctx.save();
  ctx.globalAlpha = .7;
  ctx.drawImage(img, clickedPiece.solX, clickedPiece.solY, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
  ctx.restore();
}

function dropPiece(e) {
  clickedPiece.curX = mouse.x - (pieceWidth / 2);
  clickedPiece.curY = mouse.y - (pieceHeight / 2);
  document.onmousemove = null;
  document.onmouseup = null;
  new Audio('./media/release.wav').play();
  checkAndReset();
}

function animate({ timing, draw, duration }) {
  let start = performance.now();
  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    let progress = timing(timeFraction);

    draw(progress);

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    } else {
      checkAndReset();
      $("#randomize").on("click", shufflePuzzle);
    }
  });
}

function solve() {
  $("#solve").unbind("click");
  $("#randomize").unbind("click");
  for (var i = 1; i < pieces.length; i++) {
    var tmp = pieces[i];
    for (var j = i - 1; j >= 0 && (pieces[j].index > tmp.index); j--) {
      pieces[j + 1] = pieces[j];
    }
    pieces[j + 1] = tmp;
  }
  animate({
    duration: 1000,
    timing(timeFraction) {
      return timeFraction;
    },
    draw(progress) {
      ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
      for (k = 0; k < pieces.length; k++) {
        piece = pieces[k];
        piece.curX = piece.curX + (piece.solX - piece.curX) * progress;
        piece.curY = piece.curY + (piece.solY - piece.curY) * progress;
        ctx.drawImage(img, piece.solX, piece.solY, pieceWidth, pieceHeight, piece.curX, piece.curY, pieceWidth, pieceHeight);
      }
    }
  });
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function checkAndReset() {
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var error = Math.min(puzzleWidth / 20, puzzleHeight / 20);
  var win = true;
  var piece;
  for (let i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    ctx.drawImage(img, piece.solX, piece.solY, pieceWidth, pieceHeight, piece.curX, piece.curY, pieceWidth, pieceHeight);
    if (!between(piece.curX, piece.solX - error, piece.solX + error) ||
      !between(piece.curY, piece.solY - error, piece.solY + error)) {
      win = false;
    }
  }
  if (win) {
    setTimeout(gameOver, 500);
  }
}

function gameOver() {
  var done = new Audio('./media/done.wav');
  done.volume = 0.5;
  done.play();
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
  initPuzzle();
}

function setCanvas() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid black";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

}

