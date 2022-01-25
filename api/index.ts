import * as http from "http";
import Server from "./server";

const port = 3080;

Server.set("port", port);
const server = http.createServer(Server);
server.listen(port);


server.on("listening", function(): void {
    const addr = server.address();
    const bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr?.port}`;
    console.log(`Listening on ${bind}`);
 });

module.exports = Server;