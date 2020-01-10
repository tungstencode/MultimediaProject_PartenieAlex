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
  averageRBG = "cyan",
  shuffleAudio = new Audio("./media/shuffle.wav"),
  solveAudio = new Audio("./media/solve.wav"),
  difficultyAudio = new Audio("./media/difficulty.wav");

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
    resize(file);
  },
  false,
);
// Cand se face resize se apeleaza
// functia de redimensionare a imaginii
window.onresize = () => {
  if (canvas) {
    if (timeOut != null) clearTimeout(timeOut);
    timeOut = setTimeout(function() {
      resize(file);
    }, 20);
  }
};
// Evenimente pentru a usura activarea/dezactivarea butoanelor
function difficultyEvent(e) {
  mouseD = mouseUpdate(e, canvasDif);
  difficulty = Math.round((mouseD.x / canvasDif.width) * 4) + 2;
  difficultyAudio.volume = difficulty / 6;
  console.log(difficultyAudio.volume)
  difficultyAudio.play();
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
// Functii ajutatoare pentru intelegere usoara
// Enable/disable pentru actiunile utilizatorului
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
// Cand inputul primeste un fisier il redimensioneaza
$("#uploadedFile").change((e) => {
  file = e.target.files[0];
  resize(file);
});
// Primeste imaginea procesata din resize
// Cand se incarca se apeleaza evenimentul
// care configureaza canvasul si puzzle-ul
function setImg(_img) {
  img = _img;
  img.onload = onImage;
}
// Primeste un obiect de tip File si este
// redimensionat cu ajutorul unui canvas temporar
function resize(file) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    let img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      let tempCanv = document.createElement("canvas");
      // Dimensiunile sunt la fel ca in css pentru conta
      let height = window.innerHeight * 0.8;
      let width = window.innerWidth * 0.65;
      let scaleTemp = Math.min(height / img.height, width / img.width);
      // Se redimensioneaza in functie de container
      tempCanv.height = img.height * scaleTemp;
      tempCanv.width = img.width * scaleTemp;

      let context = tempCanv.getContext("2d");
      context.drawImage(img, 0, 0, tempCanv.width, tempCanv.height);
      // Seteaza background-ul cu media de culoare din imagine
      try {
        let rgb = getAverageColor(tempCanv, context);
        averageRBG = rgbToHex(rgb);
        document.getElementsByTagName("body")[0].style.background = averageRBG;
      } catch (err) {
        console.warn(err);
        averageRBG = "cyan";
      }
      // Luam informatia la calitate 100% sub format jpeg
      let data = context.canvas.toDataURL(img, "image/jpeg", 1);
      let result = new Image();
      result.src = data;
      // Trimitem imaginea modificata
      setImg(result);
    };
  };
}
// Eveniment pentru cand imaginea este incarcata
function onImage(e) {
  $("#conta").show();
  $("#uploadButton").hide();
  shuffleAudio.volume = 0;
  shuffleAudio.play();
  shuffleAudio.volume = 0.8;
  configCanvas();
  configPuzzle();
}
// Seteaza dimensiunile si deseneaza butoanele si bara de dificultate
function configCanvas() {
  // Calcularea dimensiunilor se face dupa dificultate
  // A fost luata de la un articol
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
  //Linie despartitoare
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
  // Deseneaza bara de dificultate default(2)
  drawDif();
  // Lasa utilizatorul sa seteze dificultatea
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
  // Oprim toate butoanele si abiliatatea de a da click pe puzzle
  // In caz contrar se poate apuca o piesa dupa ce a fost rezovlat
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
// Contruirea vectorului de piese si salvarea pozitiilor corecte
function build() {
  let x = 0;
  let y = 0;
  for (let i = 0; i < difficulty * difficulty; i++) {
    let piece = { key: i, solX: x, solY: y, curX: 0, curY: 0 };
    pieces.push(piece);
    x += pieceWidth;
    // Cand se termina un rand trecem la urmatorul
    if (x >= puzzleWidth) {
      x = 0;
      y += pieceHeight;
    }
  }
  // Activam butonul de amestecare a pieselor
  setShuffleButton();
}
// Fiecare piesa primeste o coordonata intre 0 si puzzleWidth, puzzleHeight
// Avand grija sa fie in canvas
function shuffle() {
  shuffleAudio.play();
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
  // Activam butonul pentru a putea rezolva puzzle-ul automat
  setSolveButton();
  document.onmousedown = onPuzzleClick;
}
// Merge de la sfarsit la inceput pentru a apuca
// doar piesa care in fata celorlalte
function getPiece() {
  for (let i = pieces.length - 1; i >= 0; i--) {
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
// Cand se da clic pe canvas se updateaza mouse-ul
// Si se verifica daca am "prins" o piesa cand am dat click
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
    // Se redesenaza canvasul la fiecare miscare de mouse
    document.onmousemove = drawPuzzle;
    document.onmouseup = dropPiece;
  }
}
// Deseneaza celelalte piese apoi deseneaza piesa apucata cu transparenta 70%
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
// Cand se da drumul la click piesa ia valorile mouse-ului
// cu offsetul fata de piesa din momentul apucarii
function dropPiece() {
  clickedPiece.curX = mouse.x - pieceOffsetX;
  clickedPiece.curY = mouse.y - pieceOffsetY;
  document.onmousemove = null;
  document.onmouseup = null;
  new Audio("./media/release.wav").play();
  // Se verifica daca e complet
  checkAndReset();
}
// Deseneaza cu progress fiecare piesa
// Progres este un procent din timpul total
// Iar la sfarsit se verifica iar si se reactiveaza
// butonul de amestecare si bara de dificultate(oprite cand se da click pe solve)
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
// Oprim toate functiile accesibile utilizatorului
// Se incepe animatia iar in functia draw trecem prin fiecare
// piesa si ne apropiem de solX respectiv solY
// Timing(..) este folosita pentru a pastra progresul de la un frame la altul
function solve() {
  solveAudio.play();
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
        // Crestem diferenta intre coordonatele actuale si cele finale pana se ajunge la rezultat
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
// Veriifca daca coordonatele sunt corecte, cu o marja
// de eroare relativa la marimea canvasului
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
