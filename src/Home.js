import React from 'react';
import socket from './socket.js';

export default function Home() {
    return (
        <div>
            <p>hello world</p>
            <button onClick={() => socket.emit('boop')}>boop server</button>
        </div>
    );
};