import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Server } from "http";

import { World } from "./World";
import { Player } from "./Player";
import * as constants from "../../shared/models/constants";

import { InputMessage, ServerToClientMessage, } from "../../shared/types/messages";
import { PlayerState } from "../../shared/models/player_state";
import { WorldState } from "../../shared/models/world_state";

export class GameServer {
    private wss: WebSocketServer;
    private world: World;
    private players: Record<string, Player> = {};
    private sockets: Record<string, WebSocket> = {};

    private tickInterval: NodeJS.Timeout;

    constructor(httpServer: Server) {
        this.wss = new WebSocketServer({ server: httpServer });
        this.world = new World();

        this.wss.on("connection", (ws: WebSocket) => this.handleConnection(ws));

        // Start game loop
        const tickRate = 1000 / constants.TICK_RATE;
        this.tickInterval = setInterval(() => this.update(1), tickRate);

        console.log("GameServer initialized");
    }

    private handleConnection(ws: WebSocket) {
        // create the new player
        const id = uuidv4();
        const player = new Player(id);
        this.players[id] = player;
        this.sockets[id] = ws;

        console.log(`Player ${id} connected`);

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
        delete this.players[id];
        delete this.sockets[id];
        console.log(`Player ${id} disconnected`);

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
