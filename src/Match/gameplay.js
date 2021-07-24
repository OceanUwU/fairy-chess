import layers from './layers.js';
import * as pieces from './pieces';
import pieceFn from './pieces/fn.js';
import recolorAll from './pieceImages.js';
import socket from '../socket.js';

var moveImg = new Image();
moveImg.src = '/move.png';
var takeImg = new Image();
takeImg.src = '/take.png';

var paper;
var matchInfo;
var squareSize = 256;
var pieceImages;
var size = [null, null];
var toPlace = false;
var holding = null;
var holdingLocation = null;
var holdingState;
var holdingMoves;

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
                let selected = el.classList.contains('selected');
                Array.from(pieceMenu.children).forEach(child => child.classList.remove('selected'));

                if (selected) {
                    toPlace = false;
                } else {
                    el.classList.add('selected');
                    toPlace = piece;
                }
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

    if (event.touches) {
        event = event.touches[0];
        event.layerX = event.clientX - r.left;
        event.layerY = event.clientY - r.top;
    }

    let canvasBoxRatio = r.width / r.height; //gives width:height ratio of THE CANVAS' CONTAINER in format x:1
    let canvasRatio = matchInfo.width / matchInfo.height; //gives width:height ratio of THE ACTUAL EDITABLE AREA OF THE CANVAS in format x:1
    let full = canvasRatio > canvasBoxRatio ? 'x' : 'y'; //which axises of the container and the editable area have the same dimensions
    let fullDimension = full == 'x' ? 'width' : 'height';
    let partiallyFull = full == 'x' ? 'y' : 'x';
    let dimension = partiallyFull == 'x' ? 'width' : 'height'; //convert axis name to dimension name
    let padding = (r[dimension] - ((partiallyFull == 'x' ? canvasRatio / canvasBoxRatio : canvasBoxRatio / canvasRatio) * r[dimension])) / 2; //the distance between (the sides of the canvas which don't touch the canvas' container) and (the edge of the canvas' container)
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
        [['x', 'width'], ['y', 'height']].forEach(i => location[i[0]] = Math.max(0, Math.min(location[i[0]], location[i[1]]-1)));
        return location;
    }
}

function canvasPos(mouseLocation) {
    return [
        mouseLocation.x / mouseLocation.width * squareSize * matchInfo.width - squareSize / 2,
        mouseLocation.y / mouseLocation.height * squareSize * matchInfo.height - squareSize / 2,
    ];
}

function mouseGridLocation(event, black=false) {
    let mouseLocation = mouseCanvasLocation(event);
    if (mouseLocation == null)
        return null;
    else {
        let location = {
            x: Math.floor(mouseLocation.x / mouseLocation.width * matchInfo.width),
            y: Math.floor(mouseLocation.y / mouseLocation.height * matchInfo.height),
        };
        if (black) {
            location.x = matchInfo.width-location.x-1;
            location.y = matchInfo.height-location.y-1;
        }
        return location;
    }
}

async function holdUpdate() {
    paper.hold.ctx.clearRect(0, 0, paper.hold.canvas.width, paper.hold.canvas.height);
    paper.possibilities.ctx.clearRect(0, 0, paper.possibilities.canvas.width, paper.possibilities.canvas.height);

    document.body.style.cursor = holding === null ? 'auto' : 'grabbing';

    if (holding !== null) {
        //make piece transparent
        paper.hold.ctx.globalAlpha = 0.5;
        paper.hold.ctx.fillStyle = (((holding[1] % 2) ? holding[0]+1 : holding[0]) % 2) ? localStorage['fc-color-c'] : localStorage['fc-color-d'];
        paper.hold.ctx.fillRect(holding[1] * squareSize, holding[0] * squareSize, squareSize, squareSize);
    
        //draw held piece above board
        paper.hold.ctx.globalAlpha = 1;
        pieceImages = await pieceImages;
        let piece = matchInfo.black ? matchInfo.board[matchInfo.width-holding[0]-1][matchInfo.height-holding[1]-1] : matchInfo.board[holding[0]][holding[1]];
        paper.hold.ctx.drawImage(pieceImages[piece[0]][piece[1]], holdingLocation[0], holdingLocation[1]);

        //draw move possibilities
        if (moveImg.complete && takeImg.complete) {
            paper.possibilities.ctx.globalAlpha = 0.3;
            for (let move of holdingMoves) {
                let take = matchInfo.board[move[0]][move[1]] != null && matchInfo.board[move[0]][move[1]][1] != matchInfo.black;
                if (matchInfo.black) {
                    move = move.map((i, index) => matchInfo[['height', 'width'][index]] - i - 1);
                }
                paper.possibilities.ctx.drawImage(take ? takeImg : moveImg, move[1] * squareSize, move[0] * squareSize);
            }
        }
    }
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

    let board = document.getElementById('board');

    board.addEventListener('mousemove', async event => {
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
        } else {
            let location = mouseGridLocation(event, matchInfo.black);
            if (location == null)
                return document.body.style.cursor = 'auto';
            document.body.style.cursor = document.body.style.cursor == 'grabbing' ? 'grabbing' : (matchInfo.board[location.y][location.x] != null && matchInfo.board[location.y][location.x][1] == matchInfo.black ? 'grab' : 'auto');
        }
    });
    board.addEventListener('mouseleave', () => paper.toPlace.ctx.clearRect(0, 0, paper.toPlace.canvas.width, paper.toPlace.canvas.height));
    let place = event => {

        event.preventDefault();
        if (toPlace !== false) {
            let location = mouseGridLocation(event);
            if (location != null)
                socket.emit('place', matchInfo.black ? matchInfo.width-location.x-1 : location.x, matchInfo.black ? matchInfo.height-location.y-1 : location.y, toPlace)
        }
    };
    board.addEventListener('mousedown', place);
    board.addEventListener('touchstart', place);

    let selectPiece = event => {
        event.preventDefault();
        if (toPlace === false) {
            let location = mouseGridLocation(event);
            if (location != null) {
                let piece = matchInfo.black ? matchInfo.board[matchInfo.height-location.y-1][matchInfo.width-location.x-1] : matchInfo.board[location.y][location.x];
                if (piece != null && piece[1] == matchInfo.black) {
                    holding = [location.y, location.x];
                    holdingLocation = canvasPos(mouseCanvasLocation(event));
                    holdingMoves = pieces[piece[0]].moves({
                        board: matchInfo.board,
                        black: matchInfo.black,
                        position: matchInfo.black ? [matchInfo.height-location.y-1, matchInfo.width-location.x-1] : holding,
                        history: matchInfo.history,
                    });
                    holdingMoves = pieceFn.removeInvalidMoves(holdingMoves);
                    holdUpdate();
                }
            }
        }
    };
    board.addEventListener('mousedown', selectPiece);
    board.addEventListener('touchstart', selectPiece);

    let moveSelection = event => {
        if (toPlace === false && holding != null) {
            let location = mouseCanvasLocation(event);
            if (location != null) {
                holdingLocation = canvasPos(mouseCanvasLocation(event));
            } else {
                holding = null;
            }
            holdUpdate();
        }
    };
    board.addEventListener('mousemove', moveSelection);
    board.addEventListener('touchmove', moveSelection);

    let cancelSelection = event => {
        holding = null;
        holdUpdate();
    };
    board.addEventListener('mouseleave', cancelSelection);
    board.addEventListener('touchcancel', cancelSelection);

    let dropSelection = event => {
        let location = mouseGridLocation(event);
        if (location != null) {
            
            holding = null;
            holdUpdate();

            document.body.style.cursor = matchInfo.board[location.y][location.x] != null && matchInfo.board[location.y][location.x][1] == matchInfo.black ? 'grab' : 'auto';
        }
    };
    board.addEventListener('mouseup', dropSelection);
    board.addEventListener('touchend', dropSelection);

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