export interface PlayerState {
    id: string; // unique player ID
    position: { x: number; y: number }; // head position
    direction: { x: number; y: number }; // movement vector (normalized)
    radius: number;
    scale: number;
    score: number;
    color: number;
    isBoosting: boolean;
    alive: boolean;
    segmentPositions: { x: number; y: number }[]; // positions of body segments
    respawnTimer?: number;
}
