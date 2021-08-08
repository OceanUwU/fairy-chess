import fn from './fn.js';

export default {
    name: 'dragon',
    short: 'dr',
    desc: 'Moves like an elephant, cannon, or a knight.',
    moves: state => [...fn.generic(state, [2, 0], false), ...fn.generic(state, [2, 1], false), ...fn.generic(state, [2, 2], false)],
};