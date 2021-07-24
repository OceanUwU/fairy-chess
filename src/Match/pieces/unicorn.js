import fn from './fn.js';

export default {
    name: 'unicorn',
    desc: 'Can move like a bishop or a nightrider.',
    moves: state => [...fn.generic(state, [1, 1], true), ...fn.generic(state, [1, 2], true)],
};