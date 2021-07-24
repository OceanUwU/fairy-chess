import fn from './fn.js';

export default {
    name: 'empress',
    desc: 'Can move like a rook or a knight.',
    moves: state => [...fn.generic(state, [1, 2], false), ...fn.generic(state, [1, 0], true)],
};