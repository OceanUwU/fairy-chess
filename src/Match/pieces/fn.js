function rotateState(state) {
    if (state.black) {
        const w = state.board[0].length;
        const h = state.board.length;
        let b = new Array(h);
        for (let y=0; y<h; y++) {
            let n = h-1-y;
            b[n] = new Array(w);
            for (let x=0; x<w; x++) {
                b[n][w-1-x] = state.board[y][x];
            }
        }
        state.board = b;

        state.position = [state.board[0].length-state.position[0]-1, state.board.length-state.position[1]-1];
    
        if (state.history != null) {
            //rotate history
        }
    }

    return state;
}

function getDirections(move) {
    let directions = [];
    for (let i = -1; i <= 1; i +=2)
        for (let j = -1; j <= 1; j +=2)
            directions.push([move[0] * i, move[1] * j]);
    return directions
}

function generic(state, move, isRider) {
    let moves = [];

    let directions = getDirections(move);
    if (move[0] != move[1])
        directions = [...directions, ...getDirections(move.reverse())];

    for (let direction of directions) {
        let position = state.position;
        do {
            let location = [position[0]+direction[0], position[1]+direction[1]];
            if (state.board.hasOwnProperty(location[0]) && state.board[location[0]].hasOwnProperty(location[1])) { //if tile exists on grid
                let occupant = state.board[location[0]][location[1]];
                if (occupant == null) { //if tile is empty
                    moves.push(location); //allow moving there
                    position = location;
                } else {
                    if (occupant[1] != state.black) //if tile occupant is an enemy
                        moves.push(location); //allow moving there
                    break;
                }
            } else break; //if tile does not exist on grid, stop looking in this direction
        } while (isRider)
    }

    return moves;
}

function fix(state, rotate) {
    
}

function rotateMoves(state, moves) {
    if (state.black) {
        let w = state.board[0].length;
        let h = state.board.length;
    
        for (let move of moves) {
            move[0] = h-move[0]-1;
            move[1] = w-move[1]-1;
        }
    }
}

function removeDuplicates(moves) {
    return moves.map(i => JSON.stringify(i)).filter((value, index, self) => self.indexOf(value) === index).map(i => JSON.parse(i));
}

function removeInvalidMoves(moves) {
    moves = removeDuplicates(moves);
    return moves;
}

export default {
    rotateState,
    generic,
    fix,
    getDirections,
    rotateMoves,
    removeInvalidMoves,
};