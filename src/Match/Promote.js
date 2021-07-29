import React from 'react';
import { Button, Tooltip } from '@material-ui/core';
import socket from '../socket.js';

export default function Promote(props) {
    return (
        <div>
            {props.promotions.map(piece => (
                <Tooltip key={piece} title={piece}>
                    <Button onClick={() => props.promote(piece)}>
                        <img src={props.pieceImages[piece][props.colour].src} width={50} />
                    </Button>
                </Tooltip>
            ))}
        </div>
    );
}