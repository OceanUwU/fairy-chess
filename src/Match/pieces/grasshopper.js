import fn from './fn.js';

export default {
    name: 'grasshopper',
    desc: 'Can jump over other pieces along the queen lines.',
    moves: state => {
        let moves = [];

        console.log(fn.getDirections);
        console.log([...fn.getDirections([1,0]), ...fn.getDirections([1,1])]);

        for (let direction of [...fn.getDirections([1,0]), ...fn.getDirections([1,1])]) {
            let position = state.position;
            while (true) {
                let location = [position[0]+direction[0], position[1]+direction[1]];
                console.log(location);
                if (state.board.hasOwnProperty(location[0]) && state.board[location[0]].hasOwnProperty(location[1])) { //if tile exists on grid
                    let occupant = state.board[location[0]][location[1]];
                    if (occupant == null) { //if tile is empty
                        position = location;
                    } else {
                        location = [location[0]+direction[0], location[1]+direction[1]];
                        if (state.board.hasOwnProperty(location[0]) && state.board[location[0]].hasOwnProperty(location[1])) { //if tile exists on grid
                            occupant = state.board[location[0]][location[1]];
                            if (occupant == null || occupant[1] != state.black)
                                moves.push(location);
                        }
                        break;
                    }
                } else break; //if tile does not exist on grid, stop looking in this direction
            }
        }

        return moves;
    }
};