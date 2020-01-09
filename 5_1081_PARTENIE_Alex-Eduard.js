var puzzleWidth,
  puzzleHeight,
  pieceWidth,
  pieceHeight,
  difficulty = 2,
  file,
  canvas,
  ctx,
  canvasButtons,
  ctxB,
  canvasDif,
  ctxD,
  pieces,
  clickedPiece,
  pieceOffsetX = 0,
  pieceOffsetY = 0,
  img,
  mouse,
  mouseB,
  mouseD,
  timeOut = null,
  averageRBG = "cyan";

$(document).ready(function() {
  $("#conta").hide();
});

window.addEventListener(
  "dragover",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
  },
  false,
);

window.addEventListener(
  "drop",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    file = e.dataTransfer.files[0];
    compress(file);
  },
  false,
);

window.onresize = () => {
  if (canvas) {
    if (timeOut != null) clearTimeout(timeOut);
    timeOut = setTimeout(function() {
      compress(file);
    }, 20);
  }
};

function difficultyEvent(e) {
  mouseD = mouseUpdate(e, canvasDif);
  difficulty = Math.round((mouseD.x / canvasDif.width) * 4) + 2;
  drawDif();
  onImage();
}

function eventSolve(e) {
  mouseB = mouseUpdate(e, canvasButtons);
  if (mouseB.x > canvasButtons.width / 2) {
    solve();
  }
}

function eventShuffle(e) {
  mouseB = mouseUpdate(e, canvasButtons);
  if (mouseB.x < canvasButtons.width / 2) {
    shuffle();
  }
}

function disableClick() {
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
}

function setSolveButton() {
  canvasButtons.addEventListener("click", eventSolve);
}

function setShuffleButton() {
  canvasButtons.addEventListener("click", eventShuffle);
}

function unsetSolveButton() {
  canvasButtons.removeEventListener("click", eventSolve);
}

function unsetShuffleButton() {
  canvasButtons.removeEventListener("click", eventShuffle);
}

function setDificultyBar() {
  canvasDif.addEventListener("mousedown", difficultyEvent);
}

function unsetDificultyBar() {
  canvasDif.removeEventListener("mousedown", difficultyEvent);
}

$("#uploadedFile").change((e) => {
  file = e.target.files[0];
  compress(file);
});

function setImg(_img) {
  img = _img;
  img.onload = onImage;
}

function compress(file) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    let img = new Image();
    img.src = event.target.result;
    (img.onload = () => {
      let tempCanv = document.createElement("canvas");

      let height = window.innerHeight * 0.8;
      let scaleTemp = height / img.height;

      tempCanv.height = height;
      tempCanv.width = img.width * scaleTemp;

      let context = tempCanv.getContext("2d");
      context.drawImage(img, 0, 0, tempCanv.width, tempCanv.height);

      try {
        averageRBG = getAverageColor(tempCanv, context);
      } catch (err) {
        console.warn(err);
        averageRBG = "cyan";
      }

      let data = context.canvas.toDataURL(img, "image/jpeg", 1);

      let result = new Image();
      result.src = data;

      setImg(result);
    }),
      (reader.onerror = (error) => console.log(error));
  };
}

function onImage(e) {
  $("#conta").show();
  $("#uploadButton").hide();
  configCanvas();
  configPuzzle();
}

function configCanvas() {
  calculateDimensions();
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid white";

  canvasButtons = document.getElementById("canvasButtons");
  ctxB = canvasButtons.getContext("2d");

  canvasButtons.width = puzzleWidth;
  canvasButtons.height = 30;

  ctxB.fillStyle = "white";
  ctxB.fillRect(0, 0, canvasButtons.width, canvasButtons.height);
  ctxB.strokeStyle = "black";
  ctxB.lineWidth = 2;
  ctxB.beginPath();
  ctxB.moveTo(canvasButtons.width / 2, 0);
  ctxB.lineTo(canvasButtons.width / 2, canvasButtons.height);
  ctxB.stroke();
  ctxB.font = "20px Verdana";
  ctxB.fillStyle = "black";
  ctxB.fillText(
    "Randomize",
    0,
    canvasButtons.height / 2 + 7,
    canvasButtons.width / 2,
  );
  ctxB.fillText(
    "Solve",
    canvasButtons.width / 2,
    canvasButtons.height / 2 + 7,
    canvasButtons.width / 2,
  );

  canvasDif = document.getElementById("canvasDif");
  ctxD = canvasDif.getContext("2d");
  canvasDif.width = puzzleWidth;
  canvasDif.height = 15;
  canvasDif.style.border = "1px solid black";

  drawDif();
  setDificultyBar();
}

function drawDif() {
  const fill = ((difficulty - 2) / 4) * canvasDif.width;
  ctxD.fillStyle = "white";
  ctxD.fillRect(0, 0, canvasDif.width, canvasDif.height);
  ctxD.fillStyle = averageRBG;
  ctxD.fillRect(0, 0, fill, canvasDif.height);
  ctxD.fillStyle = "black";
  ctxD.fillText(
    "Dificulty: " + difficulty,
    0,
    canvasDif.height / 2 + 4,
    canvasDif.width,
  );
}

function configPuzzle() {
  unsetShuffleButton();
  unsetSolveButton();
  disableClick();
  pieces = [];
  mouse = {
    x: 0,
    y: 0,
  };
  clickedPiece = null;
  ctx.drawImage(img, 0, 0, puzzleWidth, puzzleHeight);
  build();
}

function build() {
  let x = 0;
  let y = 0;
  for (let i = 0; i < difficulty * difficulty; i++) {
    let piece = { key: i, solX: x, solY: y, curX: 0, curY: 0 };
    pieces.push(piece);
    x += pieceWidth;
    if (x >= puzzleWidth) {
      x = 0;
      y += pieceHeight;
    }
  }
  setShuffleButton();
}

function shuffle() {
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  for (let i = 0; i < pieces.length; i++) {
    let randomX = Math.floor(Math.random() * (puzzleWidth - pieceWidth));
    let randomY = Math.floor(Math.random() * (puzzleHeight - pieceHeight));
    pieces[i].curX = randomX;
    pieces[i].curY = randomY;
    ctx.drawImage(
      img,
      pieces[i].solX,
      pieces[i].solY,
      pieceWidth,
      pieceHeight,
      randomX,
      randomY,
      pieceWidth,
      pieceHeight,
    );
  }
  setSolveButton();
  document.onmousedown = onPuzzleClick;
}

function getPiece() {
  for (let i = 0; i < pieces.length; i++) {
    if (
      !(
        mouse.x < pieces[i].curX ||
        mouse.x > pieces[i].curX + pieceWidth ||
        mouse.y < pieces[i].curY ||
        mouse.y > pieces[i].curY + pieceHeight
      )
    ) {
      return pieces[i];
    }
  }
  return null;
}

function onPuzzleClick(e) {
  mouse = mouseUpdate(e, canvas);
  clickedPiece = getPiece();
  if (clickedPiece != null) {
    pieces.splice(pieces.indexOf(clickedPiece), 1);
    pieces.push(clickedPiece);
    pieceOffsetX = mouse.x - clickedPiece.curX;
    pieceOffsetY = mouse.y - clickedPiece.curY;
    new Audio("./media/hold.wav").play();
    drawPuzzle(e);
    document.onmousemove = drawPuzzle;
    document.onmouseup = dropPiece;
  }
}

function drawPuzzle(e) {
  mouse = mouseUpdate(e, canvas);
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i] != clickedPiece) {
      ctx.drawImage(
        img,
        pieces[i].solX,
        pieces[i].solY,
        pieceWidth,
        pieceHeight,
        pieces[i].curX,
        pieces[i].curY,
        pieceWidth,
        pieceHeight,
      );
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.drawImage(
    img,
    clickedPiece.solX,
    clickedPiece.solY,
    pieceWidth,
    pieceHeight,
    mouse.x - pieceOffsetX,
    mouse.y - pieceOffsetY,
    pieceWidth,
    pieceHeight,
  );
  ctx.restore();
}

function dropPiece() {
  clickedPiece.curX = mouse.x - pieceOffsetX;
  clickedPiece.curY = mouse.y - pieceOffsetY;
  document.onmousemove = null;
  document.onmouseup = null;
  new Audio("./media/release.wav").play();
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
      setShuffleButton();
      setDificultyBar();
    }
  });
}

function solve() {
  disableClick();
  unsetSolveButton();
  unsetShuffleButton();
  unsetDificultyBar();
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
        ctx.drawImage(
          img,
          piece.solX,
          piece.solY,
          pieceWidth,
          pieceHeight,
          piece.curX,
          piece.curY,
          pieceWidth,
          pieceHeight,
        );
      }
    },
  });
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function checkAndReset() {
  ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
  let error = Math.min(puzzleWidth / 20, puzzleHeight / 20) + 3;
  let win = true;
  for (let i = 0; i < pieces.length; i++) {
    ctx.drawImage(
      img,
      pieces[i].solX,
      pieces[i].solY,
      pieceWidth,
      pieceHeight,
      pieces[i].curX,
      pieces[i].curY,
      pieceWidth,
      pieceHeight,
    );
    if (
      !between(
        pieces[i].curX,
        pieces[i].solX - error,
        pieces[i].solX + error,
      ) ||
      !between(pieces[i].curY, pieces[i].solY - error, pieces[i].solY + error)
    ) {
      win = false;
    }
  }
  if (win) {
    setTimeout(() => {
      let done = new Audio("./media/done.wav");
      done.volume = 0.5;
      done.play();
      configPuzzle();
    }, 500);
  }
}
