import fn from './fn.js';

export default {
    name: 'bishop',
    short: 'bi',
    desc: '(1,1)-rider',
    moves: state => fn.generic(state, [1, 1], true),
};