import layers from './layers.js';
import * as pieces from './pieces';
import recolorAll from './pieceImages.js';
import socket from '../socket.js';

var paper;
var matchInfo;
var squareSize = 256;
var pieceImages;
var size = [null, null];
var toPlace = false;

const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

async function recolorImages() {
    pieceImages = recolorAll(hexToRgb(localStorage['fc-color-a']), hexToRgb(localStorage['fc-color-b']));
    new Promise(async res => {
        if (!matchInfo.started) {
            pieceImages = await pieceImages;
            let pieceMenu = document.getElementById('pieceMenu');
            pieceMenu.innerHTML = '';
            let selectPiece = (el, piece) => {
                Array.from(pieceMenu.children).forEach(child => child.classList.remove('selected'));
                el.classList.add('selected');

                toPlace = piece;
            }
            Object.entries(pieceImages).forEach(pieceImage => pieceImage[1].forEach((image, side) => {
                let piece = pieces[pieceImage[0]];
                let el = document.createElement('img');
                el.title = `${piece.name[0].toUpperCase()}${piece.name.slice(1)} - ${piece.desc}`;
                el.onclick = () => selectPiece(el, [piece.name, side]);
                el.src = image.src;
                pieceMenu.append(el);
            }));

            let remove = document.createElement('img');
            remove.title = 'Remove piece';
            remove.onclick = () => selectPiece(remove, null);
            remove.src = '/removepiece.png';
            pieceMenu.append(remove);
        }
    });
}

function drawGrid() {
    if (size[0] != matchInfo.width || size[1] != matchInfo.height) {
        Object.values(paper).forEach(layer => {
            layer.canvas.width = squareSize * matchInfo.width;
            layer.canvas.height = squareSize * matchInfo.height;
        });
        drawPieces();
        size = [matchInfo.width, matchInfo.height];
    }

    for (let x = 0; x < matchInfo.width; x++) {
        for (let y = 0; y < matchInfo.height; y++) {
            paper.grid.ctx.fillStyle = (((x % 2) ? y+1 : y) % 2) ? localStorage['fc-color-c'] : localStorage['fc-color-d'];
            paper.grid.ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }
}

async function drawPieces() {
    pieceImages = await pieceImages;

    paper.pieces.ctx.clearRect(0, 0, paper.pieces.canvas.width, paper.pieces.canvas.height);

    for (let x = 0; x < matchInfo.width; x++) {
        for (let y = 0; y < matchInfo.height; y++) {
            let piece = matchInfo.black ? matchInfo.board[matchInfo.height-y-1][matchInfo.width-x-1] : matchInfo.board[y][x];
            if (piece != null) {
                paper.pieces.ctx.drawImage(pieceImages[piece[0]][piece[1]], x * squareSize, y * squareSize, squareSize, squareSize);
            }
        }
    }
}

function mouseCanvasLocation(event) {
    let r = event.target.getBoundingClientRect();
    let canvasBoxRatio = r.width / r.height; //gives width:height ratio of THE CANVAS' CONTAINER in format x:1
    let canvasRatio = matchInfo.width / matchInfo.height; //gives width:height ratio of THE ACTUAL EDITABLE AREA OF THE CANVAS in format x:1
    let full = canvasRatio > canvasBoxRatio ? 'x' : 'y'; //which axises of the container and the editable area have the same dimensions
    let fullDimension = full == 'x' ? 'width' : 'height';
    let partiallyFull = full == 'x' ? 'y' : 'x';
    let dimension = partiallyFull == 'x' ? 'width' : 'height'; //convert axis name to dimension name
    let padding = (r[dimension] - ((partiallyFull == 'x' ? canvasRatio / canvasBoxRatio : canvasBoxRatio / canvasRatio) * r[dimension])) / 2; //the distance between (the sides of the canvas which don't touch the canvas' container) and (the edge of the canvas' container)
    //console.log(r[dimension], canvasBoxRatio, canvasRatio, (canvasRatio / canvasBoxRatio * r[dimension]), r[dimension] - (canvasRatio / canvasBoxRatio * r[dimension]), padding * 2, padding);
    let location = {
        x: event.layerX,
        y: event.layerY,
    };
    location[partiallyFull] -= padding;
    location[fullDimension] = r[fullDimension];
    location[dimension] = r[dimension] - (padding * 2);
    if (location[partiallyFull] < 0 || location[partiallyFull] > location[dimension])
        return null;
    else {
        return location;
    }
}

function mouseGridLocation(event) {
    let mouseLocation = mouseCanvasLocation(event);
    if (mouseLocation == null)
        return null;
    else
        return {
            x: Math.floor(mouseLocation.x / mouseLocation.width * matchInfo.width),
            y: Math.floor(mouseLocation.y / mouseLocation.height * matchInfo.height),
        };
}

function start(initialMatchInfo) {
    matchInfo = initialMatchInfo;

    paper = Object.fromEntries(layers.map(layer => {
        let canvas = document.getElementById(`${layer}Layer`);
        return [
            layer,
            {
                canvas,
                ctx: canvas.getContext('2d'),
            }
        ];
    }));

    paper.toPlace.canvas.onmousemove = async event => {
        if (toPlace !== false) {
            paper.toPlace.ctx.clearRect(0, 0, paper.toPlace.canvas.width, paper.toPlace.canvas.height);
            let location = mouseGridLocation(event);
            if (location == null)
                return;
            paper.toPlace.ctx.globalAlpha = 0.5;

            if (toPlace === null) {
                paper.toPlace.ctx.fillStyle = (((location.x % 2) ? location.y+1 : location.y) % 2) ? localStorage['fc-color-c'] : localStorage['fc-color-d'];
                paper.toPlace.ctx.fillRect(location.x * squareSize, location.y * squareSize, squareSize, squareSize);
            } else {
                pieceImages = await pieceImages;
                paper.toPlace.ctx.drawImage(pieceImages[toPlace[0]][toPlace[1]], location.x*squareSize, location.y*squareSize);
            }
        } 
    };
    paper.toPlace.canvas.onmouseleave = () => paper.toPlace.ctx.clearRect(0, 0, paper.toPlace.canvas.width, paper.toPlace.canvas.height);
    paper.toPlace.canvas.onmousedown = event => {
        let location = mouseGridLocation(event);
        if (location != null)
            socket.emit('place', matchInfo.black ? matchInfo.width-location.x-1 : location.x, matchInfo.black ? matchInfo.height-location.y-1 : location.y, toPlace)
    };

    if (matchInfo.started) {
        paper.toPlace.canvas.remove();
    }

    recolorImages();
    drawGrid();
}

function place(x, y, piece) {
    matchInfo.board[y][x] = piece;
    drawPieces();
};

function resize(width, height, board) {
    console.log(width, height, board)
    matchInfo.width = width;
    matchInfo.height = height;
    matchInfo.board = board;
    drawGrid();
}

export {
    start,
    recolorImages,
    drawGrid,
    drawPieces,
    place,
    resize,
};