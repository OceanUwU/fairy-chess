import fn from './fn.js';

export default {
    name: 'camel',
    desc: '(1,3)-leaper',
    moves: state => fn.generic(state, [1, 3], false),
};