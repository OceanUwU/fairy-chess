import fn from './fn.js';

export default {
    name: 'giraffe',
    desc: '(1,4)-leaper',
    moves: state => fn.generic(state, [1, 4], false),
};