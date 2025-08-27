import express from "express";
import { createServer } from "http";
import path from "path";
import { GameServer } from "./core/GameServer";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

async function main() {
    const app = express();
    const httpServer = createServer(app);

    const clientDist = path.resolve(__dirname, "../../../slither-client/dist");
    console.log("Serving client from:", clientDist);

    app.use("/", express.static(clientDist));

    // pass the HTTP server into GameServer
    new GameServer(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`HTTP + WS server running on http://localhost:${PORT}`);
    });
}

main();
