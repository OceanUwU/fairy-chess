import fn from './fn.js';

export default {
    name: 'bishop',
    desc: 'Can move any number of squares diagonally.',
    moves: state => fn.generic(state, [1, 1], true),
};