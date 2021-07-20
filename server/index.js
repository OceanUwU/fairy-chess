const express = require('express');
const cfg = require('./cfg');

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
    console.log('socket connected!');

    socket.on('boop', () => console.log('booped!'));
});