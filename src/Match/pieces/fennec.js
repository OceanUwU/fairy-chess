import fn from './fn.js';

export default {
    name: 'fennec',
    short: 'fe',
    desc: '(1,1)-leaper',
    moves: state => fn.generic(state, [1, 1], false),
};