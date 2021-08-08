import fn from './fn.js';

export default {
    name: 'osprey',
    short: 'os',
    desc: 'Moves two squares rookwise to any empty square, then any amount of squares bishopwise.',
    moves: state => {
        let moves = [];
        for (let i of fn.generic(state, [2, 0], false)) {
            if (state.board[i[0]][i[1]] == null)
                moves = [...moves, ...fn.generic({...state, position: i}, [1, 1], true)];
        }
        return moves;

    },
};