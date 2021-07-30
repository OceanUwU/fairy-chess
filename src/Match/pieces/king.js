import fn from './fn.js';

export default {
    name: 'king',
    desc: 'Can move to any surrounding square.',
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false)],
};