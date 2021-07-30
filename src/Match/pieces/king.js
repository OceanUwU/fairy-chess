import fn from './fn.js';

export default {
    name: 'king',
    desc: 'Can move to any surrounding square.',
    moves: state => {
        let moves = [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false)];

        if (state.history.every(h => h[1][0] != state.position[0] || h[1][1] != state.position[1])) { //if king has never moved
            console.log('king never moved!');
            for (let i of [-1, 1]) { //for each (left, right)
                let distance = 0;
                while (state.board[state.position[0]].hasOwnProperty(state.position[1]+(i*++distance))) {
                    let x = state.position[1]+(i*distance);
                    let piece = state.board[state.position[0]][x];
                    if (piece == null)
                        continue;
                    if (piece[0] == 'rook') {
                        if (distance >= 2) {
                            if (state.history.every(h => h[1][0] != state.position[0] || h[1][1] != x)) { //if rook has never moved
                                moves.push([state.position[0], state.position[1]+(i*2), [
                                    [[state.position[0], state.position[1]+(i)], state.board[state.position[0]][x]], //jump rook over king
                                    [[state.position[0], x], distance == 2 ? state.board[state.position[0]][state.position[1]] : null], //empty old rook space
                                ]]);
                            }
                        }
                        break;
                    } else //path between king and rook is not empty 
                        break; //stop searching
                }
            }
        }

        return moves;
    },
};