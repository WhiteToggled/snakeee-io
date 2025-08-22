import { PlayerState } from "../models/player_state";
import { WorldState } from "../models/world_state";

export type ClientToServerMessage =
    | { type: "input"; input: { up: boolean; down: boolean; left: boolean; right: boolean; boost: boolean } };

export type ServerToClientMessage =
    | { type: "world_update"; state: WorldState }
    | { type: "player_join"; player: PlayerState }
    | { type: "player_leave"; playerId: string };

