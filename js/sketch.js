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

let flock;

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    const angle = random(TWO_PI);
    this.velocity = createVector(Math.cos(angle), Math.sin(angle));
    this.velocity.mult(random(1.8, 3.6));
    this.acceleration = createVector(0, 0);
    this.fleeing = false;
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  align(boids) {
    const steering = createVector();
    let total = 0;
    for (const other of boids) {
      const d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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
    const steering = createVector();
    let total = 0;
    for (const other of boids) {
      const d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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
    const steering = createVector();
    let total = 0;
    for (const other of boids) {
      const d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
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
    const d = dist(this.position.x, this.position.y, px, py);
    const steering = createVector(0, 0);
    this.fleeing = d < PERCEPTION.fear;
    if (this.fleeing && d > 0) {
      const away = this.position.copy().sub(createVector(px, py));
      away.setMag(FLEE_SPEED);
      away.sub(this.velocity);
      away.limit(FLEE_FORCE);
      steering.add(away);
    }
    return steering;
  }

  wander() {
    const jitter = createVector(random(-1, 1), random(-1, 1));
    jitter.mult(WANDER_FORCE);
    return jitter;
  }

  flock(boids, pointerActive) {
    const alignment = this.align(boids);
    const cohesion = this.cohesion(boids);
    const separation = this.separation(boids);

    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);

    if (pointerActive) {
      this.acceleration.add(this.flee(mouseX, mouseY));
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
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    noFill();
    stroke(...STROKE_COLOR);
    strokeWeight(STROKE_WEIGHT);
    beginShape();
    vertex(8 * BOID_SCALE, 0);
    vertex(-6 * BOID_SCALE, -4 * BOID_SCALE);
    vertex(-6 * BOID_SCALE, 4 * BOID_SCALE);
    endShape(CLOSE);
    pop();
  }
}

class Flock {
  constructor(size) {
    this.boids = [];
    for (let i = 0; i < size; i++) {
      this.boids.push(new Boid(random(width), random(height)));
    }
  }

  run(pointerActive) {
    for (const boid of this.boids) {
      boid.edges();
      boid.flock(this.boids, pointerActive);
      boid.update();
      boid.show();
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent("p5-overlay");
  flock = new Flock(FLOCK_SIZE);
}

function draw() {
  clear();
  const pointerActive = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  flock.run(pointerActive);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
