import { PlayerState } from "../models/player_state";
import { WorldState } from "../models/world_state";

export type InputMessage = {
    mousePos: { x: number, y: number };
    // dir: { x: number, y: number };
    mouseDown: boolean;
};

export type ServerToClientMessage =
    | { type: "init"; playerId: string }
    | { type: "world_update"; state: WorldState }
    | { type: "player_join"; player: PlayerState }
    | { type: "player_leave"; playerId: string };
