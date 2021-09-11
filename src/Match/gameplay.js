import React from 'react';
import ReactDOM from 'react-dom';
import layers from './layers.js';
import * as pieces from './pieces';
import pieceFn from './pieces/fn.js';
import recolorAll from './pieceImages.js';
import socket from '../socket.js';
import Promotions from './Promotions.js';
import Promote from './Promote.js';
import showDialog from '../showDialog.js';
import * as mouseLocation from './mouseLocation.js';
import arrows from './arrows.js';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

var moveImg = new Image();
moveImg.src = '/move.png';
var takeImg = new Image();
takeImg.src = '/take.png';

var paper;
var matchInfo;
var squareSize = 256;
var pieceImages;
var shadowBlur = 30;
var size = [null, null];
var toPlace = false;
var holding = null;
var holdingLocation = null;
var holdingState;
var holdingMoves;
var opponentHolding = null;
var opponentHoldingLocation = null;
var previousMove = [];
var promotionsDialog;

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

function drawText() {
    paper.text.ctx.clearRect(0, 0, paper.text.canvas.width, paper.text.canvas.height);
    paper.text.ctx.font = '50px Arial';
    paper.text.ctx.fillStyle = localStorage['fc-color-boardText'];
    paper.text.ctx.globalAlpha = 0.6;

    paper.text.ctx.textBaseline= 'bottom';
    paper.text.ctx.textAlign= 'center';
    for (let x = 0; x < matchInfo.width; x++) {
        let letter = matchInfo.black ? alphabet[matchInfo.width-x-1] : alphabet[x];
        paper.text.ctx.fillText(letter, (x+0.5)*squareSize, squareSize * matchInfo.height);
    }
    paper.text.ctx.textBaseline= 'middle';
    paper.text.ctx.textAlign= 'start';
    for (let y = 0; y < matchInfo.height; y++) {
        let num = matchInfo.black ? y+1 : matchInfo.height-y;
        paper.text.ctx.fillText(num, 0, (y+0.5)*squareSize);
    }
}

function drawGrid() {
    if (size[0] != matchInfo.width || size[1] != matchInfo.height) {
        Object.values(paper).forEach(layer => {
            layer.canvas.width = squareSize * matchInfo.width;
            layer.canvas.height = squareSize * matchInfo.height;
        });
        drawPieces();
        size = [matchInfo.width, matchInfo.height];

        drawText();
    }

    for (let x = 0; x < matchInfo.width; x++) {
        for (let y = 0; y < matchInfo.height; y++) {
            paper.grid.ctx.fillStyle = (((x % 2) ? y+1 : y) % 2) ? localStorage['fc-color-c'] : localStorage['fc-color-d'];
            paper.grid.ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
            paper.grid.ctx.fillStyle = '#ffffff07';
            paper.grid.ctx.beginPath();
            paper.grid.ctx.moveTo(x * squareSize, y * squareSize);
            paper.grid.ctx.lineTo(x * squareSize, (y+1) * squareSize);
            paper.grid.ctx.lineTo((x+0.5) * squareSize, (y+0.5) * squareSize);
            paper.grid.ctx.closePath();
            paper.grid.ctx.fill();
            paper.grid.ctx.fillStyle = '#00000005';
            paper.grid.ctx.beginPath();
            paper.grid.ctx.moveTo((x+1) * squareSize, y * squareSize);
            paper.grid.ctx.lineTo((x+1) * squareSize, (y+1) * squareSize);
            paper.grid.ctx.lineTo((x+0.5) * squareSize, (y+0.5) * squareSize);
            paper.grid.ctx.closePath();
            paper.grid.ctx.fill();
        }
    }

    for (let location of JSON.parse(JSON.stringify(previousMove))) {
        if (matchInfo.black) {
            location[0] = matchInfo.height-location[0]-1;
            location[1] = matchInfo.width-location[1]-1;
        }
        paper.grid.ctx.globalAlpha = 0.75;
        paper.grid.ctx.fillStyle = localStorage['fc-color-previousMove'];
        paper.grid.ctx.fillRect(location[1] * squareSize, location[0] * squareSize, squareSize, squareSize);
        paper.grid.ctx.globalAlpha = 1;
    }
}

function tileCentre(n) {
    return (n+0.5) * squareSize;
}

async function drawPieces() {
    pieceImages = await pieceImages;

    paper.pieces.ctx.clearRect(0, 0, paper.pieces.canvas.width, paper.pieces.canvas.height);

    for (let x = 0; x < matchInfo.width; x++) {
        for (let y = 0; y < matchInfo.height; y++) {
            let piece = matchInfo.black ? matchInfo.board[matchInfo.height-y-1][matchInfo.width-x-1] : matchInfo.board[y][x];
            if (piece != null) {
                if (piece[2]) {
                    paper.pieces.ctx.shadowBlur = shadowBlur;
                    paper.pieces.ctx.shadowColor = piece[1] == matchInfo.black ? localStorage[`fc-color-royalGlowAlly`] : localStorage[`fc-color-royalGlowEnemy`];
                }
                paper.pieces.ctx.drawImage(pieceImages[piece[0]][piece[1]], x * squareSize, y * squareSize, squareSize, squareSize);
                paper.pieces.ctx.shadowBlur = 0;
            }
        }
    }

    if (matchInfo.started) {
        paper.check.ctx.clearRect(0, 0, paper.check.canvas.width, paper.check.canvas.height);

        let checks = pieceFn.inCheck(matchInfo.board, matchInfo.history, matchInfo.turn);
        if (checks) {    
            paper.check.ctx.globalAlpha = 0.4;
            paper.check.ctx.strokeStyle = localStorage['fc-color-checkIndicator'];
            paper.check.ctx.lineWidth = 30;
            for (let check of JSON.parse(JSON.stringify(checks))) {
                if (matchInfo.black) {
                    for (let i of check) {
                        i[0] = matchInfo.height-i[0]-1;
                        i[1] = matchInfo.width-i[1]-1;
                    }
                }

                let from = check[0].map(i => tileCentre(i));
                let to = check[1].map(i => tileCentre(i));
                paper.check.ctx.beginPath();
                paper.check.ctx.moveTo(from[1], from[0]);
                paper.check.ctx.lineTo(to[1], to[0]);
                /*
                let angle = Math.atan2(to[0] - from[0], to[1] - from[1]);
                let headlen = 45;
                paper.check.ctx.lineTo(to[1] - headlen * Math.cos(angle - Math.PI / 6), to[0] - headlen * Math.sin(angle - Math.PI / 6));
                paper.check.ctx.moveTo(to[1], to[0]);
                paper.check.ctx.lineTo(to[1] - headlen * Math.cos(angle + Math.PI / 6), to[0] - headlen * Math.sin(angle + Math.PI / 6));
                */
                paper.check.ctx.stroke();
            }
        }
    }
}

async function holdUpdate(opponent=false) {
    requestAnimationFrame(async () => {
        let layer = paper[opponent ? 'opponentHold' : 'hold'];
        let hold = opponent ? opponentHolding : holding;
        let holdLocation = opponent ? opponentHoldingLocation : holdingLocation;
    
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        paper.possibilities.ctx.clearRect(0, 0, paper.possibilities.canvas.width, paper.possibilities.canvas.height);
    
        if (!opponent)
            document.body.style.cursor = hold === null ? 'auto' : 'grabbing';
    
        if (hold !== null) {
            //make piece transparent
            layer.ctx.globalAlpha = 0.5;
            layer.ctx.fillStyle = (((hold[1] % 2) ? hold[0]+1 : hold[0]) % 2) ? localStorage['fc-color-c'] : localStorage['fc-color-d'];
            layer.ctx.fillRect(hold[1] * squareSize, hold[0] * squareSize, squareSize, squareSize);
        
            //draw held piece above board
            layer.ctx.globalAlpha = 1;
            pieceImages = await pieceImages;
            let piece = matchInfo.black ? matchInfo.board[matchInfo.width-hold[0]-1][matchInfo.height-hold[1]-1] : matchInfo.board[hold[0]][hold[1]];
            if (piece[2]) {
                layer.ctx.shadowBlur = shadowBlur;
                layer.ctx.shadowColor = piece[1] == matchInfo.black ? localStorage[`fc-color-royalGlowAlly`] : localStorage[`fc-color-royalGlowEnemy`];
            }
            layer.ctx.drawImage(pieceImages[piece[0]][piece[1]], holdLocation[0], holdLocation[1]);
            layer.ctx.shadowBlur = 0;
    
            //draw move possibilities
            if (!opponent && moveImg.complete && takeImg.complete) {
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
    });
}

function renderOpponentPossibilities(yep, x, y) {
    paper.opponentPossibilities.ctx.clearRect(0, 0, paper.opponentPossibilities.canvas.width, paper.opponentPossibilities.canvas.height);
    paper.opponentPossibilities.ctx.globalAlpha = 0.3;
    if (yep) {
        let moves = holdingMoves = pieceFn.validMoves({
            board: matchInfo.board,
            black: !matchInfo.black,
            position: matchInfo.black ? [matchInfo.height-y-1, matchInfo.width-x-1] : [y, x],
            history: matchInfo.history,
        });
        for (let move of moves) {
            let take = matchInfo.board[move[0]][move[1]] != null && matchInfo.board[move[0]][move[1]][1] == matchInfo.black;
            if (matchInfo.black) {
                move = move.map((i, index) => matchInfo[['height', 'width'][index]] - i - 1);
            }
            paper.opponentPossibilities.ctx.drawImage(take ? takeImg : moveImg, move[1] * squareSize, move[0] * squareSize);
        }
    }
}

function setup(initialMatchInfo) {
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
        if (event.target.tagName != 'CANVAS') return;

        if (toPlace !== false) {
            paper.toPlace.ctx.clearRect(0, 0, paper.toPlace.canvas.width, paper.toPlace.canvas.height);
            let location = mouseLocation.mouseGridLocation(event, size);
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
            let location = mouseLocation.mouseGridLocation(event, size, matchInfo.black);
            if (location == null) {
                renderOpponentPossibilities(false);
                return document.body.style.cursor = 'auto';
            }
            document.body.style.cursor = document.body.style.cursor == 'grabbing' ? 'grabbing' : (matchInfo.board[location.y][location.x] != null && matchInfo.board[location.y][location.x][1] == matchInfo.black ? 'grab' : 'auto');
            if (holding == null) {
                if (matchInfo.board[location.y][location.x] != null && matchInfo.board[location.y][location.x][1] != matchInfo.black) {
                    renderOpponentPossibilities(true, location.x, location.y);
                } else {
                    renderOpponentPossibilities(false);
                }
            }
        }
    });
    board.addEventListener('mouseleave', () => {
        paper.toPlace.ctx.clearRect(0, 0, paper.toPlace.canvas.width, paper.toPlace.canvas.height);
        renderOpponentPossibilities(false);
    });
    let place = event => {
        if (event.target.tagName != 'CANVAS' || eval(document.getElementById('arrowMode').getAttribute('arrowmode')) || (!event.touches && event.which != 1)) return;

        event.preventDefault();
        if (toPlace !== false) {
            let location = mouseLocation.mouseGridLocation(event, size);
            if (location != null)
                socket.emit('place', matchInfo.black ? matchInfo.width-location.x-1 : location.x, matchInfo.black ? matchInfo.height-location.y-1 : location.y, toPlace, document.getElementById('isRoyal').checked);
        }
    };
    board.addEventListener('mousedown', place);
    board.addEventListener('touchstart', place);

    let selectPiece = event => {
        if (event.target.tagName != 'CANVAS' || eval(document.getElementById('arrowMode').getAttribute('arrowmode')) || (!event.touches && event.which != 1)) return;
        if (matchInfo.started && matchInfo.turn != matchInfo.black) return

        event.preventDefault();
        if (toPlace === false) {
            let location = mouseLocation.mouseGridLocation(event, size);
            if (location != null) {
                let piece = matchInfo.black ? matchInfo.board[matchInfo.height-location.y-1][matchInfo.width-location.x-1] : matchInfo.board[location.y][location.x];
                if (piece != null && piece[1] == matchInfo.black) {
                    arrows.clear();
                    holding = [location.y, location.x];
                    holdingLocation = mouseLocation.canvasPos(mouseLocation.mouseCanvasLocation(event, size), size, squareSize);
                    if (matchInfo.started) {
                        if (matchInfo.black)
                            socket.emit('pickup', matchInfo.height-location.y-1, matchInfo.width-location.x-1);
                        else
                            socket.emit('pickup', holding[0], holding[1]);
                        socket.emit('hold', Math.round(holdingLocation[0]), Math.round(holdingLocation[1]));
                    }
                    holdingMoves = pieceFn.validMoves({
                        board: matchInfo.board,
                        black: matchInfo.black,
                        position: matchInfo.black ? [matchInfo.height-location.y-1, matchInfo.width-location.x-1] : holding,
                        history: matchInfo.history,
                    });
                    holdUpdate();
                }
            }
        }
    };
    board.addEventListener('mousedown', selectPiece);
    board.addEventListener('touchstart', selectPiece);

    let moveSelection = event => {
        if (event.target.tagName != 'CANVAS') return;

        if (toPlace === false && holding != null) {
            let location = mouseLocation.mouseCanvasLocation(event, size);
            if (location != null) {
                let holdingLocationBefore = JSON.stringify(holdingLocation);
                holdingLocation = mouseLocation.canvasPos(mouseLocation.mouseCanvasLocation(event, size), size, squareSize);
                if (holdingLocationBefore != JSON.stringify(holdingLocation) && matchInfo.started)
                    socket.emit('hold', Math.round(holdingLocation[0]), Math.round(holdingLocation[1]));
            } else {
                holding = null;
                socket.emit('cancelHold');
            }
            holdUpdate();
        }
    };
    board.addEventListener('mousemove', moveSelection);
    board.addEventListener('touchmove', moveSelection);

    let cancelSelection = event => {
        holding = null;
        holdUpdate();
        socket.emit('cancelHold');
    };
    board.addEventListener('mouseleave', cancelSelection);
    board.addEventListener('touchcancel', cancelSelection);

    let dropSelection = async event => {
        if (event.target.tagName != 'CANVAS' || (!event.touches && event.which != 1)) return;

        if (toPlace === false && holding != null) {
            let location = mouseLocation.mouseGridLocation(event, size);
            if (location != null) {
                if (matchInfo.started && matchInfo.turn == matchInfo.black) {
                    let realLocation = matchInfo.black ? [matchInfo.height-location.y-1, matchInfo.width-location.x-1] : [location.y, location.x];
                    let realHolding = matchInfo.black ? [matchInfo.width-holding[0]-1, matchInfo.height-holding[1]-1] : holding;
                    if (location.y == 0 && ['pawn', 'weakpawn'].includes(matchInfo.board[realHolding[0]][realHolding[1]][0])) {
                        pieceImages = await pieceImages;

                        let diag = await showDialog({
                            title: 'Promote',
                            description: 'What piece should this pawn promote to?',
                        }, <Promote pieceImages={pieceImages} promotions={matchInfo.promotions} colour={Number(matchInfo.black)} promote={piece => {
                            socket.emit('promote', realHolding, realLocation, piece);
                            diag.handleClose();
                        }} />)
                    } else
                        socket.emit('drop', realHolding, realLocation);
                }
                
                holding = null;
                holdUpdate();
                socket.emit('cancelHold');
    
                document.body.style.cursor = matchInfo.board[location.y][location.x] != null && matchInfo.board[location.y][location.x][1] == matchInfo.black ? 'grab' : 'auto';
            }
        }
    };
    board.addEventListener('mouseup', dropSelection);
    board.addEventListener('touchend', dropSelection);

    arrows.setup(board, paper.arrows, paper.newArrow, matchInfo, squareSize);

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
    arrows.clear();
    drawGrid();
}

function start() {
    if (promotionsDialog) promotionsDialog.handleClose();
    matchInfo.started = true;
    toPlace = false;
    drawGrid();
    drawPieces();
}

function opponentPickUp(y, x) {
    opponentHolding = [y, x];
}

function opponentHold(x, y) {
    if (opponentHolding == null) return;
    opponentHoldingLocation = [squareSize*(matchInfo.width-1)-x, squareSize*(matchInfo.height-1)-y];
    holdUpdate(true);
}

function opponentDrop() {
    opponentHolding = null;
    holdUpdate(true);
}

function move(origin, destination) {
    matchInfo.board[destination[0]][destination[1]] = matchInfo.board[origin[0]][origin[1]];
    matchInfo.board[origin[0]][origin[1]] = null;
    matchInfo.history.push([origin, destination]);
    matchInfo.turn = Number(!(Boolean(matchInfo.turn)));
    previousMove = [origin, destination];
    drawGrid();
    drawPieces();
}
async function setAvailablePromotions() {
    if (!matchInfo.started) {
        pieceImages = await pieceImages;

        promotionsDialog = await showDialog({
            title: 'Promotions',
            description: 'What pieces should a pawn be able to promote to?',
        }, <Promotions pieceImages={pieceImages} promotions={matchInfo.promotions} />)
    }
}

function setPromotion(piece) {
    nextPromotion
}

function switchSides() {
    matchInfo.black = !matchInfo.black;
    arrows.clear();
    drawGrid();
    drawText();
    drawPieces();
}

function filled(isFilled) {
    matchInfo.filled = isFilled;
}


export {
    setup,
    recolorImages,
    drawGrid,
    drawText,
    drawPieces,
    place,
    resize,
    start,
    opponentPickUp,
    opponentHold,
    opponentDrop,
    move,
    setAvailablePromotions,
    setPromotion,
    switchSides,
    filled
};