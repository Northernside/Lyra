export default {
    port: 1234,
    fetch(request) {
        console.log(request)
        return new Response("Welcome to Bun!");
    },
};