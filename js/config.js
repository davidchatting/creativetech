export const STROKE_COLOR = [0, 0, 0];
export const STROKE_WEIGHT = 2;

export const FLOCK_SIZE = 5;
export const BOID_SCALE = 3;
export const BOID_RADIUS = 8 * BOID_SCALE; // nose-to-center reach of the rendered triangle
export const MAX_SPEED = 3.6;
export const MAX_FORCE = 0.18;
export const FLEE_SPEED = 4;
export const FLEE_FORCE = 0.4;
export const WANDER_FORCE = 0.05;
export const PERCEPTION = {
  alignment: BOID_RADIUS * 2.5,
  cohesion: BOID_RADIUS * 10,
  separation: BOID_RADIUS * 2,
  fear: BOID_RADIUS * 5,
};

