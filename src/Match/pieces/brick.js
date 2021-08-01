import fn from './fn.js';

export default {
    name: 'brick',
    short: 'br',
    desc: 'Can move anywhere, but can\'t take.',
    moves: state => {
        let moves = [];
        state.board.forEach((row, y) => row.forEach((piece, x) => {
            if (piece == null)
                moves.push([y, x]);
        }));
        return moves;
    },
};