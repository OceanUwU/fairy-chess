import fn from './fn.js';

export default {
    name: 'pawn',
    short: 'pa',
    desc: 'Can move one space forward. Takes diagonally. Can be promoted to another piece if it reaches the top of the board.',
    cantPromoteTo: true,
    moves: state => {
        let moves = [];
        let direction = state.black ? 1: -1;


        //check forward x spaces and if theyre empty allow
        for (let i = 1; i <= (state.weak ? 1 : (!state.history.some(h => h[1][0] == state.position[0] && h[1][1] == state.position[1]) ? 2 : 1)); i++) {
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

        //en passent
        if (state.history.length >= 1) {
            let last = state.history[state.history.length-1];
            if (state.board[last[1][0]][last[1][1]][0] == 'pawn') { //if the last piece to move was a pawn
                for (let dir of [1, -1]) { //if that pawn is adjacent to the currently moving pawn
                    if (state.position[0] == last[1][0] && state.position[1]+dir == last[1][1]) { 
                        if (Math.abs(last[1][0] - last[0][0]) == 2)
                            moves.push([state.position[0]+direction, state.position[1]+dir, [[last[1], null]]]);
                    }
                }
            };
        }

        return moves;
    }
};