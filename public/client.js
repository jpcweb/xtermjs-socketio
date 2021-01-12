import './assets/xterm.js';
import './assets/xterm-addon-fit.js';
import 'https://cdn.socket.io/socket.io-3.0.1.min.js'

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    //You have to set the same number in your server
    cols: 100,
    theme: {
        background: "#333"
    }
};

class Client {
    constructor(options = {}) {
        this.socket = io.connect(options.remote || "http://localhost:9999")
        this.elParent = document.getElementById(options.parent) || document.body
    }
    ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }
    createTerminal = () => {
        let _this = this
        this.socket.binaryType="arraybuffer"
        this.socket.on('connect', () => {
            const term = new Terminal(OPTIONS_TERM)
            term.open(_this.elParent);

            term.onData((data) => {
                _this.socket.emit('data',new TextEncoder().encode("\x00" + data));
            });

            _this.socket.on('data', data => {
                if (data instanceof ArrayBuffer) {
                    term.write(_this.ab2str(data))
                }
            });
            _this.socket.on('disconnect', () => term.destroy());

            _this.socket.emit('data', '\n');
        });
    }
}

export { Client };

const client = new Client({"remote": "http://localhost:9999/", "parent":"terminal"})
client.createTerminal();