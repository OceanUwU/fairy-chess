const express = require('express');
const cfg = require('./cfg');
const Match = require('./Match.js');
const codeLength = 4;
const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var app = express();

if (cfg.dev == true) {
    const proxy = require('express-http-proxy');
    app.use('/', proxy('http://localhost:3000'));
} else {
    app.use('/', express.static(__dirname + '/../build'));
}

const server = app.listen(cfg.port, () => {
    console.log(`Web server started on port ${cfg.port}.`);
});

const io = require('socket.io')(server);
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

    socket.on('disconnect', () => {
        if (socket.ingame) {
            matches[socket.ingame][`player${socket.player}`] = null;
            if (matches[socket.ingame].connected.length == 0)
                delete matches[socket.ingame];
        }
    });
});

var matches = {};