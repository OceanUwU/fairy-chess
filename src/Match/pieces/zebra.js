import fn from './fn.js';

export default {
    name: 'zebra',
    short: 'ze',
    desc: '(2,3)-leaper',
    moves: state => fn.generic(state, [2, 3], false),
};