import express from "express";
import { createServer } from "http";
import { GameServer } from "./core/GameServer";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

async function main() {
    const app = express();
    const httpServer = createServer(app);

    // serve static client bundle (optional)
    // app.use(express.static("public"));

    // pass the HTTP server into GameServer
    new GameServer(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`HTTP + WS server running on http://localhost:${PORT}`);
    });
}

main();
