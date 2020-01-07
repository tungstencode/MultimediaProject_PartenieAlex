$(document).ready(function () {
  $('[data-toggle="popover"]').popover();
  $("#conta").hide();
});

$("#popoverUpload").popover({ trigger: "hover focus" });

window.ondragover = function (e) { e.preventDefault(); };

window.ondrop = function (e) {
  e.preventDefault();
  compress(e);
};

window.onresize = () => {
  if (canvas) {
    init(img);
  }
};

$("#uploadedFile").change((e) => {
  console.log("uploaded");
  console.log(e.target.files[0]);
  compress(e);
});

function compress(e) {
  const fileName = e.target.files[0].name;
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
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


var PUZZLEDIFFICULTY = $("#dificulty").val();
$("#dificulty").change((e) => {
  PUZZLEDIFFICULTY = parseInt(e.target.value);
  onImage();
});
$("#dificulty").on("click", ((e) => {
  PUZZLEDIFFICULTY = parseInt(e.target.value);
  onImage();
}));

const PUZZLEHOVERTINT = '#a6c';
var scale;
var canvas;
var stage;
var img;
var pieces;
var puzzleWidth;
var puzzleHeight;
var pieceWidth;
var pieceHeight;
var currentPiece;
var currentDropPiece;

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
  pieceWidth = Math.floor(img.width / PUZZLEDIFFICULTY);
  pieceHeight = Math.floor(img.height / PUZZLEDIFFICULTY);
  puzzleWidth = pieceWidth * PUZZLEDIFFICULTY;
  puzzleHeight = pieceHeight * PUZZLEDIFFICULTY;
  setCanvas();
  initPuzzle();
}

function initPuzzle() {
  pieces = [];
  mouse = { x: 0, y: 0 };
  currentPiece = null;
  currentDropPiece = null;
  stage.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
  buildPieces();
}

function buildPieces() {
  var i;
  var piece;
  var xPos = 0;
  var yPos = 0;
  for (i = 0; i < PUZZLEDIFFICULTY * PUZZLEDIFFICULTY; i++) {
    piece = {};
    piece.i = i;
    piece.sx = xPos;
    piece.sy = yPos;
    pieces.push(piece);
    xPos += pieceWidth;
    if (xPos >= puzzleWidth) {
      xPos = 0;
      yPos += pieceHeight;
    }
  }
  $("#randomize").on("click", shufflePuzzle);
}

function shufflePuzzle() {
  pieces = shuffleArray(pieces);
  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var i;
  var piece;
  var xPos = 0;
  var yPos = 0;
  for (i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    piece.xPos = xPos;
    piece.yPos = yPos;
    stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, yPos, pieceWidth, pieceHeight);
    stage.strokeRect(xPos, yPos, pieceWidth, pieceHeight);
    xPos += pieceWidth;
    if (xPos >= puzzleWidth) {
      xPos = 0;
      yPos += pieceHeight;
    }
  }
  $("#solve").unbind("click").on("click", solve);
  document.onmousedown = onPuzzleClick;
}

function shuffleArray(o) {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function onPuzzleClick(e) {
  if (e.layerX || e.layerX == 0) {
    mouse.x = e.layerX - canvas.offsetLeft;
    mouse.y = e.layerY - canvas.offsetTop;
  }
  else if (e.offsetX || e.offsetX == 0) {
    mouse.x = e.offsetX - canvas.offsetLeft;
    mouse.y = e.offsetY - canvas.offsetTop;
  }
  currentPiece = checkPieceClicked();
  if (currentPiece != null) {
    new Audio('hold.wav').play();
    stage.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
    stage.save();
    stage.globalAlpha = .9;
    stage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    stage.restore();
    document.onmousemove = updatePuzzle;
    document.onmouseup = pieceDropped;
  }
}

function checkPieceClicked() {
  var i;
  var piece;
  for (i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    if (mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)) {
      //PIECE NOT HIT
    }
    else {
      return piece;
    }
  }
  return null;
}

function updatePuzzle(e) {
  currentDropPiece = null;
  if (e.layerX || e.layerX == 0) {
    mouse.x = e.layerX - canvas.offsetLeft;
    mouse.y = e.layerY - canvas.offsetTop;
  }
  else if (e.offsetX || e.offsetX == 0) {
    mouse.x = e.offsetX - canvas.offsetLeft;
    mouse.y = e.offsetY - canvas.offsetTop;
  }
  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var i;
  var piece;
  for (i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    if (piece == currentPiece) {
      continue;
    }
    stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
    stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
    if (currentDropPiece == null) {
      if (mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)) {
        //NOT OVER
      }
      else {
        currentDropPiece = piece;
        stage.save();
        stage.globalAlpha = .4;
        stage.fillStyle = PUZZLEHOVERTINT;
        stage.fillRect(currentDropPiece.xPos, currentDropPiece.yPos, pieceWidth, pieceHeight);
        stage.restore();
      }
    }
  }
  stage.save();
  stage.globalAlpha = .6;
  stage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
  stage.restore();
  stage.strokeRect(mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
}

function pieceDropped(e) {
  document.onmousemove = null;
  document.onmouseup = null;
  if (currentDropPiece != null) {
    var tmp = { xPos: currentPiece.xPos, yPos: currentPiece.yPos };
    currentPiece.xPos = currentDropPiece.xPos;
    currentPiece.yPos = currentDropPiece.yPos;
    currentDropPiece.xPos = tmp.xPos;
    currentDropPiece.yPos = tmp.yPos;
  }
  new Audio('release.wav').play();
  resetPuzzleAndCheckWin();
}

function animate({ timing, draw, duration }) {

  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timing(timeFraction);

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    } else {
      resetPuzzleAndCheckWin();
    }
  });
}

function solve() {
  $("#solve").unbind("click");
  for (var i = 1; i < pieces.length; i++) {
    var tmp = pieces[i];
    for (var j = i - 1; j >= 0 && (pieces[j].i > tmp.i); j--) {
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
      for (k = 0; k < pieces.length; k++) {
        piece = pieces[k];
        piece.xPos = piece.xPos + (piece.sx - piece.xPos) * progress;
        piece.yPos = piece.yPos + (piece.sy - piece.yPos) * progress;
        stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
      }
    }
  });
}

function resetPuzzleAndCheckWin() {
  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var gameWin = true;
  var i;
  var piece;
  for (i = 0; i < pieces.length; i++) {
    piece = pieces[i];
    stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
    stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
    if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
      gameWin = false;
    }
  }
  if (gameWin) {
    setTimeout(gameOver, 500);
  }
}

function gameOver() {
  new Audio('done.mp3').play();
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
  initPuzzle();
}

function setCanvas() {
  canvas = document.getElementById('canvas');
  stage = canvas.getContext('2d');
  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid black";
  roundRect(stage, 0, 0, canvas.width, canvas.height, 5);
  stage.drawImage(img, 0, 0, img.width * scale, img.height * scale);

}

function roundRect(ctx, x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.moveTo(x + radius, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}
