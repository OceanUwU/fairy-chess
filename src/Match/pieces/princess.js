import fn from './fn.js';

export default {
    name: 'princess',
    desc: 'Can move like a bishop or a knight.',
    moves: state => [...fn.generic(state, [1, 2], false), ...fn.generic(state, [1, 1], true)],
};