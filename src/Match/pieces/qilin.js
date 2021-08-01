import fn from './fn.js';

export default {
    name: 'qilin',
    short: 'qi',
    desc: 'Can move like a ferz or a dabbaba.',
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [2, 0], false)],
};