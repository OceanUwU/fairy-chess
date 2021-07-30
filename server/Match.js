export default class Match {
    constructor(code) {
        this.code = code;
        this.player0 = null;
        this.player1 = null;
        this.board = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(p => [p, 1]),
            Array(8).fill(null).map(p => ['pawn', 1]),
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null).map(p => ['pawn', 0]),
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(p => [p, 0]),
        ];
        this.board.forEach(row => row.forEach(piece => {if (Array.isArray(piece) && piece[0] == 'king') piece.push(1)}));
        this.promotions = ['bishop', 'queen', 'knight', 'rook'];
        this.turn = 0;
        this.history = [];
        this.width = this.board[0].length;
        this.height = this.board.length;
        this.started = false;
        this.drawOffer = null;
    }

    get players() {
        return [this.player0, this.player1];
    }

    opponent(num) {
        return this.players[Number(!num)];
    }

    get connected() {
        return this.players.filter(player => player != null);
    }

    emit() {
        let args = Array.from(arguments).map(a => JSON.stringify(a)).join(',');
        this.connected.forEach(socket => eval(`socket.emit(${args})`));
    }

    matchInfo(socket) {
        return {
            ...Object.fromEntries(['code', 'width', 'height', 'board', 'started', 'turn', 'history', 'promotions'].map(key => [key, this[key]])),
            black: socket.num == 1,
        }
    }

    join(socket) {
        if (this.connected.length < 2) {
            socket.ingame = this.code;
            socket.match = this;
            socket.num = this.player0 == null ? 0 : 1;
            this[`player${socket.num}`] = socket;
            socket.emit('join', this.matchInfo(socket));
        } else
            socket.emit('err', 'This match is full!');
    }
};