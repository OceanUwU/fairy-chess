import layers from './layers.js';
import * as pieces from './pieces';
import recolorAll from './pieceImages.js';

var paper;
var matchInfo;
var squareSize = 256;
var pieceImages;
var size = [null, null];

const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

async function recolorImages() {
    pieceImages = recolorAll(hexToRgb(localStorage['fc-color-a']), hexToRgb(localStorage['fc-color-b']));
}
setTimeout(recolorImages, 250);

function drawGrid() {
    if (size[0] != matchInfo.width && size[1] != matchInfo.height) {
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

    for (let x = 0; x < matchInfo.board[0].length; x++) {
        for (let y = 0; y < matchInfo.board.length; y++) {
            let piece = matchInfo.black ? matchInfo.board[matchInfo.board.length-y-1][matchInfo.board[0].length-x-1] : matchInfo.board[y][x];
            if (piece != null) {
                paper.pieces.ctx.drawImage(pieceImages[piece[0]][piece[1]], x * squareSize, y * squareSize, squareSize, squareSize);
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

    drawGrid();
}

export {
    start,
    recolorImages,
    drawGrid,
    drawPieces,
};