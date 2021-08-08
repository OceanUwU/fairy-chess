import fn from './fn.js';

export default {
    name: 'elephant',
    short: 'el',
    desc: '(2,2)-leaper',
    moves: state => fn.generic(state, [2, 2], false),
};