import React from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import layers from './layers.js';
import start from './gameplay.js';
import BrushIcon from '@material-ui/icons/Brush';
import showDialog from '../showDialog.js';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        maxHeight: '100%',
    },

    boardContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
    },

    board: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },

    actions: {
        display: 'flex',
    },

    layer: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
});

export default function Match(props) {
    const classes = useStyles();

    React.useEffect(() => {
        start(props.matchInfo);
    }, []);

    return (
        <div className={classes.root}>
            <Typography>room code: {props.matchInfo.code}</Typography>
            <div className={classes.boardContainer}>
                <div className={classes.board}>
                    {layers.map(layer => <canvas id={`${layer}Layer`} key={layer} className={classes.layer} />)}
                    <div className={classes.actions}>
                        <IconButton size="small"><BrushIcon fontSize="small" /></IconButton>
                    </div>
                </div>
            </div>
            <Typography>room code: {props.matchInfo.code}</Typography>
        </div>
    );
}