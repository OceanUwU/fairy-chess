import fn from './fn.js';

export default {
    name: 'nightrider',
    short: 'ni',
    desc: '(1,2)-rider',
    moves: state => fn.generic(state, [1, 2], true),
};