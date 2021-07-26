import React from 'react';
import { Typography, IconButton, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import layers from './layers.js';
import { setup } from './gameplay.js';
import BrushIcon from '@material-ui/icons/Brush';
import GridOnIcon from '@material-ui/icons/GridOn';
import ShareIcon from '@material-ui/icons/Share';
import showDialog from '../showDialog.js';
import Customiser from './Customiser.js';
import BoardSizeEditor from './BoardSizeEditor';
import socket from '../socket.js';

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

    topBar: {
        display: 'flex',
        alignItems: 'center',

        '& *': {
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }
    },

    bottomBar: {
        display: 'flex',
        alignItems: 'center',

        '& *': {
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }
    },

    board: {
        position: 'relative',
        width: '100%',
        height: '100%',
        //flexGrow: 1,
    },

    setupBar: {
        width: 160,
        border: '1px solid lightgrey',
        maxHeight: '50vh',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        background: 'white',
        
        display: 'flex',
        flexDirection: 'column',
    },

    pieceMenu: {
        //flexGrow: 1,
        overflowY: 'scroll',
        width: '100%',

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
    let [turn, setTurn] = React.useState(props.matchInfo.turn);
    let [time, setTime] = React.useState([0, 0]);

    let timer;

    let timerTick = () => {
        let newTime = [...time];
        if (props.matchInfo.started) {
            newTime[turn]++;
        } 
        setTime(newTime);
    }

    let customiser = <Customiser />;
    React.useEffect(() => {
        setup(props.matchInfo);

        socket.on('start', () => {
            props.matchInfo.started = true;
            setTurn(turn);
        });
        
        socket.on('move', () => {
            setTurn(Number(!(Boolean(turn))));
            turn = Number(!(Boolean(turn)));
    
            clearTimeout(timer);
            timer = setTimeout(timerTick, 1000);
        });

        return () => {
            socket.off('start');
            socket.off('move');
        }
    }, []);

    React.useEffect(() => {
        timer = setTimeout(timerTick, 1000);
        return () => clearTimeout(timer);
    }, [time]);

    let isYou = {textDecoration: 'underline'};
    let isTurn = {fontSize: '1.5rem', fontWeight: 'bold'};

    return (
        <div className={classes.root}>
            <div className={classes.topBar}>
                <div style={{background: 'white'}}>
                    <Typography variant="caption" style={props.matchInfo.black ? {} : isYou}>White</Typography>
                    <Typography style={turn == 0 ? isTurn : {}}>{Math.floor(time[0]/60)}:{String(time[0]%60).padStart(2,'0')}</Typography>
                </div>
                <div style={{background: 'lightgrey', flexGrow: 0, padding: '0 20px'}}>
                    <Typography variant="caption">Room Code</Typography>
                    <Typography variant="h5">{props.matchInfo.code}</Typography>
                </div>
                <div style={{background: 'black', color: 'white'}}>
                    <Typography variant="caption" style={props.matchInfo.black ? isYou : {}}>Black</Typography>
                    <Typography style={turn == 1 ? isTurn : {}}>{Math.floor(time[1]/60)}:{String(time[1]%60).padStart(2,'0')}</Typography>
                </div>
            </div>


            <div className={classes.boardContainer}>
                <div className={classes.board} id="board">
                    {layers.map(layer => <canvas id={`${layer}Layer`} key={layer} className={classes.layer} />)}
                    <div className={classes.actions}>
                        <IconButton onClick={() => showDialog({title: 'Customise'}, customiser)} size="small"><BrushIcon fontSize="small" /></IconButton>
                        <IconButton onClick={() => showDialog({title: 'Edit board size'}, <BoardSizeEditor />)} size="small"><GridOnIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><ShareIcon fontSize="small" /></IconButton>
                    </div>
                </div>
                {props.matchInfo.started ? null : (
                    <div className={classes.setupBar} id="setupBar">
                        <div className={classes.pieceMenu} id="pieceMenu" />
                        <Button variant="contained" color="primary" size="small" onClick={() => socket.emit('start')}>Start</Button>
                    </div>
                )}
            </div>


            <div className={classes.bottomBar}>

            </div>
        </div>
    );
}