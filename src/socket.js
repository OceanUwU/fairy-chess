import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from 'socket.io-client';
import Match from './Match/';

var socket = socketIOClient('', {transports: ['websocket']});

socket.on('connect', () => {
    console.log('connected to server!');
});

socket.on('join', matchInfo => ReactDOM.render(<Match matchInfo={matchInfo} />, document.getElementById('root')));
socket.on('hello', (a, b) => console.log(a, b));

export default socket;