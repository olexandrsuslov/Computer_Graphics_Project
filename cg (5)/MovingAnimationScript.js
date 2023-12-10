
// Отримати елементи канвасу та контекст
const refGridCanvas = document.getElementById('gridCanvas');
const squareCanvas = document.getElementById('squareCanvas');
const refGridContext = refGridCanvas.getContext('2d');
const squareContext = squareCanvas.getContext('2d');

// Отримати елементи вводу та повзунків
const axInput = document.getElementById('axInput');
const ayInput = document.getElementById('ayInput');
const cxInput = document.getElementById('cxInput');
const cyInput = document.getElementById('cyInput');
const stepInput = document.getElementById('stepInput');
const scaleInput = document.getElementById('scaleInput');
const rotateInput = document.getElementById('rotateInput');
const vxInput = document.getElementById('vxInput');
const vyInput = document.getElementById('vyInput');
const scaleInputNum = document.getElementById('scaleInputNumber');
const rotateInputNum = document.getElementById('rotateInputNumber');

// Отримати елементи для відображення значень
const stepLabel = document.getElementById('stepLabel');
const scaleLabel = document.getElementById('scaleLabel');
const rotateLabel = document.getElementById('rotateLabel');

const animateBtn = document.getElementById('AnimateBtn');
const drawSquareBtn = document.getElementById('DrawSquareBtn');
const saveBtn = document.getElementById('SaveImgBtn');

var step ;
var diagonal = {};
var transformations = {
    rotate: 0,
    scale: 1,
    vector: {
      x: 0,
      y: 0,
    },
  };

  var isAnimating = false;
  const orderArray =[3,2,1];
  var squareCoordinates ={};

  const clearCanvas = (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const isValidDiagonal = (diagonal) => {
    return diagonal?.a?.x && diagonal.a.y && diagonal.c?.x && diagonal.c?.y;
  };
  
  const drawSquareIfValid = (ctx, diagonal, step) => {
    if (!isValidDiagonal(diagonal)) return;
    if (!isSquare(diagonal.a, diagonal.c)) return;
  
    const coordinates = createRectanglePoints(diagonal);
    drawRectangle(ctx, coordinates, step);
    return coordinates;
  };
  
  const drawGrid = (ctx, step) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#4f4f4f';
  
    const drawVerticalLine = (x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    };
  
    const drawHorizontalLine = (y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    };
  
    ctx.lineWidth = 3;
    drawHorizontalLine(height / 2);
    drawVerticalLine(width / 2);
    ctx.lineWidth = 0.5;
  
    const fontSize = step / 2.5;
    ctx.font = `${fontSize}px Nunito`;
  
    for (let i = 0; i < width / 2 / step; i++) {
      const xRight = width / 2 + i * step;
      const xLeft = width / 2 - i * step;
  
      drawVerticalLine(xRight);
  
      ctx.fillText(
        (xRight - width / 2) / step,
        xRight + fontSize / 3,
        height / 2 + fontSize
      );
  
      drawVerticalLine(xLeft);
  
      ctx.fillText(
        (xLeft - width / 2) / step,
        xLeft + fontSize / 3,
        height / 2 + fontSize
      );
  
      const yBottom = height / 2 + i * step;
      const yTop = height / 2 - i * step;
  
      drawHorizontalLine(yBottom);
  
      ctx.fillText(
        (-1 * (yBottom - height / 2)) / step,
        width / 2 + fontSize / 3,
        yBottom + fontSize
      );
  
      drawHorizontalLine(yTop);
  
      ctx.fillText(
        (-1 * (yTop - height / 2)) / step,
        width / 2 + fontSize / 3,
        yTop + fontSize
      );
    }
  };
    
  const createRectanglePoints = (diagonal) => {
    if (!diagonal.a || !diagonal.c) return;
  
    const { a, c } = diagonal;
  
    return {
      a,
      b: {
        x: a.x,
        y: c.y,
      },
      c,
      d: {
        x: c.x,
        y: a.y,
      },
    };
  };

  //prmitive useEffect
  function handleDiagonalChange(canvas, diagonal, step) {
    const ctx = canvas.getContext('2d');
    clearCanvas(canvas, ctx);
    const coordinates = drawSquareIfValid(ctx, diagonal, step);
    if (coordinates) {
      squareCoordinates = coordinates;
    }
  }

  function handleStepChange() {
    //console.log('step: ', step);
  
    const gridCanvas = refGridCanvas;
    const gridCtx = gridCanvas.getContext('2d');
    drawGrid(gridCtx, step);
  
    const canvas = squareCanvas ;
    const squareCtx = canvas.getContext('2d');
    clearCanvas(canvas, squareCtx);
    drawSquareIfValid(squareCtx, diagonal, step);
  }
  
 //Transformation setters

const setCoordinate = (coordinate, axis, value) => {
    diagonal = {...diagonal, [coordinate]: {
        ...diagonal[coordinate],[axis]: value, },
    };
    handleDiagonalChange(squareCanvas,diagonal,step);
    console.log(diagonal);
  };
  
function setScale (value) {
    transformations.scale = value/10;
    //console.log(transformations);
  }

function setRotate(value){
    transformations.rotate = value;
}

function setTranslateVector(axis, value)
{
    transformations.vector= {...transformations.vector,
        [axis]: parseFloat(value),
      };
}

//For animations
const isSquare = (a, c) => {
    if (!a || !c) return false;
    console.log(a.x - c.x, a.y - c.y, ': ', c.x - a.x, a.y - c.y);
    return a.x - c.x === a.y - c.y || c.x - a.x === a.y - c.y;
  };
  
  function applyTransformations() {
    isAnimating = true;
    animateTransformations().then(() => {
      isAnimating = false;
    });
  }
  
  function animateTransformations() {
    return new Promise((resolve) => {
      let startTime = null;
      const durationMiliseconds = 1000;
  
      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
  
        const progress = Math.min(elapsedTime / durationMiliseconds, 1);
  
        const currentCoordinates = getCurrentCoordinates(progress);
  
        const canvas = squareCanvas;
        const ctx = canvas.getContext('2d');
        drawRectangle(ctx, currentCoordinates, step);
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
  
      requestAnimationFrame(animate);
    });
  }
  
  function getCurrentCoordinates(progress) {
    let transformMatrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  
    orderArray.forEach((value) => {
      switch (value) {
        case 1:
          transformMatrix = multiplyMatrix(
            transformMatrix,
            createTranslationMatrix(transformations.vector, progress)
          );
          break;
        case 2:
          transformMatrix = multiplyMatrix(
            transformMatrix,
            createRotationMatrix(transformations.rotate*(-1), progress)
          );
          break;
        case 3:
          transformMatrix = multiplyMatrix(
            transformMatrix,
            createScalingMatrix(transformations.scale, progress)
          );
          break;
        default:
          break;
      }
    });
  
    return applyTransformationMatrix(squareCoordinates, transformMatrix);
  }
  
  function createTranslationMatrix(vector, progress) {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [vector.x * progress, vector.y * progress, 1],
    ];
  }
  
  function createRotationMatrix(angle, progress) {
    const rad = ((angle * Math.PI) / 180) * progress;

    const centerX = (parseFloat(diagonal.a.x) + parseFloat(diagonal.c.x)) / 2;
    const centerY = (parseFloat(diagonal.a.y) + parseFloat(diagonal.c.y)) / 2;
    
    console.log("Diagonal x "+diagonal.a.x + " " + diagonal.c.x);
    console.log("center x"+centerX);
    console.log("Diagonal Y "+diagonal.a.y + " "+ diagonal.c.y);
    console.log("center Y "+centerY);
    
    const cosTheta = Math.cos(rad);
  const sinTheta = Math.sin(rad);
  const translateToOrigin = [
    [1, 0, 0],
    [0, 1, 0],
    [-centerX, -centerY, 1],
  ];

  const rotate = [
    [cosTheta, sinTheta, 0],
    [-sinTheta, cosTheta, 0],
    [0, 0, 1],
  ];

  const translateBack = [
    [1, 0, 0],
    [0, 1, 0],
    [centerX, centerY, 1],
  ];

  // Multiply the matrices: translateBack * rotate * translateToOrigin
  //const resultMatrix = multiplyMatrix(translateBack, multiplyMatrix(rotate, translateToOrigin));
 
  return [
    [cosTheta, sinTheta, 0],
    [-sinTheta, cosTheta, 0],
    [(-centerX*cosTheta)+(centerY*sinTheta)+centerX, (-centerX*sinTheta)-(centerY*cosTheta)+centerY, 1],
  ];
  //return resultMatrix;
  }
  
  function createScalingMatrix(scale, progress) {
    const interpolatedScale = 1 + (scale - 1) * progress;
    return [
      [interpolatedScale, 0, 0],
      [0, interpolatedScale, 0],
      [0, 0, 1],
    ];
  }
  
  function applyTransformationMatrix(coordinates, transformMatrix) {
    const coordinatesMatrix = createMatrixFromCoordinates(coordinates);
    const transformedCoordinates = multiplyMatrix(
      coordinatesMatrix,
      transformMatrix
    );
    return createCoordinatesFromMatrix(transformedCoordinates);
  }
  
  function createMatrixFromCoordinates(coordinates) {
   // console.log(coordinates);
    const { a, b, c, d } = coordinates;
    return [
      [a.x, a.y, 1],
      [b.x, b.y, 1],
      [c.x, c.y, 1],
      [d.x, d.y, 1],
    ];
  }
  
  function createCoordinatesFromMatrix(matrix) {
    return {
      a: {
        x: matrix[0][0],
        y: matrix[0][1],
      },
      b: {
        x: matrix[1][0],
        y: matrix[1][1],
      },
      c: {
        x: matrix[2][0],
        y: matrix[2][1],
      },
      d: {
        x: matrix[3][0],
        y: matrix[3][1],
      },
    };
  }
  
  function multiplyMatrix(a, b) {
    const aNumRows = a.length;
    const aNumCols = a[0].length;
    const bNumCols = b[0].length;
    const result = new Array(aNumRows);
    for (let r = 0; r < aNumRows; ++r) {
      result[r] = new Array(bNumCols);
      for (let c = 0; c < bNumCols; ++c) {
        result[r][c] = 0;
        for (let i = 0; i < aNumCols; ++i) {
          result[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return result;
  }
  
  const drawRectangle = (ctx, coordinates, step) => {
    const modifiedCoordinates = Object.values(coordinates).map((coord) => ({
      x: coord.x * step + 350,
      y: 350 - coord.y * step,
    }));
  
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c74440';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    ctx.beginPath();
    ctx.moveTo(...Object.values(modifiedCoordinates[0]));
    ctx.lineTo(...Object.values(modifiedCoordinates[1]));
    ctx.lineTo(...Object.values(modifiedCoordinates[2]));
    ctx.lineTo(...Object.values(modifiedCoordinates[3]));
    ctx.lineTo(...Object.values(modifiedCoordinates[0]));
  
    ctx.stroke();
  };
  
  // EventListeners and oninputs
stepInput.addEventListener('input', function () {
    stepLabel.textContent = this.value;
    step=this.value;
    handleStepChange();
});

axInput.oninput = function () {
   setCoordinate('a','x', this.value);

};

ayInput.oninput = function () {
    setCoordinate('a','y', this.value) 
 };
 
 cxInput.oninput = function () {
    setCoordinate('c','x', this.value) 
 };
 
 cyInput.oninput = function () {
    setCoordinate('c','y', this.value) 
 };

 scaleInput.addEventListener('input', function () {
    scaleLabel.textContent = this.value/10;
    setScale(this.value);
});
rotateInput.addEventListener('input', function(){
    rotateLabel.textContent = this.value;
    setRotate(this.value);
});

scaleInputNum.addEventListener('input', function(){
    scaleLabel.textContent = this.value;
    setScale(this.value*10);
});

rotateInputNum.addEventListener('input', function(){
    rotateLabel.textContent=this.value;
    setRotate(this.value);
})

vxInput.oninput = function () {
    setTranslateVector('x', this.value) 
 };
 vyInput.oninput=function(){
    setTranslateVector('y', this.value)
 };


animateBtn.addEventListener('click', applyTransformations);

drawSquareBtn.addEventListener('click', function(){
    const gridCanvas = refGridCanvas;
    const gridCtx = gridCanvas.getContext('2d');  
    const canvas = squareCanvas ;
    const squareCtx = canvas.getContext('2d');

    clearCanvas(canvas, squareCtx);
    clearCanvas(gridCanvas, gridCtx);
    drawGrid(gridCtx,step);
    drawSquareIfValid(squareCtx, diagonal, step);
});

saveBtn.addEventListener('click', function(){

    const canvas = document.createElement('canvas');

    const gridCanvas = refGridCanvas;
    const SquareCanvas = squareCanvas;

    canvas.width = gridCanvas.width;
    canvas.height = gridCanvas.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(gridCanvas, 0, 0);
    ctx.drawImage(SquareCanvas, 0, 0);

    const canvasUrl = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = canvasUrl;
    link.download = 'Grid';
    link.click();
    link.remove();
    canvas.remove();
    
});



