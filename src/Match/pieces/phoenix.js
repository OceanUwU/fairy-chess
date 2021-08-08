import fn from './fn.js';

export default {
    name: 'phoenix',
    short: 'ph',
    desc: 'Can move like a lamb or an elephant.',
    moves: state => [...fn.generic(state, [2, 2], false), ...fn.generic(state, [1, 0], false)],
};