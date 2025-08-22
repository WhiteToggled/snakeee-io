import { PlayerState } from "./player_state";
import { OrbState } from "./orb_state"

export interface WorldState {
    players: Record<string, PlayerState>; // string key is the playerID
    orbs: OrbState[];
}
