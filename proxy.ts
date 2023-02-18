import {Database} from "bun:sqlite";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const hosts = require("./hosts.json"),
    db = Database.open("lyra.sqlite", {
        readonly: false,
        create: true
    });

db.run(`CREATE TABLE IF NOT EXISTS requests ("origin" json NOT NULL, "target" json NOT NULL);`);

Bun.listen({
    hostname: "localhost",
    port: parseInt(process.env.LYRA_PORT),
    socket: {
        data(client, data) {
            const host = hosts.filter(host => host.origin.host == client.listener.hostname && host.origin.port == client.listener.port)[0]
            if (host) {
                Bun.connect({
                    hostname: host.target.host,
                    port: host.target.port,
                    socket: {
                        open(server) {
                            console.log(`[CLIENT -> SERVER] > ${data.toString()}`);
                            server.write(data.toString());
                        },
                        data(_socket, message) {
                            const origin = JSON.stringify({
                                host: client.listener.hostname,
                                port: client.listener.port
                            }), target = JSON.stringify({
                                host: host.target.host,
                                port: host.target.port
                            });

                            db.run(`INSERT INTO requests VALUES ($origin, $target)`, {$origin: origin, $target: target});
                            console.log(`[SERVER -> CLIENT] > ${message.toString()}`);
                            client.write(message.toString());
                        }
                    }
                });
            }
        }
    }
});