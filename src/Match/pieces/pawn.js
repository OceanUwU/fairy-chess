import fn from './fn.js';

export default {
    name: 'pawn',
    desc: 'Can move one space forward. Takes diagonally. Promotes to any piece that\'s been seen this match (apart from a pawn or a king) if it reaches the top of the board.',
    moves: state => {
        let moves = [];
        let direction = state.black ? 1: -1;


        //check forward x spaces and if theyre empty allow
        for (let i = 1; i <= (true ? 2 : 1); i++) {
            let look = i * direction;
            if (state.board.hasOwnProperty(state.position[0]+look) && state.board[state.position[0]+look][state.position[1]] == null)
                moves.push([state.position[0]+look, state.position[1]]);
            else
                break;
        }

        //check diagonals and if enemies are there allow moving there
        for (let i of [[direction, -1], [direction, 1]]) {
            if (state.board[state.position[0]+i[0]] && state.board[state.position[0]+i[0]][state.position[1]+i[1]]) {
                if (state.board[state.position[0]+i[0]][state.position[1]+i[1]][1] != state.black)
                    moves.push([state.position[0]+i[0], state.position[1]+i[1]]);
            }
        }

        return moves;
    }
};