// ---------- Footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Mobile nav ----------
const navToggle = document.getElementById("nav-toggle");
navToggle?.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
  const expanded = document.body.classList.contains("nav-open");
  navToggle.setAttribute("aria-expanded", String(expanded));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => document.body.classList.remove("nav-open"));
});

// ---------- Back to top ----------
const backToTop = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  backToTop?.classList.toggle("visible", window.scrollY > 600);
});

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ---------- Showreel ----------
const stage = document.getElementById("reel-stage");
const panels = stage ? Array.from(stage.querySelectorAll(".reel-panel")) : [];
const progressWrap = document.getElementById("reel-progress");
const urlBar = document.getElementById("reel-url");
const captionTitle = document.getElementById("reel-caption-title");
const captionSub = document.getElementById("reel-caption-sub");
const prevBtn = document.getElementById("reel-prev");
const nextBtn = document.getElementById("reel-next");
const reelShell = document.querySelector(".showreel-shell");

const SLIDE_MS = 3400;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = 0;
let segStart = null;
let rafId = null;
let paused = prefersReducedMotion;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

if (progressWrap && panels.length) {
  panels.forEach(() => {
    const seg = document.createElement("div");
    seg.className = "seg";
    const bar = document.createElement("i");
    seg.appendChild(bar);
    progressWrap.appendChild(seg);
  });
}
const segs = progressWrap ? Array.from(progressWrap.querySelectorAll(".seg")) : [];
const segBars = segs.map((s) => s.querySelector("i"));

function renderPanel(index, resetOnly) {
  panels.forEach((p, i) => p.classList.toggle("active", i === index));

  const active = panels[index];
  if (active) {
    const title = active.dataset.title || "";
    const caption = active.dataset.caption || "";
    if (captionTitle) captionTitle.textContent = title;
    if (captionSub) captionSub.textContent = caption;
    if (urlBar) urlBar.textContent = slugify(title) || "project";
  }

  segs.forEach((seg, i) => {
    seg.classList.toggle("done", i < index);
    if (segBars[i]) segBars[i].style.width = i < index ? "100%" : i === index ? "0%" : "0%";
  });

  if (!resetOnly) {
    segStart = performance.now();
  }
}

function goTo(index, userTriggered) {
  current = (index + panels.length) % panels.length;
  renderPanel(current);
  if (userTriggered) {
    segStart = performance.now();
  }
}

function tick(now) {
  if (paused || !panels.length) {
    rafId = requestAnimationFrame(tick);
    return;
  }
  if (segStart === null) segStart = now;
  const elapsed = now - segStart;
  const activeBar = segBars[current];
  if (activeBar) {
    const pct = Math.min(100, (elapsed / SLIDE_MS) * 100);
    activeBar.style.width = pct + "%";
  }
  if (elapsed >= SLIDE_MS) {
    goTo(current + 1);
  }
  rafId = requestAnimationFrame(tick);
}

if (panels.length) {
  renderPanel(0);
  rafId = requestAnimationFrame(tick);
}

prevBtn?.addEventListener("click", () => goTo(current - 1, true));
nextBtn?.addEventListener("click", () => goTo(current + 1, true));

reelShell?.addEventListener("mouseenter", () => {
  paused = true;
});
reelShell?.addEventListener("mouseleave", () => {
  if (!prefersReducedMotion) {
    paused = false;
    segStart = performance.now();
  }
});
