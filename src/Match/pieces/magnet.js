import fn from './fn.js';

export default {
    name: 'magnet',
    short: 'mg',
    desc: 'Can move along the queen lines, as long as there is a piece in that direction.',
    moves: state => {
        let moves = [];

        for (let direction of [...fn.getDirections([1,0]), ...fn.getDirections([0,1]), ...fn.getDirections([1,1])]) {
            let directionMoves = [];
            let position = state.position;
            while (true) {
                let location = [position[0]+direction[0], position[1]+direction[1]];
                if (state.board.hasOwnProperty(location[0]) && state.board[location[0]].hasOwnProperty(location[1])) { //if tile exists on grid
                    let occupant = state.board[location[0]][location[1]];
                    if (occupant == null) { //if tile is empty
                        position = location;
                        directionMoves.push(location);
                    } else if (occupant[0] == 'barricade') {
                        break;
                    } else {
                        if (state.board[location[0]][location[1]][1] != state.black)
                            directionMoves.push(location);
                        moves = [...moves, ...directionMoves];
                        break;
                    }
                } else break; //if tile does not exist on grid, stop looking in this direction
            }
        }

        return moves;
    }
};