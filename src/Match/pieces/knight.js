import fn from './fn.js';

export default {
    name: 'knight',
    short: 'kn',
    desc: '(1,2)-leaper',
    moves: state => fn.generic(state, [1, 2], false),
};