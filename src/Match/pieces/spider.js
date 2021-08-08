import fn from './fn.js';

export default {
    name: 'spider',
    short: 'sp',
    desc: 'Can move like an elephant or a cannon.',
    moves: state => [...fn.generic(state, [2, 2], false), ...fn.generic(state, [2, 0], false)],
};