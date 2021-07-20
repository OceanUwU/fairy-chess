import React from 'react';
import socket from '../socket.js';
import { Typography, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CodeInput from './CodeInput';

const useStyles = makeStyles({
    root: {
        textAlign: 'center',
    },

    banner: {
        width: 400,
        maxWidth: '90vw',
    }
});


export default function Home() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography variant="h1"><img className={classes.banner} src="/banner.png" alt="Fairy Chess" /></Typography>
            <Divider style={{marginBottom: 8}} />
            <Button variant="contained" color="secondary" onClick={() => socket.emit('createMatch')} style={{marginBottom: 24}} size="large">Create Match</Button>
            <CodeInput />
            <Divider style={{marginTop: 8}} />
            <Typography>Chess with extra pieces lol</Typography>
        </div>
    );
};