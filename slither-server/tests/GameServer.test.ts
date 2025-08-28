import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

import { GameServer } from "../core/GameServer";
import { World } from "../core/World";
import { Player } from "../core/Player";

jest.mock("ws");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-player-id") }));
jest.mock("../core/World");
jest.mock("../core/Player");

function createMockSocket() {
  return {
    send: jest.fn(),
    on: jest.fn(),
    readyState: WebSocket.OPEN,
  } as unknown as jest.Mocked<WebSocket>;
}

describe("GameServer", () => {
    let httpServer: Server;
    let mockWSS: jest.Mocked<WebSocketServer>;
    let server: GameServer;
    let onConnection: (ws: WebSocket) => void;

    beforeEach(() => {
        httpServer = {} as Server;

        // Reset mocks
        (WebSocketServer as unknown as jest.Mock).mockImplementation(() => {
            mockWSS = {
                on: jest.fn(),
                clients: new Set(),
            } as any;
            return mockWSS;
        });

        (World as jest.Mock).mockImplementation(() => ({
            update: jest.fn(),
            getOrbManager: jest.fn(() => ({
                getActiveOrbs: jest.fn(() => [{ id: "orb1" }]),
            })),
        }));

        (Player as jest.Mock).mockImplementation((id: string) => ({
            state: { id, x: 0, y: 0 },
            setInput: jest.fn(),
            update: jest.fn(),
        }));

        server = new GameServer(httpServer);

        // Save the connection handler but DON'T call it here
        onConnection = (mockWSS.on as jest.Mock).mock.calls.find(
            ([event]) => event === "connection"
        )[1];
        // // Manually simulate connection
        // mockSocket = createMockSocket() as jest.Mocked<WebSocket>;
        // const connectionHandler = (mockWSS.on as jest.Mock).mock.calls.find(
        //     ([event]) => event === "connection"
        // )[1];
        // connectionHandler(mockSocket);
    });

    afterEach(() => {
        jest.clearAllMocks();
        server.stop();
    });

    it("initializes correctly", () => {
        expect(WebSocketServer).toHaveBeenCalledWith({ server: httpServer });
        expect(World).toHaveBeenCalled();
    });

    it("sends init message on connection", () => {
        const mockSocket = createMockSocket();
        onConnection(mockSocket);
        expect(mockSocket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "init", playerId: "mock-player-id" })
        );
    });

    it("broadcasts player_join to others", () => {
        const broadcastSpy = jest.spyOn<any, any>(server as any, "broadcast");
        const mockSocket = createMockSocket();
        onConnection(mockSocket);
        const player = (server as any).players["mock-player-id"];

        expect(broadcastSpy).toHaveBeenCalledWith(
            { type: "player_join", player: player.state },
            "mock-player-id"
        );
    });

    it("handles incoming messages and sets player input", () => {
        const mockSocket = createMockSocket();
        onConnection(mockSocket);
        const msgHandler = (mockSocket.on as jest.Mock).mock.calls.find(
            ([event]) => event === "message"
        )[1];

        const player = (server as any).players["mock-player-id"];
        msgHandler(JSON.stringify({ dir: { x: 10, y: 20 }, mouseDown: true }));

        expect(player.setInput).toHaveBeenCalledWith({ x: 10, y: 20 }, true);
    });

    it("ignores invalid messages", () => {
        const mockSocket = createMockSocket();
        onConnection(mockSocket);
        const msgHandler = (mockSocket.on as jest.Mock).mock.calls.find(
            ([event]) => event === "message"
        )[1];

        expect(() => msgHandler("not-json")).not.toThrow();
    });

    it("handles disconnect", () => {
        const mockSocket = createMockSocket();
        onConnection(mockSocket);
        const closeHandler = (mockSocket.on as jest.Mock).mock.calls.find(
            ([event]) => event === "close"
        )[1];

        const broadcastSpy = jest.spyOn<any, any>(server as any, "broadcast");
        closeHandler();

        expect((server as any).players["mock-player-id"]).toBeUndefined();
        expect(broadcastSpy).toHaveBeenCalledWith({
            type: "player_leave",
            playerId: "mock-player-id",
        });
    });

    it("broadcasts world state on update", () => {
        const broadcastSpy = jest.spyOn<any, any>(server as any, "broadcast");
        const mockSocket = createMockSocket();

        onConnection(mockSocket); // ensure a player exists

        (server as any).update(1);

        expect(broadcastSpy).toHaveBeenCalledWith({
            type: "world_update",
            state: {
                players: { "mock-player-id": { id: "mock-player-id", x: 0, y: 0 } },
                orbs: [{ id: "orb1" }],
            },
        });
    });

});
