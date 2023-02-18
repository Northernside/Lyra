import {Database} from "bun:sqlite";

const db = Database.open("lyra.sqlite", {
    readonly: false,
    create: true
});

db.run(`CREATE TABLE IF NOT EXISTS hosts ("host" text NOT NULL, "server" text NOT NULL, "stats" json NOT NULL, PRIMARY KEY ("host"));`);

export default {
    port: 3000,
    async fetch(request) {
        const host = db.query(`SELECT * FROM hosts WHERE host = $host`).get({$host: request.headers.host});
        //if (!host) return new Response(JSON.stringify({status: 404}));
        const test = await fetch("https://northernsi.de");
        return new Response(await test.text());
    },
};