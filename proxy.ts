Bun.listen({
    hostname: "localhost",
    port: 8080,
    socket: {
        data(socket, data) {
            Bun.connect({
                hostname: "localhost",
                port: 1234,
                socket: {
                    open(_socket) {
                        console.log(`[TEST] ${data.toString()}`)
                        _socket.write(data.toString());
                    },
                    data(_socket, message) {
                        console.log(`[INCOMING] > ${message.toString()}`);
                        socket.write(message.toString());
                    }
                }
            });

            console.log(`[INCOMING] > ${data.toString()}`);
        }
    }
});