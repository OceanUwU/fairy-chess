import React from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import layers from './layers.js';
import { start } from './gameplay.js';
import BrushIcon from '@material-ui/icons/Brush';
import GridOnIcon from '@material-ui/icons/GridOn';
import showDialog from '../showDialog.js';
import Customiser from './Customiser.js';
import BoardSizeEditor from './BoardSizeEditor';

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
        //flexGrow: 1,
        alignItems: 'center',
    },

    board: {
        position: 'relative',
        width: '100%',
        height: '100%',
        //flexGrow: 1,
    },

    pieceMenu: {
        //flexGrow: 1,
        overflowY: 'scroll',
        border: '1px solid lightgrey',
        width: 160,
        maxHeight: '50vh',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,

        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        padding: '5px 0',

        '& img': {
            width: 60,
            height: 'auto',
            cursor: 'pointer',

            '&.selected': {
                background: 'lightgrey',
                borderRadius: 8,
            }
        },
    },

    actions: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'left',
        width: 30,
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

    let customiser = <Customiser />;
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
                        <IconButton onClick={() => showDialog({title: 'Customise'}, customiser)} size="small"><BrushIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => showDialog({title: 'Edit board size'}, <BoardSizeEditor />)} size="small"><GridOnIcon fontSize="small" /></IconButton>
                    </div>
                </div>
                {props.matchInfo.started ? null : <div className={classes.pieceMenu} id="pieceMenu" />}
            </div>
            <Typography>room code: {props.matchInfo.code}</Typography>
        </div>
    );
}