// ---------- 1. Smooth scrolling ----------
const lenis = new Lenis({ duration: 1.2 });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ---------- 2. Make "#section" links glide instead of jump ----------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();          // stop the browser's instant jump
    lenis.scrollTo(target);      // let Lenis glide there instead
  });
});

// ---------- 3. Navbar background + progress bar react to scrolling ----------
const navbar = document.querySelector("#navbar");
const progressBar = document.querySelector("#progress-bar");

function onScroll() {
  const progress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
  navbar.classList.toggle("scrolled", lenis.scroll > 50);
  progressBar.style.transform = `scaleX(${progress})`;
}
lenis.on("scroll", onScroll);
onScroll();

// ---------- 4. Typing effect in the hero ----------
const phrases = [
  "secure web apps.",
  "firewalls that block attacks.",
  "threat detection systems.",
  "tools in Python & C++.",
];
const typed = document.querySelector("#typed");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = phrases[phraseIndex];

  // add or remove one letter
  charIndex += deleting ? -1 : 1;
  typed.textContent = current.slice(0, charIndex);

  let delay = deleting ? 40 : 90;          // deleting is faster than typing

  if (!deleting && charIndex === current.length) {
    delay = 1800;                           // pause on the full phrase
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;   // next phrase, loop back at the end
    delay = 400;
  }

  setTimeout(typeLoop, delay);
}

if (reduceMotion) {
  typed.textContent = phrases[0];
} else {
  typeLoop();
}