const prefersReducedMotion = false;

const loadingScreen = document.getElementById("loadingScreen");
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
const canvas = document.getElementById("particleCanvas");
const typingText = document.getElementById("typingText");
const navbar = document.querySelector(".navbar");
const contactForm = document.getElementById("contactForm");

const typingItems = [
  "Python",
  "FastAPI",
  "Java",
  "Spring Boot",
  "SQL",
  "IA",
  "APIs REST",
];

let typingIndex = 0;
let typingChar = 0;
let typingDeleting = false;

/* ───────────────────────────────────────────── */
/* CURSOR */
/* ───────────────────────────────────────────── */

let mouseX = 0;
let mouseY = 0;

let cursorX = 0;
let cursorY = 0;

function moveCursor(event) {
  if (
    !cursor ||
    !cursorDot ||
    prefersReducedMotion ||
    window.innerWidth <= 720
  ) {
    return;
  }

  mouseX = event.clientX;
  mouseY = event.clientY;

  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
}

function animateCursor() {
  if (
    !cursor ||
    !cursorDot ||
    prefersReducedMotion ||
    window.innerWidth <= 720
  ) {
    return;
  }

  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;

  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;

  requestAnimationFrame(animateCursor);
}

function applyCursorHoverState() {
  const elements = document.querySelectorAll(
    "a, button, input, textarea, .button"
  );

  elements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      if (!cursor || !cursorDot) return;

      cursor.classList.add("cursor-hover");
    });

    element.addEventListener("mouseleave", () => {
      if (!cursor || !cursorDot) return;

      cursor.classList.remove("cursor-hover");
    });
  });
}

function setupCursorReset() {
  if (!cursor || !cursorDot) return;

  const reset = () => {
    cursor.classList.remove("cursor-hover");
  };

  window.addEventListener("blur", reset);
  document.addEventListener("mouseleave", reset);
}

/* ───────────────────────────────────────────── */
/* SECTION OBSERVER */
/* ───────────────────────────────────────────── */

const activeSections = new Map();

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.closest(".section")?.classList.add("is-highlight");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  }
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => sectionObserver.observe(element));

const sectionSpy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        activeSections.delete(entry.target.id);
      }
    });

    const navLinks = document.querySelectorAll(".nav-links a");

    const current = [...activeSections.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.replace("#", "");

      link.classList.toggle("is-active", target === current);
    });
  },
  {
    threshold: [0.3, 0.45, 0.6],
  }
);

document
  .querySelectorAll("main section")
  .forEach((section) => sectionSpy.observe(section));

/* ───────────────────────────────────────────── */
/* PARTICLES */
/* ───────────────────────────────────────────── */

const parallaxTargets = document.querySelectorAll("[data-parallax]");

const particleState = {
  particles: [],
  width: 0,
  height: 0,
  ctx: canvas?.getContext("2d"),
};

function resizeCanvas() {
  if (!canvas || !particleState.ctx) return;

  particleState.width =
    canvas.width = window.innerWidth * window.devicePixelRatio;

  particleState.height =
    canvas.height = window.innerHeight * window.devicePixelRatio;

  particleState.ctx.setTransform(1, 0, 0, 1, 0, 0);

  particleState.ctx.scale(
    window.devicePixelRatio,
    window.devicePixelRatio
  );

  const count = Math.min(
    70,
    Math.max(28, Math.floor(window.innerWidth / 20))
  );

  particleState.particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: 0.8 + Math.random() * 1.8,
    alpha: 0.22 + Math.random() * 0.55,
    hue: Math.random() > 0.5 ? 190 : 255,
  }));
}

function drawParticles() {
  if (!canvas || !particleState.ctx || prefersReducedMotion) return;

  const ctx = particleState.ctx;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particleState.particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    ctx.beginPath();

    ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${particle.alpha})`;

    ctx.shadowColor = `hsla(${particle.hue}, 100%, 70%, 0.35)`;

    ctx.shadowBlur = 10;

    ctx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

/* ───────────────────────────────────────────── */
/* TYPING */
/* ───────────────────────────────────────────── */

function animateTyping() {
  if (!typingText || prefersReducedMotion) return;

  const current = typingItems[typingIndex];

  if (!typingDeleting) {
    typingChar += 1;

    typingText.textContent = current.slice(0, typingChar);

    if (typingChar >= current.length) {
      typingDeleting = true;

      setTimeout(animateTyping, 1200);

      return;
    }
  } else {
    typingChar -= 1;

    typingText.textContent = current.slice(0, typingChar);

    if (typingChar <= 0) {
      typingDeleting = false;

      typingIndex = (typingIndex + 1) % typingItems.length;
    }
  }

  setTimeout(animateTyping, typingDeleting ? 45 : 85);
}

/* ───────────────────────────────────────────── */
/* PARALLAX */
/* ───────────────────────────────────────────── */

function setupParallax() {
  if (prefersReducedMotion) return;

  window.addEventListener("mousemove", (event) => {
    parallaxTargets.forEach((target) => {
      const factor =
        Number(target.getAttribute("data-parallax")) || 0.1;

      const x =
        (window.innerWidth / 2 - event.clientX) *
        factor *
        0.03;

      const y =
        (window.innerHeight / 2 - event.clientY) *
        factor *
        0.03;

      target.style.setProperty("--parallax-x", `${x}px`);
      target.style.setProperty("--parallax-y", `${y}px`);
    });
  });
}

/* ───────────────────────────────────────────── */
/* NAVBAR */
/* ───────────────────────────────────────────── */

function setupNavbar() {
  const update = () => {
    navbar?.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  update();

  window.addEventListener("scroll", update, {
    passive: true,
  });
}

/* ───────────────────────────────────────────── */
/* SMOOTH SCROLL */
/* ───────────────────────────────────────────── */

function setupSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });
}

/* ───────────────────────────────────────────── */
/* LOADING */
/* ───────────────────────────────────────────── */

function setupLoading() {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen?.classList.add("is-hidden");
    }, prefersReducedMotion ? 100 : 900);
  });
}

/* ───────────────────────────────────────────── */
/* CONTACT */
/* ───────────────────────────────────────────── */

function setupContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = contactForm.querySelector("button[type='submit']");
    if (!(button instanceof HTMLButtonElement)) return;

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Enviando...";

    try {
      await emailjs.sendForm(
        "service_14gpi7s",
        "template_0zomefp",
        contactForm
      );

      button.textContent = "Mensagem enviada!";
      contactForm.reset();

    } catch (error) {
      console.error(error);
      button.textContent = "Erro ao enviar";
    }

    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText ?? "Enviar mensagem";
    }, 2500);
  });
}



/* ───────────────────────────────────────────── */
/* RESIZE */
/* ───────────────────────────────────────────── */

function setupWindowResize() {
  if (prefersReducedMotion) return;

  window.addEventListener("resize", resizeCanvas);
}

/* ───────────────────────────────────────────── */
/* INIT */
/* ───────────────────────────────────────────── */

function init() {
  emailjs.init("sWKsMdkQjzuIMABub");

  setupLoading();

  setupNavbar();

  setupSmoothScroll();

  setupContactForm();

  setupWindowResize();

  applyCursorHoverState();

  setupCursorReset();

  setupParallax();

  if (!prefersReducedMotion) {
    resizeCanvas();

    drawParticles();

    animateTyping();

    window.addEventListener("mousemove", moveCursor);

    animateCursor();
  } else {
    if (loadingScreen) loadingScreen.remove();

    if (cursor) cursor.remove();

    if (cursorDot) cursorDot.remove();

    if (canvas) canvas.remove();
  }
}

init();