import fn from './fn.js';

export default {
    name: 'double',
    short: 'do',
    desc: 'Makes two knight moves.',
    moves: state => {
        let firstJumps = fn.generic(state, [1, 2], false);
        let secondJumps = [];
        for (let i of firstJumps) {
            state.position = i;
            secondJumps.push(fn.generic(state, [1, 2], false));
        }
        return [].concat.apply([], secondJumps);
    },
};