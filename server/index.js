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
    socket.place = null;
    console.log('socket connected!');

    socket.on('createMatch', () => {
        let code;
        do {
            code = '';
            for (let i = 0; i < codeLength; i++)
                code += codeChars[Math.floor(Math.random() * codeChars.length)];
        } while (matches.hasOwnProperty(code))
        
        let match = new Match(code);
        matches[code] = match;

        match.join(socket);
    });

    socket.on('joinMatch', code => {
        code = code.toUpperCase();
        if (matches[code]) {
            if (matches[code].connected.length < 2)
                matches[code].join(socket);
            else
                socket.emit('err', 'That match is full.')
        } else
            socket.emit('err', 'No match with that code exists.');
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

    socket.on('disconnect', () => {
        if (socket.ingame) {
            matches[socket.ingame][`player${socket.player}`] = null;
            if (matches[socket.ingame].connected.length == 0)
                delete matches[socket.ingame];
        }
    });
});

var matches = {};