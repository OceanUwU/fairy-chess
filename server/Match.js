module.exports = class Match {
    constructor(code) {
        this.code = code;
        this.playerA = null;
        this.playerB = null;
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
        this.width = this.board[0].length;
        this.height = this.board.length;
        this.started = false;
    }

    get players() {
        return [this.playerA, this.playerB];
    }

    get connected() {
        return this.players.filter(player => player != null);
    }

    emit() {
        let args = Array.from(arguments).map(a => JSON.stringify(a)).join(',');
        this.connected.forEach(socket => eval(`socket.emit(${args})`));
    }

    get matchInfo() {
        return {
            ...Object.fromEntries(['code', 'width', 'height', 'board', 'started'].map(key => [key, this[key]])),
        }
    }

    join(socket) {
        if (this.connected.length < 2) {
            socket.ingame = this.code;
            socket.player = this.playerA == null ? 'A' : 'B';
            this[`player${socket.player}`] = socket;
            socket.emit('join', this.matchInfo);
        } else
            socket.emit('err', 'This match is full!');
    }
}