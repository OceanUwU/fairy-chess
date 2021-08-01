import fn from './fn.js';

export default {
    name: 'wazir',
    short: 'wa',
    desc: '(1,0)-leaper',
    moves: state => fn.generic(state, [1, 0], false),
};