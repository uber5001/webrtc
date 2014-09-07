var WebSocket = require('ws');

var server = new WebSocket.Server({port: 8765});

var unpairedSocket = null;

server.on('connection', function(socket) {
	if (unpairedSocket != null) {
		pair(unpairedSocket, socket);
		unpariedSocket = undefined;
	} else {
		unpairedSocket = socket;
	}
});

function pair(socketA, socketB) {
	//stage 1, ask A for offer.
	socketA.send(JSON.stringify({
		type: 'SDP_Stage_1'
	}));
	socketA.on('message', function(message) {
		message = JSON.parse(message);
		switch (message.type) {
			case 'offer':
				//stage 2, give B A's offer; ask B for answer
				socketB.send(JSON.stringify({
					type: 'SDP_Stage_2',
					data: message.data
				}));
				break;
			case 'ice':
				//relay all ice messages
				socketB.send(JSON.stringify({
					type: 'ice',
					data: message.data
				}));
				break;
		}
	});
	socketB.on('message', function(message) {
		message = JSON.parse(message);
		switch (message.type) {
			case 'answer':
				//stage 3, give A B's answer.
				socketA.send(JSON.stringify({
					type: 'SDP_Stage_3',
					data: message.data
				}));
				break;
			case 'ice':
				//relay all ice messages
				socketA.send(JSON.stringify({
					type: 'ice',
					data: message.data
				}));
				break;
		}
	});
}