import fn from './fn.js';

export default {
    name: 'person',
    short: 'pe',
    desc: 'Moves like a king, but can\'t castle.',
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false)],
};
