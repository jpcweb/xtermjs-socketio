const app = require('express')();
const pty = require('node-pty');
const server = require('http').createServer(app);
const options = {
	cors: {
		origin: "http://localhost:7777"
	},
	port: 9999,
	shell: "bash"
};
const io = require('socket.io')(server, options);
let socket;
let term = pty.fork(options.shell,[],
	{
		cols: 100,
		name: 'xterm',
		cwd: "."
	}
);

term.on('data', data => {
	if (socket) socket.emit('data', Buffer.from(data,"utf-8"));
});

io.on('connection', s => {
	socket = s;
	socket.on('data', data => {
		term.write(data)
	});

	// handle connection lost
	socket.on('disconnect', () => socket = null );
});

server.listen(options.port, () => {
	console.log(`App ready on :${options.port}`)
});