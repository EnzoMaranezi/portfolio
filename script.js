const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loadingScreen = document.getElementById("loadingScreen");
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
const canvas = document.getElementById("particleCanvas");
const typingText = document.getElementById("typingText");
const navbar = document.querySelector(".navbar");
const contactForm = document.getElementById("contactForm");

const typingItems = ["Python", "FastAPI", "Java", "Spring Boot", "SQL", "IA", "APIs REST"];
let typingIndex = 0;
let typingChar = 0;
let typingDeleting = false;

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

document.querySelectorAll(".reveal").forEach((element) => sectionObserver.observe(element));

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
    const current = [...activeSections.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("is-active", target === current);
    });
  },
  {
    threshold: [0.3, 0.45, 0.6],
  }
);

document.querySelectorAll("main section").forEach((section) => sectionSpy.observe(section));

const parallaxTargets = document.querySelectorAll("[data-parallax]");
const particleState = {
  particles: [],
  width: 0,
  height: 0,
  ctx: canvas?.getContext("2d"),
};

function resizeCanvas() {
  if (!canvas || !particleState.ctx) return;
  particleState.width = canvas.width = window.innerWidth * window.devicePixelRatio;
  particleState.height = canvas.height = window.innerHeight * window.devicePixelRatio;
  particleState.ctx.setTransform(1, 0, 0, 1, 0, 0);
  particleState.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const count = Math.min(70, Math.max(28, Math.floor(window.innerWidth / 20)));
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
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

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

function moveCursor(event) {
  if (!cursor || !cursorDot || prefersReducedMotion || window.innerWidth <= 720) return;
  
  // Seta no :root para ambos lerem do mesmo lugar
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
}

function applyCursorHoverState() {
  document.querySelectorAll("a, button, input, textarea").forEach((element) => {
    element.addEventListener("mouseenter", () => {
  if (!cursor || !cursorDot || prefersReducedMotion || window.innerWidth <= 720) return;
  cursor.classList.add("is-hovering");
  cursorDot.classList.add("is-hovering");
  document.documentElement.style.setProperty("--cursor-scale", "1.08"); // ← aqui
});

element.addEventListener("mouseleave", () => {
  if (!cursor || !cursorDot || prefersReducedMotion || window.innerWidth <= 720) return;
  cursor.classList.remove("is-hovering");
  cursorDot.classList.remove("is-hovering");
  document.documentElement.style.setProperty("--cursor-scale", "1"); // ← e aqui
});
  });
}

function setupParallax() {
  if (prefersReducedMotion) return;

  window.addEventListener("mousemove", (event) => {
    parallaxTargets.forEach((target) => {
      const factor = Number(target.getAttribute("data-parallax")) || 0.1;
      const x = (window.innerWidth / 2 - event.clientX) * factor * 0.03;
      const y = (window.innerHeight / 2 - event.clientY) * factor * 0.03;
      target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });
}

function setupNavbar() {
  const update = () => {
    navbar?.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}

function setupLoading() {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen?.classList.add("is-hidden");
    }, prefersReducedMotion ? 100 : 900);
  });
}

function setupContactForm() {
  if (!contactForm) return;
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = contactForm.querySelector("button[type='submit']");
    if (!(button instanceof HTMLButtonElement)) return;

    const originalText = button.textContent;
    button.textContent = "Mensagem enviada";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText ?? "Enviar mensagem";
      button.disabled = false;
      contactForm.reset();
    }, 1800);
  });
}

function setupWindowResize() {
  if (prefersReducedMotion) return;
  window.addEventListener("resize", resizeCanvas);
}

function setupCursorReset() {
  if (!cursor || !cursorDot || prefersReducedMotion || window.innerWidth <= 720) return;

  const reset = () => {
    cursor.classList.remove("is-hovering");
    cursorDot.classList.remove("is-hovering");
    document.documentElement.style.setProperty("--cursor-scale", "1");
  };

  window.addEventListener("blur", reset);
  document.addEventListener("mouseleave", reset);
}

function init() {
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
  } else {
    if (loadingScreen) loadingScreen.remove();
    if (cursor) cursor.remove();
    if (cursorDot) cursorDot.remove();
    if (canvas) canvas.remove();
  }
}

init();
