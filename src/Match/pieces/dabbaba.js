import fn from './fn.js';

export default {
    name: 'dabbaba',
    short: 'da',
    desc: '(2,0)-leaper',
    moves: state => fn.generic(state, [2, 0], false),
};