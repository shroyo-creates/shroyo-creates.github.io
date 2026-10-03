// 1. Create the smooth scroller
const lenis = new Lenis({
  duration: 1.2,   // how long the "glide" lasts (try 0.8 or 2 and feel the difference)
});

// 2. Lenis needs to update on every animation frame (about 60 times per second)
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

