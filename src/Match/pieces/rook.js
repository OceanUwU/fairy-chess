import fn from './fn.js';

export default {
    name: 'rook',
    short: 'ro',
    desc: '(1,0)-rider',
    moves: state => fn.generic(state, [1, 0], true),
};