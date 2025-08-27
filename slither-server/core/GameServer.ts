import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Server } from "http";
import { MongoClient } from "mongodb";

import { World } from "./World";
import { Player } from "./Player";
import * as constants from "../../shared/models/constants";

import { InputMessage, ServerToClientMessage, } from "../../shared/types/messages";
import { PlayerState } from "../../shared/models/player_state";
import { WorldState } from "../../shared/models/world_state";

// local dotenv file
import dotenv from "dotenv";
dotenv.config();

interface PlayerMeta {
    ip: string;
    userAgent: string;
}

export class GameServer {
    private wss: WebSocketServer;
    private world: World;
    private players: Record<string, Player> = {};
    private sockets: Record<string, WebSocket> = {};
    private playerMeta: Record<string, PlayerMeta> = {};

    private client: MongoClient;
    private logs: any;

    private tickInterval: NodeJS.Timeout;

    constructor(httpServer: Server) {
        this.wss = new WebSocketServer({ server: httpServer });
        this.world = new World();

        // MongoDB for Logs
        const uri = process.env.MONGO_URI!;
        this.client = new MongoClient(uri);

        this.client.connect().then(() => {
            const db = this.client.db("slither");
            this.logs = db.collection("player_logs");
            console.log("Connected to MongoDB Atlas");
        }).catch(console.error);

        this.wss.on("connection", (ws: WebSocket, req) => this.handleConnection(ws, req));

        // Start game loop
        const tickRate = 1000 / constants.TICK_RATE;
        this.tickInterval = setInterval(() => this.update(1), tickRate);

        console.log("GameServer initialized");
    }

    private async logPlayerEvent(id: string, event: string, ip: string, userAgent: string) {
        if (!this.logs) return;
        await this.logs.insertOne({
            id,
            event,
            ip,
            userAgent,
            timestamp: new Date(),
        });
    }

    private handleConnection(ws: WebSocket, req: any) {
        // create the new player
        const id = uuidv4();
        const player = new Player(id);
        const ip = req.socket.remoteAddress ?? "unknown";
        const userAgent = req.headers["user-agent"] ?? "unknown";

        this.players[id] = player;
        this.sockets[id] = ws;
        this.playerMeta[id] = { ip, userAgent };

        // logging
        this.logPlayerEvent(id, "connect", ip, userAgent);

        console.log(`Player ${id} connected from ${ip}, ${userAgent}`);

        // Tell client their ID
        const initMsg: ServerToClientMessage = { type: "init", playerId: id };
        ws.send(JSON.stringify(initMsg));

        // Notify others
        const joinMsg: ServerToClientMessage = {
            type: "player_join",
            player: player.state,
        };
        this.broadcast(joinMsg, id);

        ws.on("message", (raw) => this.handleMessage(id, raw.toString()));
        ws.on("close", () => this.handleDisconnect(id));
    }

    private handleMessage(id: string, raw: string) {
        const player = this.players[id];
        if (!player) return;

        try {
            const msg: InputMessage = JSON.parse(raw);
            player.setInput(msg.mousePos, msg.mouseDown);
        } catch (err) {
            console.error("Invalid message from client", err);
        }
    }

    private handleDisconnect(id: string) {
        const meta = this.playerMeta[id];
        // logging
        if (meta) {
            this.logPlayerEvent(id, "disconnect", meta.ip, meta.userAgent);
            console.log(`Player ${id} disconnected from ${meta.ip} (${meta.userAgent})`);
        }

        delete this.players[id];
        delete this.sockets[id];
        delete this.playerMeta[id];

        const leaveMsg: ServerToClientMessage = {
            type: "player_leave",
            playerId: id,
        };
        this.broadcast(leaveMsg);
    }

    public stop() {
        clearInterval(this.tickInterval);
        console.log("Game loop stopped.");
    }


    private getPlayerStates(): Record<string, PlayerState> {
        const states: Record<string, PlayerState> = {};
        for (const [id, player] of Object.entries(this.players)) {
            states[id] = player.state;
        }
        return states;
    }

    private broadcastWorldState() {
        const state: WorldState = {
            players: this.getPlayerStates(),
            orbs: this.world.getOrbManager().getActiveOrbs(),
        };

        const msg: ServerToClientMessage = { type: "world_update", state };
        this.broadcast(msg);
    }

    private broadcast(msg: ServerToClientMessage, excludeId?: string) {
        const payload = JSON.stringify(msg);
        for (const [id, socket] of Object.entries(this.sockets)) {
            if (excludeId && id === excludeId) continue;
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }

    private update(delta: number) {
        this.world.update( Object.values(this.players), delta);
        for (const player of Object.values(this.players)) {
            player.update(this.world.getOrbManager(), delta);
        }
        this.broadcastWorldState();
    }
}
