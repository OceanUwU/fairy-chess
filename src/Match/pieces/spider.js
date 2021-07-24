import fn from './fn.js';

export default {
    name: 'spider',
    desc: 'Can move like an alfil or a dabbaba.',
    moves: state => [...fn.generic(state, [2, 2], false), ...fn.generic(state, [2, 0], false)],
};