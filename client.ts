Bun.connect({
    hostname: "localhost",
    port: 8080,
    socket: {
        open(socket) {
            console.log(`[OUTGOING] > "Hello, Server!"`);
            socket.write("Hello, Server!");
        },
        data(socket, message) {
            console.log(`[INCOMING] > ${message.toString()}`);
        }
    }
});