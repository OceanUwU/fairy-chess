import { mouseGridLocation } from "./mouseLocation";

var layer;
var newLayer;
var matchInfo; //[matchInfo.width, matchInfo.height]
var squareSize;
var arrows = [];
var newArrow = null;
const keyValues = ['ctrlKey', 'altKey'].map((e, i) => [e, 2 ** i]);
const arrowWidthMult = 0.12;
var arrowWidth;
const triangleLengthMult = 0.4;
var triangleLength;
const circleWidthMult = 0.08;
var circleWidth;

function start(event) {
    if (event.which == 1 && newArrow != null) return cancel();
    if (event.target.tagName != 'CANVAS' || !(eval(document.getElementById('arrowMode').getAttribute('arrowmode')) || event.which == 3)) return;

    newArrow = null;
    newLayer.ctx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);
    let location = mouseGridLocation(event, [matchInfo.width, matchInfo.height]);
    if (location == null) return cancel();
    let colour = keyValues.map(e => event[e[0]] * e[1]).reduce((a,b) => a+b);
    newArrow = [[location.x, location.y], [location.x, location.y], colour > 0 ? colour : Number(document.getElementById('arrowMode').getAttribute('arrowcolor'))]; //[origin, destination, colour]
    drawNew();
}

function move(event) {
    if (newArrow != null) {
        newLayer.ctx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);
        let location = mouseGridLocation(event, [matchInfo.width, matchInfo.height]);
        if (location == null) return cancel();
        newArrow[1] = [location.x, location.y];
        drawNew();
    }
}

function cancel() {
    newArrow = null;
    newLayer.ctx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);
}

function create(event) {
    if (event.target.tagName != 'CANVAS' || !(eval(document.getElementById('arrowMode').getAttribute('arrowmode')) || event.which == 3) || newArrow == null) return;
    event.preventDefault();
    console.log(newArrow);

    let match = a => a[0][0] == newArrow[0][0] && a[0][1] == newArrow[0][1] && a[1][0] == newArrow[1][0] && a[1][1] == newArrow[1][1] && a[2] == newArrow[2];
    if (arrows.some(match)) {
        arrows = arrows.filter(a => !match(a));
    } else {
        arrows.push(newArrow);
    }
    cancel();
    draw();
}

function drawArrow(arrow, l, opacity) {
    l.ctx.fillStyle = localStorage[`fc-color-arrows-${arrow[2]}`];
    l.ctx.strokeStyle = localStorage[`fc-color-arrows-${arrow[2]}`];
    l.ctx.globalAlpha = opacity;
    
    if (arrow[0][0] != arrow[1][0] || arrow[0][1] != arrow[1][1]) { //if arrow
        l.ctx.save();
        l.ctx.translate((arrow[0][0]+0.5) * squareSize, (arrow[0][1]+0.5) * squareSize);
        l.ctx.rotate(Math.atan2(arrow[1][1] - arrow[0][1], arrow[1][0] - arrow[0][0]));

        let distanceFromCentre = [...arrows, newArrow].some(a => a != null && a != arrow && a[1][0] == arrow[1][0] && a[1][1] == arrow[1][1]) ? squareSize*0.3 : 0;
        let arrowLength = Math.hypot(arrow[1][1] - arrow[0][1], arrow[1][0] - arrow[0][0]) * squareSize - distanceFromCentre - triangleLength;

        //l.ctx.fillRect(-arrowWidth/2, -arrowWidth/2, arrowLength-triangleLength, arrowWidth);
        l.ctx.beginPath();
        //rectangle
        l.ctx.moveTo(arrowLength, arrowWidth/2);
        l.ctx.lineTo(-arrowWidth/2, arrowWidth/2,);
        l.ctx.lineTo(-arrowWidth/2, -arrowWidth/2,);
        l.ctx.lineTo(arrowLength, -arrowWidth/2);
        //triangle
        l.ctx.lineTo(arrowLength, -triangleLength/2);
        l.ctx.lineTo(arrowLength+triangleLength, 0);
        l.ctx.lineTo(arrowLength, triangleLength/2);
        //draw it
        l.ctx.closePath();
        l.ctx.fill();
        l.ctx.restore();
    } else { //if circle
        l.ctx.beginPath();
        l.ctx.arc((arrow[0][0]+0.5)*squareSize, (arrow[0][1]+0.5)*squareSize, (squareSize/2)-circleWidth/2, 0, 2*Math.PI);
        l.ctx.lineWidth = circleWidth;
        l.ctx.stroke();
    }
}

function drawNew() {
    drawArrow(newArrow, newLayer, 0.53);
    draw();
}

function draw() {
    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    arrows.forEach(arrow => drawArrow(arrow, layer, 0.8));
}

function clear() {
    newArrow = null;
    newLayer.ctx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);

    arrows = [];
    draw();
}

function setup(board, new_layer, new_newLayer, newMatchInfo, newSquareSize) {
    layer = new_layer;
    newLayer = new_newLayer;
    matchInfo = newMatchInfo;
    squareSize = newSquareSize;
    arrowWidth = squareSize * arrowWidthMult;
    triangleLength = squareSize * triangleLengthMult;
    circleWidth = squareSize * circleWidthMult;

    board.addEventListener('mousedown', start);
    board.addEventListener('mousemove', move);
    board.addEventListener('mouseleave', cancel);
    board.addEventListener('mouseup', create);
    board.addEventListener('touchstart', start);
    board.addEventListener('touchmove', move);
    board.addEventListener('touchcancel', cancel);
    board.addEventListener('touchend', create);
    board.oncontextmenu = () => false;
}

export default {
    setup,
    clear,
    draw,
};