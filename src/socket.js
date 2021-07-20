import socketIOClient from 'socket.io-client';

var socket = socketIOClient('', {transports: ['websocket']});

socket.on('connect', () => {
    console.log('connected to server!');
});

export default socket;