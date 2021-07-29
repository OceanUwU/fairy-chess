import fn from './fn.js';

const movement = [[-2, -1], [-2, 0], [-2, 1], [-1, -2], [-1, -1], [-1, 0], [0, -2], [0, -1], [0, 1], [1, -2], [1, -1], [1, 0], [1, 1], [2, -1], [2, 1]];

export default {
    name: 'imposter',
    desc: 'amogus',
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