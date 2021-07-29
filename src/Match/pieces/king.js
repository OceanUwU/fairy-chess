import fn from './fn.js';

export default {
    name: 'king',
    desc: 'Can move to any surrounding square. If your opponent could take this piece on their next turn, you MUST prevent that this turn. If you can\'t, you lose.',
    cantPromoteTo: true,
    moves: state => [...fn.generic(state, [1, 1], false), ...fn.generic(state, [1, 0], false)],
};