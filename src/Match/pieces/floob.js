import fn from './fn.js';

const movement = [[-3, -2], [-2, -1], [-2, 0], [-2, 1], [-3, 2], [-1, -2], [-1, 2], [0, -2], [0, 2], [1, -2], [1, 2], [2, -3], [2, -1], [2, 0], [2, 1], [2, 3]];

export default {
    name: 'floob',
    short: 'fl',
    desc: 'They\'re spreading...',
    moves: state => {
        let moves = [];

        for (let i of JSON.parse(JSON.stringify(movement))) {
            if (state.black) {
                i[0] = i[0] * -1;
                i[1] = i[1] * -1;
            }
            if (state.board.hasOwnProperty(state.position[0]+i[0]) && state.board[state.position[0]].hasOwnProperty(state.position[1]+i[1])) {
                let piece = state.board[state.position[0]+i[0]][state.position[1]+i[1]];
                if (piece == null || piece[1] != state.black)
                    moves.push([state.position[0]+i[0], state.position[1]+i[1]]);
            }
        }

        return moves;
    },
};