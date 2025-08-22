interface Point {
    x: number;
    y: number;
}

export interface PlayerState {
    id: string; // unique player ID
    position: Point; // head position
    direction: Point; // movement vector (normalized)
    radius: number; // scaled by score
    score: number;
    segments: Point[]; // positions of body segments
    isBoosting: boolean;
    alive: boolean;
}
