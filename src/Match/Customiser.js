import { Typography } from '@material-ui/core';
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { makeStyles } from '@material-ui/core/styles';
import { recolorImages, drawGrid, drawPieces, drawText } from './gameplay.js';

const useStyles = makeStyles({
    colorBox: {
        width: 12,
        height: 12,
        display: 'inline-block',
        borderRadius: 4,
        marginLeft: 5,
    },
});
const bodyStyle = (attr, color) => {
    document.body.style[attr] = localStorage[`fc-color-${color}`];
}
const pieces = () => {
    recolorImages();
    drawPieces();
};
const options = [['bg', 'Background', '#ffe0ff', () => bodyStyle('background', 'bg'), true], ['a', 'White player', '#f2f0dc', pieces], ['b', 'Black player', '#5c5a58', pieces], ['c', 'Grid\'s 1st', '#ff75ed', drawGrid], ['d', 'Grid\'s 2nd', '#ffc9f8', drawGrid], ['previousMove', 'Previous move highlight', '#ff6c6c', drawGrid], ['checkIndicator', 'Check indicator line', '#7b00ff', drawPieces], ['royalGlowAlly', 'Royal glow (ally)', '#00feff', drawPieces], ['royalGlowEnemy', 'Royal glow (enemy)', '#ff0000', drawPieces], ['boardText', 'Text on board', '#000000', drawText]];
for (let i of options) {
    if (!localStorage.hasOwnProperty(`fc-color-${i[0]}`))
        localStorage[`fc-color-${i[0]}`] = i[2];
    if (i[4])
        i[3](localStorage[`fc-color-${i[0]}`]);
}

export default function Customiser() {
    const classes = useStyles();

    const [selected, setSelected] = React.useState('bg');
    const [color, setColor] = React.useState(localStorage['fc-color-bg']);


    return (
        <div>
            <HexColorPicker color={color} onChange={color => {
                localStorage[`fc-color-${selected}`] = color;
                setColor(color);
                options.find(o => o[0] == selected)[3]();
            }} />

            {options.map(option => (
                <div key={option[0]}>
                    <Typography style={{color: option[0] == selected ? 'black' : 'grey'}} onClick={() => {
                        setSelected(option[0]);
                        setColor(localStorage[`fc-color-${option[0]}`]);
                    }}>
                        {option[1]}:
                        <span className={classes.colorBox} style={{backgroundColor: localStorage[`fc-color-${option[0]}`], border: option[0] == selected ? '1px solid black' : 'none'}} />
                    </Typography>
                </div>
            ))}
        </div>
    );
};