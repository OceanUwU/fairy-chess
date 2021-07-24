import fn from './fn.js';

export default {
    name: 'alfil',
    desc: '(2,2)-leaper',
    moves: state => fn.generic(state, [2, 2], false),
};