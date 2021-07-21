import React from 'react';
import ReactDOM from 'react-dom';
import { Typography } from '@material-ui/core';
import socketIOClient from 'socket.io-client';
import Match from './Match/';
import showDialog from './showDialog.js';

var socket = socketIOClient('', {transports: ['websocket']});

socket.on('connect', () => {
    console.log('connected to server!');
});

socket.on('err', (err, title='Error!') => showDialog({title}, <Typography>{err}</Typography>))

socket.on('join', matchInfo => ReactDOM.render(<Match matchInfo={matchInfo} />, document.getElementById('root')));


export default socket;