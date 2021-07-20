import layers from './layers.js';
import * as pieces from './pieces';
import recolorAll from './pieceImages.js';

var paper;
var matchInfo;
var squareSize = 256;
var pieceImages = recolorAll([242, 240, 220], [92, 90, 88]);

function drawGrid() {
    Object.values(paper).forEach(layer => {
        layer.canvas.width = squareSize * matchInfo.width;
        layer.canvas.height = squareSize * matchInfo.height;
    });

    for (let x = 0; x < matchInfo.width; x++) {
        for (let y = 0; y < matchInfo.height; y++) {
            paper.grid.ctx.fillStyle = (((x % 2) ? y+1 : y) % 2) ? '#dd8fff' : '#f2dadd';
            paper.grid.ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }
}

async function drawPieces() {
    pieceImages = await pieceImages;
    console.log(pieceImages);

    paper.pieces.ctx.clearRect(0, 0, paper.pieces.canvas.width, paper.pieces.canvas.height);

    for (let x = 0; x < matchInfo.board[0].length; x++) {
        for (let y = 0; y < matchInfo.board.length; y++) {
            let piece = matchInfo.board[y][x];
            if (piece != null) {
                paper.pieces.ctx.drawImage(pieceImages[piece[0]][piece[1]], x * squareSize, y * squareSize, squareSize, squareSize);
            }
        }
    }
}

export default function start(initialMatchInfo) {
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
    console.log(':D');
    new Promise(res => res(drawPieces()));
}