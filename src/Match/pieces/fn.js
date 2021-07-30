import * as pieces from './index.js';

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
    return moves.filter((i, ind1) => !moves.some((j, ind2) => ind2 < ind1 && i[0] == j[0] && i[1] == j[1]));
}

function validMoves(state) {
    let moves = pieces[state.board[state.position[0]][state.position[1]][0]].moves(state);
    moves = removeDuplicates(moves);
    var i = moves.length;
    while (i--) {
        let move = moves[i];
        let board = JSON.parse(JSON.stringify(state.board));
        let destinationPiece = board[move[0]][move[1]];
        if (destinationPiece != null && destinationPiece[0] == 'barricade') {
            moves.splice(i, 1);
            break;
        }
        board[move[0]][move[1]] = board[state.position[0]][state.position[1]];
        board[state.position[0]][state.position[1]] = null;
        state.history.push([state.position, move]);
        if (move[2]) {
            for (let i of move[2]) {
                board[i[0][0]][i[0][1]] = i[1];
            }
        }
        if (inCheck(board, state.history, Number(state.black))) { 
            moves.splice(i, 1);
        }
        state.history.splice(-1); 
    }
    return moves;
}

function inCheck(board, history, player) {
    let royals = [];
    for (let y in board) {
        for (let x in board[y]) {
            let piece = board[y][x];
            if (piece != null && piece[2] && piece[1] == player) {
                royals.push([Number(y), Number(x)]);
            }
        }
    }

    if (royals.length == 0) return false;

    let checks = [];
    for (let y in board) {
        for (let x in board[y]) {
            let piece = board[y][x];
            if (piece != null && piece[1] != player) {
                let position = [Number(y), Number(x)];
                let checked;
                let moves = pieces[piece[0]].moves({
                    board: board,
                    black: !(Boolean(player)),
                    position,
                    history: history,
                });
                moves.map(move => royals.filter(loc => move[0] == loc[0] && move[1] == loc[1])).forEach(i => i.forEach(j => checks.push([position, j])));
            }
        }
    }

    return checks.length == 0 ? false : checks;
}

export default {
    rotateState,
    generic,
    fix,
    getDirections,
    rotateMoves,
    validMoves,
    inCheck,
};