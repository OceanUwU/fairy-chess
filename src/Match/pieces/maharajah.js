import fn from './fn.js';

export default {
    name: 'maharajah',
    short: 'ma',
    desc: 'Can move like a queen or knight.',
    moves: state => [...fn.generic(state, [1, 0], true), ...fn.generic(state, [1, 1], true), ...fn.generic(state, [1, 2], false)],
};