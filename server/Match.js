module.exports = class Match {
    constructor(code) {
        this.code = code;
        this.playerA = null;
        this.playerB = null;
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
            code: this.code,
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