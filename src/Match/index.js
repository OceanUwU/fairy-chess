import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        textAlign: 'center',
    },
});

export default function Match(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography>room code: {props.matchInfo.code}</Typography>
        </div>
    );
}