import fn from './fn.js';

export default {
    name: 'centaur',
    short: 'ce',
    desc: 'Can move like a king or a knight.',
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false), ...fn.generic(state, [1, 2], false)],
};