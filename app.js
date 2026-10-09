// Mobile menu
const menuToggle = document.getElementById("menu-toggle");
const dropdown = document.getElementById("dropdown");

function setMenu(open) {
  dropdown.classList.toggle("show", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", () => setMenu(!dropdown.classList.contains("show")));

// hide dropdown when clicking a link
dropdown.querySelectorAll("button").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// click outside the menu closes it
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target) && !menuToggle.contains(e.target)) {
    setMenu(false);
  }
});

// nav buttons scroll to a section
function toScreen(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  } else {
    console.error("Element with ID '" + id + "' not found.");
  }
}

// copyright
document.getElementById("date").innerHTML = `© ${new Date().getFullYear()} Shovit Nepal. All rights reserved.`;

document.addEventListener("DOMContentLoaded", () => {
  // Typing effect — types and deletes each phrase in turn
  const phrases = [
    "I'm a Database Administrator.",
    "I build distributed systems.",
    "I keep data pipelines flowing.",
  ];
  const typingElement = document.getElementById("typing-effect");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    const phrase = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    typingElement.textContent = phrase.slice(0, charIndex);

    let delay = deleting ? 30 : 60;
    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(typeLoop, delay);
  }

  if (typingElement) {
    if (reduceMotion) {
      typingElement.textContent = phrases[0];
    } else {
      typeLoop();
    }
  }

  // Reveal sections as they scroll into view
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }
});

// Certificate viewer (shows a watermarked image, never the downloadable PDF)
function openCertificate(imageSrc, title) {
  const viewer = document.getElementById("certificate-viewer");
  const image = document.getElementById("certificate-image");
  const fileName = document.getElementById("certificate-file-name");
  if (image) {
    image.src = imageSrc;
    image.alt = title;
  }
  if (fileName) fileName.innerText = title;
  if (viewer) {
    viewer.classList.remove("hidden");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeCertificate() {
  const viewer = document.getElementById("certificate-viewer");
  const image = document.getElementById("certificate-image");
  if (image) image.removeAttribute("src");
  if (viewer) {
    viewer.classList.add("hidden");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

// Certificate protection: block right-click / drag / save shortcuts and
// blur certificates when a screenshot key is pressed or the window loses focus.
const isViewerOpen = () => !document.getElementById("certificate-viewer").classList.contains("hidden");
let shieldTimer;

function shield(ms = 2000) {
  document.body.classList.add("shielded");
  clearTimeout(shieldTimer);
  if (ms) shieldTimer = setTimeout(() => document.body.classList.remove("shielded"), ms);
}

function unshield() {
  clearTimeout(shieldTimer);
  document.body.classList.remove("shielded");
}

["contextmenu", "dragstart", "copy"].forEach((type) => {
  document.addEventListener(type, (e) => {
    if (e.target.closest && e.target.closest(".protected")) e.preventDefault();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCertificate();

  const key = e.key.toLowerCase();
  const mod = e.metaKey || e.ctrlKey;

  // Save / print while a certificate is open
  if (mod && (key === "s" || key === "p") && isViewerOpen()) {
    e.preventDefault();
    shield();
  }

  // Windows Print Screen, Win+Shift+S, macOS Cmd+Shift+3/4/5
  if (key === "printscreen" || (e.shiftKey && (e.metaKey || e.ctrlKey))) {
    shield(3000);
    if (key === "printscreen" && navigator.clipboard) navigator.clipboard.writeText("").catch(() => {});
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "printscreen") {
    shield(3000);
    if (navigator.clipboard) navigator.clipboard.writeText("").catch(() => {});
  }
});

// Snipping tools and app switching take focus away from the page
window.addEventListener("blur", () => { if (isViewerOpen()) shield(0); });
window.addEventListener("focus", unshield);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isViewerOpen()) shield(0);
  else if (!document.hidden) unshield();
});

window.addEventListener("beforeprint", () => shield(0));
window.addEventListener("afterprint", unshield);
