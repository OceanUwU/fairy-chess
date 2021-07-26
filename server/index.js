import express from 'express';
import cfg from './cfg.js';
import Match from './Match.js';
import { Server } from 'socket.io';
import proxy from 'express-http-proxy';
import * as pieces from '../src/Match/pieces/index.js';
const codeLength = 4;
const maxBoardSize = 16;
const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var app = express();

if (cfg.dev == true) {
    app.use('/', proxy('http://localhost:3000'));
} else {
    app.use('/', express.static(__dirname + '/../build'));
}

const server = app.listen(cfg.port, () => {
    console.log(`Web server started on port ${cfg.port}.`);
});

const io = new Server(server);
io.on('connect', socket => {
    socket.ingame = false;
    socket.match = false;
    socket.place = null;
    console.log('socket connected!');

    socket.on('createMatch', () => {
        if (!socket.ingame) {
            let code;
            do {
                code = '';
                for (let i = 0; i < codeLength; i++)
                    code += codeChars[Math.floor(Math.random() * codeChars.length)];
            } while (matches.hasOwnProperty(code))
            
            let match = new Match(code);
            matches[code] = match;
    
            match.join(socket);
        }
    });

    socket.on('joinMatch', code => {
        if (!socket.ingame) {
            code = code.toUpperCase();
            if (matches[code]) {
                if (matches[code].connected.length < 2)
                    matches[code].join(socket);
                else
                    socket.emit('err', 'That match is full.')
            } else
                socket.emit('err', 'No match with that code exists.');
        }
    });

    socket.on('place', (x, y, toPlace) => {
        if (
            socket.ingame
            && Number.isInteger(x)
            && x >= 0
            && x < matches[socket.ingame].width
            && Number.isInteger(y)
            && y >= 0
            && y < matches[socket.ingame].height
            && (
                toPlace == null
                || (
                    toPlace.length == 2
                    && Object.keys(pieces).includes(toPlace[0])
                    && [0, 1].includes(toPlace[1])
                )
            )
        ) {
            matches[socket.ingame].board[y][x] = toPlace;
            matches[socket.ingame].emit('placed', x, y, toPlace);
        }
    });

    socket.on('size', (dimension, direction) => {
        if (socket.ingame && (dimension === 'width' || dimension === 'height') && typeof direction == 'number') {
            if (direction > 0) {
                if (matches[socket.ingame][dimension] == maxBoardSize)
                    return;
                matches[socket.ingame][dimension]++;
                if (dimension === 'width') {
                    matches[socket.ingame].board.forEach(row => row.push(null)); //add an empty tile at the end of each row in the board
                } else {
                    matches[socket.ingame].board.push(Array(matches[socket.ingame].width).fill(null)); //add a row with all empty tiles at the bottom of the board
                }
            } else {
                if (matches[socket.ingame][dimension] == 2)
                    return;
                matches[socket.ingame][dimension]--;
                if (dimension === 'width') {
                    matches[socket.ingame].board.forEach(row => row.splice(-1)); //remove the last piece of each row in the board
                } else {
                    matches[socket.ingame].board.splice(-1); //remove the last row of the board
                }
            }
            matches[socket.ingame].emit('resize', matches[socket.ingame].width, matches[socket.ingame].height, matches[socket.ingame].board);
        }
    });

    socket.on('start', () => {
        if (socket.match && !socket.match.started) {
            let kings = [].concat.apply([], socket.match.board).filter(p => p && p[0] == 'king');
            if (kings.length == 2 && kings[0][1] != kings[1][1]) { //if there is exactly 1 king on each team
                socket.match.started = true;
                socket.match.emit('start');
            } else
                socket.emit('err', 'Each team must have exactly 1 king.', 'Invalid board!');
        }
    });

    socket.on('pickup', (y, x) => {
        if (
            socket.match
            && socket.match.started
            && socket.match.turn == socket.num
            && socket.match.board.hasOwnProperty(y)
            && socket.match.board[y].hasOwnProperty(x)
            && socket.match.board[y][x] != null
            && socket.match.board[y][x][1] == socket.num
        ) {
            let opponent = socket.match.opponent(socket.num);
            if (opponent != null) {
                console.log(opponent.num, [y, x], [socket.match.height-y-1, socket.match.width-x-1])
                if (opponent.num == 0)
                    opponent.emit('pickup', y, x);
                else
                    opponent.emit('pickup', socket.match.height-y-1, socket.match.width-x-1);
            }
        }
    });

    socket.on('hold', (x, y) => {
        if (
            socket.match
            && socket.match.started
            && socket.match.turn == socket.num
            && [x, y].every(num => 
                typeof num == 'number'
                && num > -20000
                && num < 20000
            )
        ) {
            let opponent = socket.match.opponent(socket.num);
            if (opponent != null)
                opponent.emit('hold', x, y);
        }
    });

    socket.on('cancelHold', () => {
        if (socket.match && socket.match.started) {
            let opponent = socket.match.opponent(socket.num);
            if (opponent != null)
                opponent.emit('drop');
        }
    });

    socket.on('drop', (origin, destination) => {
        console.log(
            origin, destination, socket.match.started
            , socket.match.turn == socket.num
            , [origin, destination].every(loc => //both locations are valid locations on the board
                Array.isArray(loc)
                && loc.length == 2
                && loc.every((coord, index) =>
                    coord >= 0
                    && coord < socket.match[['height', 'width'][index]]
                )
            )
            , socket.match.board[origin[0]][origin[1]] //origin is not an empty tile
            , socket.match.board[origin[0]][origin[1]][1], socket.num //piece is owned by mover
        )
        if (
            socket.match
            && socket.match.started
            && socket.match.turn == socket.num
            && [origin, destination].every(loc => //both locations are valid locations on the board
                Array.isArray(loc)
                && loc.length == 2
                && loc.every((coord, index) =>
                    coord >= 0
                    && coord < socket.match[['height', 'width'][index]]
                )
            )
            && socket.match.board[origin[0]][origin[1]] != null //origin is not an empty tile
            && socket.match.board[origin[0]][origin[1]][1] == socket.num //piece is owned by mover
            && pieces[socket.match.board[origin[0]][origin[1]][0]].moves({
                board: socket.match.board,
                black: socket.num == 1,
                position: origin,
                history: socket.match.history,
            }).some(allowed => allowed[0] == destination[0] && allowed[1] == destination[1])
        ) {
            let opponent = socket.match.opponent(socket.num);
            if (opponent != null)
                opponent.emit('drop');

            let piece = socket.match.board[origin[0]][origin[1]];
            console.log(piece);
            socket.match.board[destination[0]][destination[1]] = piece;
            socket.match.board[origin[0]][origin[1]] = null;
            console.log(socket.match.board);

            socket.match.history.push(null);
            
            socket.match.turn = Number(!(Boolean(socket.match.turn)));
            socket.match.emit('move', origin, destination);
        }
    });

    socket.on('disconnect', () => {
        if (socket.ingame) {
            matches[socket.ingame][`player${socket.num}`] = null;
            if (matches[socket.ingame].connected.length == 0)
                delete matches[socket.ingame];
        }
    });
});

var matches = {};