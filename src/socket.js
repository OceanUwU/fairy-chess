import React from 'react';
import ReactDOM from 'react-dom';
import { Typography } from '@material-ui/core';
import socketIOClient from 'socket.io-client';
import Match from './Match/';
import showDialog from './showDialog.js';
import * as gameplay from './Match/gameplay.js';

var socket = socketIOClient('', {transports: ['websocket']});

socket.on('connect', () => {
    console.log('connected to server!');
});

socket.on('err', (err, title='Error!') => showDialog({title}, <Typography>{err}</Typography>))

socket.on('join', matchInfo => ReactDOM.render(<Match matchInfo={matchInfo} />, document.getElementById('root')));

socket.on('placed', (x, y, piece) => gameplay.place(x, y, piece));
socket.on('resize', (width, height, board) => gameplay.resize(width, height, board));

export default socket;