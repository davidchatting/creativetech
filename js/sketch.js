import { FLOCK_SIZE } from "./config.js";
import Flock from "./flock.js";
import pointer from "./pointer.js";

export default function sketch(p) {
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
