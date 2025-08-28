import { PlayerState } from "../models/player_state";
import { OrbState } from "../models/orb_state";

export type InputMessage = {
    dir: { x: number, y: number };
    mouseDown: boolean;
};

export type ServerToClientMessage =
    | { type: "init"; playerId: string }
    | { type: "player_join"; player: PlayerState }
    | { type: "player_leave"; playerId: string }
    | { type: "orb_batch_spawn"; orbs: OrbState[] }
    | { type: "orb_spawn"; orb: OrbState }
    | { type: "orb_despawn"; orbId: number }
    | { type: "world_update"; players: Record<string, PlayerState> };
