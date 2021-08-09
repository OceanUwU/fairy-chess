import React from 'react';
import { Typography, Tooltip, IconButton, Button, Checkbox, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import layers from './layers.js';
import { setup, setAvailablePromotions } from './gameplay.js';
import FormatPaintIcon from '@material-ui/icons/FormatPaint';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import GridOnIcon from '@material-ui/icons/GridOn';
import ShareIcon from '@material-ui/icons/Share';
import StarIcon from '@material-ui/icons/Star';
import FlagIcon from '@material-ui/icons/Flag';
import CachedIcon from '@material-ui/icons/Cached';
import PanToolIcon from '@material-ui/icons/DragHandle';
import HomeIcon from '@material-ui/icons/Home';
import showDialog from '../showDialog.js';
import Customiser from './Customiser.js';
import BoardSizeEditor from './BoardSizeEditor';
import BoardLoader from './BoardLoader';
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
        alignItems: 'center',
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
            width: 30,
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
    let [iJustWantTheThingToUpdateHolyShit, setIJustWantTheThingToUpdateHolyShit] = React.useState();
    let [time0, setTime0] = React.useState(0);
    let [time1, setTime1] = React.useState(0);
    let [arrows, setArrows] = React.useState(false);
    let [arrowColor, setArrowColor] = React.useState(0);

    let timer;

    let timerTick = () => {
        eval(`setTime${turn}(time${turn}+${props.matchInfo.started ? 1 : 0})`);
        setIJustWantTheThingToUpdateHolyShit(Math.random());
        if (!props.matchInfo.started)
            timer = setTimeout(timerTick, 1000);
    }

    let customiser = <Customiser />;
    React.useEffect(() => {
        setup(props.matchInfo);

        socket.on('start', () => {
            props.matchInfo.started = true;
            setTime0(0);
            setTime1(0);
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
        console.log(props.matchInfo);
    }, [time0, time1]);

    let isYou = {textDecoration: 'underline'};
    let isTurn = {fontSize: '1.5rem', fontWeight: 'bold'};

    return (
        <div className={classes.root}>
            <div className={classes.topBar}>
                <div style={{background: 'white', color: 'black'}}>
                    <Typography variant="caption" style={props.matchInfo.black ? {} : isYou}>White</Typography>
                    <Typography style={turn == 0 ? isTurn : {}}>{Math.floor(time0/60)}:{String(time0%60).padStart(2,'0')}</Typography>
                </div>
                <div style={{background: 'lightgrey', color: 'black', flexGrow: 0, padding: '0 20px'}}>
                    <Typography variant="caption">Room Code</Typography>
                    <Typography variant="h5">{props.matchInfo.code}</Typography>
                </div>
                <div style={{background: 'black', color: 'white'}}>
                    <Typography variant="caption" style={props.matchInfo.black ? isYou : {}}>Black</Typography>
                    <Typography style={turn == 1 ? isTurn : {}}>{Math.floor(time1/60)}:{String(time1%60).padStart(2,'0')}</Typography>
                </div>
            </div>


            <div className={classes.boardContainer}>
                <div className={classes.board} id="board">
                    {layers.map(layer => <canvas id={`${layer}Layer`} key={layer} className={classes.layer} />)}
                    <div className={classes.actions}>
                        <Tooltip title="Customise"><IconButton onClick={() => showDialog({title: 'Customise'}, customiser)} size="small"><FormatPaintIcon fontSize="small" /></IconButton></Tooltip>
                        {arrows
                            ? <Tooltip title="Arrow drawing mode"><IconButton id="arrowMode" arrowmode="true" arrowcolor={arrowColor} onClick={() => setArrows(false)} size="small"><ArrowRightAltIcon fontSize="small" /></IconButton></Tooltip>
                            : <Tooltip title="Piece moving mode"><IconButton id="arrowMode" arrowmode="false" onClick={() => setArrows(true)} size="small"><OpenWithIcon fontSize="small" /></IconButton></Tooltip>
                        }
                        {arrows ? [0,1,2,3].map(i => <IconButton style={{padding: 0, background: arrowColor == i ? 'grey' : 'transparent'}}><FiberManualRecordIcon style={{color: localStorage[`fc-color-arrows-${i}`]}} onClick={() => setArrowColor(i)} size="small" /></IconButton>) : null}
                        {props.matchInfo.started ? [
                            <Tooltip title="Offer draw"><IconButton onClick={async () => {let diag = await showDialog({
                                title: 'Really offer draw?',
                                description: 'If your opponent accepts, the game will end in a draw.',
                                buttonText: 'Offer draw',
                                buttonAction: () => {socket.emit('offerDraw');diag.handleClose()},
                            })}} size="small"><PanToolIcon fontSize="small" /></IconButton></Tooltip>,
                            <Tooltip title="Resign"><IconButton onClick={() => showDialog({
                                title: 'Really resign?',
                                description: 'Your opponent will win the game if you resign.',
                                buttonText: 'Resign',
                                buttonAction: () => socket.emit('resign'),
                            })} size="small"><FlagIcon fontSize="small" /></IconButton></Tooltip>,
                        ] : [
                            <Tooltip title="Switch sides"><IconButton onClick={() => socket.emit('switch')} size="small"><CachedIcon fontSize="small" /></IconButton></Tooltip>,
                            <Tooltip title="Board size"><IconButton onClick={() => showDialog({title: 'Edit board size'}, <BoardSizeEditor />)} size="small"><GridOnIcon fontSize="small" /></IconButton></Tooltip>,
                            <Tooltip title="Export/import boards"><IconButton onClick = {() => showDialog({title: 'Board loader'}, <BoardLoader matchInfo={props.matchInfo} />)} size="small"><ShareIcon fontSize="small" /></IconButton></Tooltip>,
                            <Tooltip title="Promotions"><IconButton onClick={setAvailablePromotions} size="small"><StarIcon fontSize="small" /></IconButton></Tooltip>,
                        ]}
                        {socket.connected ? null : <Tooltip title="Home"><IconButton href="/" size="small"><HomeIcon fontSize="small" /></IconButton></Tooltip>}
                    </div>
                </div>
                {props.matchInfo.started ? null : (
                    <div className={classes.setupBar} id="setupBar">
                        <div className={classes.pieceMenu} id="pieceMenu" />
                        
                        <FormControlLabel control={<Checkbox id="isRoyal" color="primary" />}label="Is Royal"/>
                        <Button variant="contained" color={props.matchInfo.filled ? 'primary' : 'default'} size="small" onClick={() => socket.emit('start')}>Start</Button>
                    </div>
                )}
            </div>


            <div className={classes.bottomBar}>

            </div>
        </div>
    );
}