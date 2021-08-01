import fn from './fn.js';
import pawn from './pawn.js';

export default {
    name: 'weakpawn',
    short: 'we',
    desc: 'Same as the pawn, without the starting two-space bonus.',
    cantPromoteTo: true,
    moves: state => pawn.moves({...state, weak: true})
};