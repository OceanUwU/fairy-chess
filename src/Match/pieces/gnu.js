import fn from './fn.js';

export default {
    name: 'gnu',
    short: 'gn',
    desc: 'Can move like a camel or a knight.',
    moves: state => [...fn.generic(state, [1, 2], false), ...fn.generic(state, [1, 3], false)],
};