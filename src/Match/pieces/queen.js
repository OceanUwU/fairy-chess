import fn from './fn.js';

export default {
    name: 'queen',
    desc: 'Can move any number of squares orthogonally or diagonally.',
    moves: state => [...fn.generic(state, [1, 0], true), ...fn.generic(state, [1, 1], true)],
};