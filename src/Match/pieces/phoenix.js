import fn from './fn.js';

export default {
    name: 'phoenix',
    short: 'ph',
    desc: 'Can move like a wazir or an alfil.',
    moves: state => [...fn.generic(state, [2, 2], false), ...fn.generic(state, [1, 0], false)],
};