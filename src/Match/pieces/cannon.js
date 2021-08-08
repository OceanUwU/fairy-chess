import fn from './fn.js';

export default {
    name: 'cannon',
    short: 'cn',
    desc: '(2,0)-leaper',
    moves: state => fn.generic(state, [2, 0], false),
};