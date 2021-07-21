import React from 'react';
import { Typography, ButtonGroup, Button } from '@material-ui/core';
import socket from '../socket.js';

export default function BoardSizeEditor() {
    return (
        <div>
            {['Width', 'Height'].map(dimension => (
                <Typography key={dimension}>
                    {dimension}:{' '}
                    <ButtonGroup variant="outlined" size="small">
                        <Button onClick={() => socket.emit('size', dimension.toLowerCase(), -1)}>-</Button>
                        <Button onClick={() => socket.emit('size', dimension.toLowerCase(), 1)}>+</Button>
                    </ButtonGroup>
                </Typography>
            ))}
        </div>
    );
}