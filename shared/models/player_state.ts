export interface PlayerState {
    id: string; // unique player ID
    position: number[]; // head position
    segmentCount: number;
    // segmentPositions: { x: number; y: number }[]; // positions of body segments
    // direction: { x: number; y: number }; // movement vector (normalized)
    radius: number;
    scale: number;
    score: number;
    color: number;
    alive: boolean;
    // isBoosting: boolean;
    // respawnTimer?: number;
}
