import p5 from "https://cdn.jsdelivr.net/npm/p5@2.3.1/lib/p5.esm.min.js";

const STROKE_COLOR = [0, 0, 0];
const STROKE_WEIGHT = 2;

const FLOCK_SIZE = 5;
const BOID_SCALE = 3;
const BOID_RADIUS = 8 * BOID_SCALE;
const MAX_SPEED = 3.6;
const MAX_FORCE = 0.18;
const FLEE_SPEED = 4;
const FLEE_FORCE = 0.4;
const WANDER_FORCE = 0.05;
const PERCEPTION = {
  alignment: BOID_RADIUS * 2.5,
  cohesion: BOID_RADIUS * 10,
  separation: BOID_RADIUS * 2,
  fear: BOID_RADIUS * 5,
};

const pointer = { x: 0, y: 0, active: false };

const setPointerActive = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
};

const setPointerInactive = () => {
  pointer.active = false;
};

window.addEventListener("pointermove", setPointerActive);
window.addEventListener("pointerdown", setPointerActive);
window.addEventListener("pointerup", setPointerInactive);
window.addEventListener("pointercancel", setPointerInactive);
window.addEventListener("pointerleave", setPointerInactive);

class Boid {
  constructor(p, x, y) {
    this.p = p;
    this.position = p.createVector(x, y);
    const angle = p.random(p.TWO_PI);
    this.velocity = p.createVector(Math.cos(angle), Math.sin(angle));
    this.velocity.mult(p.random(1.8, 3.6));
    this.acceleration = p.createVector(0, 0);
    this.fleeing = false;
  }

  edges() {
    const p = this.p;
    if (this.position.x > p.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = p.width;
    if (this.position.y > p.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = p.height;
  }

  align(boids) {
    const p = this.p;
    const steering = p.createVector();
    let total = 0;
    for (const other of boids) {
      const d = p.dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < PERCEPTION.alignment) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(MAX_SPEED);
      steering.sub(this.velocity);
      steering.limit(MAX_FORCE);
    }
    return steering;
  }

  cohesion(boids) {
    const p = this.p;
    const steering = p.createVector();
    let total = 0;
    for (const other of boids) {
      const d = p.dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < PERCEPTION.cohesion) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(MAX_SPEED);
      steering.sub(this.velocity);
      steering.limit(MAX_FORCE);
    }
    return steering;
  }

  separation(boids) {
    const p = this.p;
    const steering = p.createVector();
    let total = 0;
    for (const other of boids) {
      const d = p.dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < PERCEPTION.separation) {
        const diff = this.position.copy().sub(other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(MAX_SPEED);
      steering.sub(this.velocity);
      steering.limit(MAX_FORCE);
    }
    return steering;
  }

  flee(px, py) {
    const p = this.p;
    const d = p.dist(this.position.x, this.position.y, px, py);
    const steering = p.createVector(0, 0);
    this.fleeing = d < PERCEPTION.fear;
    if (this.fleeing && d > 0) {
      const away = this.position.copy().sub(p.createVector(px, py));
      away.setMag(FLEE_SPEED);
      away.sub(this.velocity);
      away.limit(FLEE_FORCE);
      steering.add(away);
    }
    return steering;
  }

  wander() {
    const p = this.p;
    const jitter = p.createVector(p.random(-1, 1), p.random(-1, 1));
    jitter.mult(WANDER_FORCE);
    return jitter;
  }

  flock(boids, pointer) {
    const alignment = this.align(boids);
    const cohesion = this.cohesion(boids);
    const separation = this.separation(boids);

    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);

    if (pointer.active) {
      this.acceleration.add(this.flee(pointer.x, pointer.y));
    } else {
      this.fleeing = false;
    }

    this.acceleration.add(this.wander());
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.fleeing ? FLEE_SPEED : MAX_SPEED);
    this.acceleration.mult(0);
  }

  show() {
    const p = this.p;
    p.push();
    p.translate(this.position.x, this.position.y);
    p.rotate(this.velocity.heading());
    p.noFill();
    p.stroke(...STROKE_COLOR);
    p.strokeWeight(STROKE_WEIGHT);
    p.beginShape();
    p.vertex(8 * BOID_SCALE, 0);
    p.vertex(-6 * BOID_SCALE, -4 * BOID_SCALE);
    p.vertex(-6 * BOID_SCALE, 4 * BOID_SCALE);
    p.endShape(p.CLOSE);
    p.pop();
  }
}

class Flock {
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

function sketch(p) {
  let flock;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight).parent("p5-overlay");
    flock = new Flock(p, FLOCK_SIZE);
  };

  p.draw = () => {
    p.clear();
    flock.run(pointer);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}

new p5(sketch);
