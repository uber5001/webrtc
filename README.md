webrtc
======

A simple webrtc demo, using WebSockets for the protocol of the signaling server.

Setup
-----

First, you'll need node.js. Then you need these packages:

    npm install -g http-server
    npm install ws
    
To run the demo, run the signaling server...

    node server.js
    
...and the http server.

    http-server
    
Then open the client in *two* tabs at `http://localhost:8080`. Have each client click connect. You should now see two images of your camera in each tab.

If you want to try a real video chat, run the signaling server from a server that both clients can access. Then, on each client, change the content of the texxtbox that contains `ws://localhost:8765` to `ws://<addressOfTheSignalingServer>:8765`. Have both clients click connect, and you *should* be able to see the other end.

This might not always work, as I don't think TURN is set up correctly.
