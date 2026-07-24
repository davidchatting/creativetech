const pointer = { x: 0, y: 0, active: false };

const setActive = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
};

const setInactive = () => {
  pointer.active = false;
};

window.addEventListener("pointermove", setActive);
window.addEventListener("pointerdown", setActive);
window.addEventListener("pointerup", setInactive);
window.addEventListener("pointercancel", setInactive);
window.addEventListener("pointerleave", setInactive);

export default pointer;
