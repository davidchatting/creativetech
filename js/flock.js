import Boid from "./boid.js";

export default class Flock {
  constructor(p, size) {
    this.boids = [];
    for (let i = 0; i < size; i++) {
      this.boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
    }
  }

  run(pointer) {
    for (const boid of this.boids) {
      boid.edges();
      boid.flock(this.boids, pointer);
      boid.update();
      boid.show();
    }
  }
}
