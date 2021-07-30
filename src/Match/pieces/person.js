import fn from './fn.js';

export default {
    name: 'person',
    desc: 'Moves like a king. Remind me to give this new movement.',
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false)],
};