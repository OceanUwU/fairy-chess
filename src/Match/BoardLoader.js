import React from 'react';
import { Typography, TextField, Button, Divider } from '@material-ui/core';
import * as pieces from './pieces';
import socket from '../socket';
import showDialog from '../showDialog';

function encode(matchInfo) {
    let code = '';
    for (let rank of matchInfo.board) {
        let empty = 0;
        for (let piece of rank) {
            if (empty > 0 || piece == null) {
                if (piece == null)
                    empty++;
                else {
                    code += empty;
                    empty = 0;
                }
            }
            if (piece != null) {
                let str = pieces[piece[0]].short;
                code += (piece[1] ? str[0].toUpperCase() : str[0]) + (piece[2] ? str[1].toUpperCase() : str[1]);
            }
        }
        if (empty > 0) {
            code += empty;
            empty = 0;
        }
        code += '/';
    }
    code = code.slice(0, -1); //remove last slash
    code += ',';
    code += matchInfo.promotions.map(p => pieces[p].short).join('');

    return code;
};



function load(code, matchInfo) {
    code = code.split(',');
    if (code.length != 2) return false;

    let boardString = code[0].split('/');
    let board = boardString.map(rank => []);
    boardString.forEach((rank, y) => {
        while (rank.length > 0) {
            let num = '';
            while (!Number.isNaN(Number(rank[0]))) { //if first character is a number
                num += rank[0];
                rank = rank.slice(1);
            }
            if (num.length > 0) {
                board[y] = [...board[y], ...Array(Number(num)).fill(null)];
            }
            if (rank.length >= 2) {
                let pieceStr = rank.slice(0, 2);
                rank = rank.slice(2);
                let piece = [];
                let pieceInfo = Object.values(pieces).find(p => p.short == pieceStr.toLowerCase());
                if (pieceInfo == undefined) {
                    board[y].push(false);
                    return;
                }
                piece.push(pieceInfo.name);
                piece.push(Number(pieceStr[0] == pieceStr[0].toUpperCase()));
                if (pieceStr[1] == pieceStr[1].toUpperCase())
                    piece.push(1);
                board[y].push(piece);
            } else break;
        }
    });
    if (board.some(rank => rank.includes(false))) return false;
    let height = board.length;
    if (height < 2 || height > 16) return false;
    let width = board[0].length;
    if (width < 2 || width > 16) return false;
    if (board.some(rank => rank.length != width)) return false;

    let promotions = code[1].match(/.{2}/g);
    if (promotions == null || promotions.length == 0) return false;
    promotions = promotions.map(prom => {
        let piece = Object.values(pieces).find(p => p.short == prom);
        if (piece == undefined) return null;
        else return piece.name;
    });
    if (promotions.some(p => p == null)) return false;

    new Promise(async res => {
        let aBit = async () => new Promise(res => setTimeout(res, 10));

        (await showDialog({title: 'Loading board...'})).handleClose();

        for (let rank = 0; rank < matchInfo.height; rank++)
            for (let file = 0; file < matchInfo.width; file++) {
                if (matchInfo.board[rank] && matchInfo.board[rank][file] != null) {
                    socket.emit('place', file, rank, null);
                    await aBit();
                }
            }

        for (let dim of ['width', 'height']) {
            let size = matchInfo[dim]
            while (size != eval(dim)) {
                let dir = matchInfo[dim] < eval(dim) ? 1 : -1;
                socket.emit('size', dim, dir);
                size += dir;
                await aBit();
            }
        }

        for (let rank = 0; rank < height; rank++)
            for (let file = 0; file < width; file++) {
                if (board[rank] && board[rank][file] != null) {
                    socket.emit('place', file, rank, board[rank][file].slice(0, 2), board[rank][file][2]);
                    await aBit();
                }
            }
        
        socket.emit('promotions', promotions, true);
    });
    return true;
};

export default function BoardLoader(props) {
    let [toImport, setToImport] = React.useState('');

    return (
        <div>
            <Typography>Import board</Typography>
            <br />
            <TextField id="importBoard" label="New match code" variant="outlined" value={toImport} onChange={e => setToImport(e.target.value)} />
            <Button variant="outlined" onClick={() => load(toImport, props.matchInfo) ? null : showDialog({title: 'Invalid match code', description: ':(', layer: 2})}>Load</Button>

            <br /><br /><Divider /><br />
            <Typography>Export board</Typography>
            <br />
            <TextField id="exportBoard" label="Current match code" variant="outlined" value={encode(props.matchInfo)} />
            <Button variant="outlined" onClick={() => {
                let copyText = document.getElementById('exportBoard');
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }}>Copy</Button>
        </div>
    );
}