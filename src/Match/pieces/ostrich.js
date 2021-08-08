import fn from './fn.js';

export default {
    name: 'ostrich',
    short: 'ot',
    desc: 'Moves two squares bishopwise to any empty square, then any amount of squares rookwise.',
    moves: state => {
        let moves = [];
        for (let i of fn.generic(state, [2, 2], false)) {
            if (state.board[i[0]][i[1]] == null)
                moves = [...moves, ...fn.generic({...state, position: i}, [1, 0], true)];
        }
        return moves;
    },
};