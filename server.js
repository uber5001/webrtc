var WebSocket = require('ws');

var server = new WebSocket.Server({port: 8765});

var unpairedSocket = null;

server.on('connection', function(socket) {
	console.log('connection received');
	if (unpairedSocket != null) {
		if (unpairedSocket.readyState == WebSocket.CLOSING 
			|| unpairedSocket.readyState == WebSocket.CLOSED) {
			console.log('old connection had close. new connection is waiting to be paired');
			unpairedSocket = socket
		} else {
			console.log('connection paired! No connection is waiting.');
			pair(unpairedSocket, socket);
			unpairedSocket = null;
		}
	} else {
		console.log('connection is waiting to be paired.');
		unpairedSocket = socket;
	}
});

function pair(socketA, socketB) {
	//stage 1, ask A for offer.
	try {
		socketA.send(JSON.stringify({
			type: 'SDP_Stage_1'
		}));
	} catch (e) {
		console.log('Could not send SDP_Stage_1');
	}
	socketA.on('message', function(message) {
		message = JSON.parse(message);
		switch (message.type) {
			case 'offer':
				//stage 2, give B A's offer; ask B for answer
				try {
					socketB.send(JSON.stringify({
						type: 'SDP_Stage_2',
						data: message.data
					}));
				} catch (e) {
					console.log('Could not send SDP_Stage_2');
				}
				break;
			case 'ice':
				//relay all ice messages
				try {
					socketB.send(JSON.stringify({
						type: 'ice',
						data: message.data
					}));
				} catch (e) {
					console.log('Could not send ice to B');
				}
				break;
		}
	});
	socketB.on('message', function(message) {
		message = JSON.parse(message);
		switch (message.type) {
			case 'answer':
				//stage 3, give A B's answer.
				try {
					socketA.send(JSON.stringify({
						type: 'SDP_Stage_3',
						data: message.data
					}));
				} catch (e) {
					console.log('Could not send SDP_Stage_3');
				}
				break;
			case 'ice':
				//relay all ice messages
				try {
					socketA.send(JSON.stringify({
						type: 'ice',
						data: message.data
					}));
				} catch (e) {
					console.log('Could not send ice to A');
				}
				break;
		}
	});
}