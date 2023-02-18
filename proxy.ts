import {Database} from "bun:sqlite";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const hosts = require("./hosts.json"),
    db = Database.open("lyra.sqlite", {
        readonly: false,
        create: true
    });

db.run(`CREATE TABLE IF NOT EXISTS requests ("origin" json NOT NULL, "target" json NOT NULL, "timestamp" bigint NOT NULL);`);

Bun.listen({
    hostname: "0.0.0.0",
    port: parseInt(process.env.LYRA_PORT),
    socket: {
        data(client, data) {
            const hostname = data.toString().split("\r\n")[1].split(" ")[1],
                host = hosts.filter(host => host.origin.host == hostname)[0];

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
                                host: hostname,
                                port: 80
                            }), target = JSON.stringify({
                                host: host.target.host,
                                port: host.target.port
                            });

                            db.run(`INSERT INTO requests VALUES ($origin, $target, $timestamp)`, {$origin: origin, $target: target, $timestamp: Date.now()});
                            console.log(`[SERVER -> CLIENT] > ${message.toString()}`);
                            client.write(message.toString());
                        }
                    }
                });
            }
        }
    }
});