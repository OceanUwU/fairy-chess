import fn from './fn.js';

export default {
    name: 'rook',
    desc: 'Can move any number of spaces orthogonally.',
    moves: state => fn.generic(state, [1, 0], true),
};