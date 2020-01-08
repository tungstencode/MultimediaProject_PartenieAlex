var puzzleWidth;
var puzzleHeight;
var pieceWidth;
var pieceHeight;
var file;
var canvas;
var ctx;
var pieces;
var clickedPiece;
var img;
var mouse;
var t = null;

$(document).ready(function () {
  $("#conta").hide();
});

function disableClick() {
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
}

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

window.onresize = () => {
  if (canvas) {
    if (t != null) clearTimeout(t);
    t = setTimeout(function () {
      compress(file);
    }, 20);
  }
};

$("#uploadedFile").change((e) => {
  file = e.target.files[0];
  compress(file);
});


function compress(file) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = event => {
    var img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      var tempCanv = document.createElement('canvas');

      var height = window.innerHeight * 0.8;
      var scaleTemp = height / img.height;

      tempCanv.height = height;
      tempCanv.width = img.width * scaleTemp;

      var context = tempCanv.getContext('2d');
      context.drawImage(img, 0, 0, tempCanv.width, tempCanv.height);

      var data = context.canvas.toDataURL(img, 'image/jpeg', 1);
      var result = new Image();
      result.src = data;

      startGame(result);
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

function startGame(_img) {
  img = _img;
  img.onload = onImage;
}

function onImage(e) {
  $("#conta").show();
  $("#uploadButton").hide();
  var conta = document.getElementById('conta');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  pieceWidth = Math.floor(img.width / difficulty);
  pieceHeight = Math.floor(img.height / difficulty);
  puzzleWidth = pieceWidth * difficulty;
  puzzleHeight = pieceHeight * difficulty;

  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid white";

  initPuzzle();
}

function initPuzzle() {
  disableClick();
  pieces = [];
  mouse = { x: 0, y: 0 };
  clickedPiece = null;
  ctx.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
  build();
}

function build() {
  var calcX = 0;
  var calcY = 0;
  for (let i = 0; i < difficulty * difficulty; i++) {
    var piece = {};
    piece.index = i;
    piece.solX = calcX;
    piece.solY = calcY;
    pieces.push(piece);
    calcX += pieceWidth;
    if (calcX >= puzzleWidth) {
      calcX = 0;
      calcY += pieceHeight;
    }
  }
  $("#randomize").on("click", shuffle);
}

function shuffle() {
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  for (let i = 0; i < pieces.length; i++) {
    var randomX = Math.floor(Math.random() * (puzzleWidth / 2));
    var randomY = Math.floor(Math.random() * (puzzleHeight / 2));
    pieces[i].curX = randomX;
    pieces[i].curY = randomY;
    ctx.drawImage(img, pieces[i].solX, pieces[i].solY, pieceWidth, pieceHeight, randomX, randomY, pieceWidth, pieceHeight);
  }
  $("#solve").unbind("click").on("click", solve);
  document.onmousedown = onPuzzleClick;
}

function getPiece() {
  for (let i = 0; i < pieces.length; i++) {
    if (mouse.x < pieces[i].curX || mouse.x > (pieces[i].curX + pieceWidth) || mouse.y < pieces[i].curY || mouse.y > (pieces[i].curY + pieceHeight)) {
    }
    else {
      return pieces[i];
    }
  }
  return null;
}

function onPuzzleClick(e) {
  mouseUpdate(e);
  clickedPiece = getPiece();

  if (clickedPiece != null) {
    new Audio('./media/hold.wav').play();
    ctx.clearRect(clickedPiece.curX, clickedPiece.curY, pieceWidth, pieceHeight);
    updatePuzzle(e);
    ctx.save();
    ctx.globalAlpha = .7;
    ctx.drawImage(img, clickedPiece.solX, clickedPiece.solY, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    ctx.restore();
    document.onmousemove = updatePuzzle;
    document.onmouseup = dropPiece;
  }
}

function updatePuzzle(e) {
  mouseUpdate(e);
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i] == clickedPiece) {
      continue;
    }
    ctx.drawImage(img, pieces[i].solX, pieces[i].solY, pieceWidth, pieceHeight, pieces[i].curX, pieces[i].curY, pieceWidth, pieceHeight);
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
      $("#randomize").on("click", shuffle);
    }
  });
}

function solve() {
  disableClick();
  $("#solve").unbind("click");
  $("#randomize").unbind("click");
  animate({
    duration: 1000,
    timing(timeFraction) {
      return timeFraction;
    },
    draw(progress) {
      ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
      for (i = 0; i < pieces.length; i++) {
        piece = pieces[i];
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
  for (let i = 0; i < pieces.length; i++) {
    ctx.drawImage(img, pieces[i].solX, pieces[i].solY, pieceWidth, pieceHeight, pieces[i].curX, pieces[i].curY, pieceWidth, pieceHeight);
    if (!between(pieces[i].curX, pieces[i].solX - error, pieces[i].solX + error) ||
      !between(pieces[i].curY, pieces[i].solY - error, pieces[i].solY + error)) {
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
  initPuzzle();
}
