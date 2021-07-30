import React from 'react';
import { Button, Tooltip } from '@material-ui/core';
import * as pieces from './pieces';
import socket from '../socket.js';
let validPieces = Object.values(pieces).filter(piece => !piece.cantPromoteTo);

export default function Promotions(props) {
    let [promotions, setPromotions] = React.useState(JSON.parse(JSON.stringify(props.promotions)));

    let updatePromotions = () => {
        setPromotions(JSON.parse(JSON.stringify(props.promotions)));
        socket.emit('promotions', props.promotions);
    }

    React.useEffect(() => {
        let promotionSet = newPromotions => {
            props.promotions.splice(0);
            for (let i of newPromotions) {
                props.promotions.push(i);
            }
            setPromotions(JSON.parse(JSON.stringify(props.promotions)))
        };
        socket.on('promotions', promotionSet);
        return () => {
            socket.off('promotions', promotionSet);
        }
    }, []);

    return (
        <div>
            {validPieces.map(piece => (
                <Tooltip key={piece.name} title={piece.name}>
                    <Button style={{background: promotions.includes(piece.name) ? 'lightgrey' : 'white'}} onClick={() => {
                        if (props.promotions.includes(piece.name)) {
                            if (props.promotions.length > 1) {
                                props.promotions.splice(props.promotions.indexOf(piece.name), 1);
                            }
                        } else {
                            props.promotions.push(piece.name);
                        }
                        updatePromotions();
                    }}>
                        <img src={props.pieceImages[piece.name][0].src} width={50} />
                    </Button>
                </Tooltip>
            ))}
            <br />
            <Button variant="contained" onClick={() => {
                props.promotions.splice(0);
                for (let i of validPieces) {
                    props.promotions.push(i.name);
                }
                updatePromotions();
            }}>Select all</Button>
            <Button variant="contained" onClick={() => {
                props.promotions.splice(1);
                updatePromotions();
            }}>Deselect all</Button>
        </div>
    );
}