/* =============================================
   LOADER SCREEN
   ============================================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
  }, 1200);
});

/* =============================================
   NAVBAR SCROLL
   ============================================= */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* =============================================
   HORIZONTAL SCROLL SETUP (Desktop only)
   ============================================= */
const scrollContainer = document.querySelector('body');
let isScrolling = false;

function isDesktop() {
  return window.innerWidth > 768 && window.matchMedia('(orientation: landscape)').matches;
}

let wheelAccumulator = 0;
let wheelRafId = null;

window.addEventListener('wheel', (e) => {
  if (!isDesktop()) return; // Skip horizontal scroll on mobile/portrait

  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

  e.preventDefault();
  wheelAccumulator += e.deltaY;

  if (wheelRafId !== null) return;

  wheelRafId = requestAnimationFrame(() => {
    window.scrollBy({
      left: wheelAccumulator,
      behavior: 'auto'
    });
    wheelAccumulator = 0;
    wheelRafId = null;
  });
}, { passive: false });

/* =============================================
   INTERACTIVE CASE STUDY MODE
   ============================================= */
const caseStudies = {
  "deiji-marketplace": {
    title: "deiji-marketplace",
    summary:
      "Marketplace web app yang fokus ke experience belanja cepat dengan flow produk, katalog, dan checkout yang sederhana.",
    problem:
      "Perlu membangun fondasi e-commerce yang bersih agar mudah dikembangkan, sambil menjaga UI tetap ringan untuk user baru.",
    solution:
      "Menyusun struktur halaman dan komponen UI modular, memprioritaskan alur utama browsing produk hingga action pembelian.",
    stack: ["HTML", "CSS", "E-Commerce"],
    highlights: [
      "Struktur halaman modular agar mudah scale",
      "Visual hierarchy jelas untuk conversion flow",
      "Interaksi ringan agar performa tetap baik",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/deiji-marketplace",
  },
  kyros: {
    title: "kyros",
    summary:
      "Project web berbasis PHP yang dibangun untuk kebutuhan pembelajaran sekaligus melatih praktik arsitektur backend dasar.",
    problem:
      "Membutuhkan project yang tidak hanya selesai secara fitur, tapi juga tetap rapih untuk proses belajar dan iterasi.",
    solution:
      "Menerapkan pola struktur route-view-data sederhana yang mudah dipahami, lalu mengoptimalkan alur CRUD inti.",
    stack: ["PHP", "Web", "School Project"],
    highlights: [
      "CRUD flow end-to-end",
      "Struktur folder mudah dipahami",
      "Baseline yang siap dikembangkan",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/kyros",
  },
  figureiie: {
    title: "figureiie",
    summary:
      "Aplikasi Laravel Blade untuk menunjukkan kapabilitas full-stack web dari sisi rendering server hingga tampilan UI.",
    problem:
      "Perlu menyeimbangkan kecepatan delivery dan maintainability pada aplikasi berbasis template server-rendered.",
    solution:
      "Memanfaatkan Blade component untuk reuse tampilan, menjaga konsistensi antar halaman, dan mengurangi duplikasi.",
    stack: ["Blade", "Laravel", "PHP"],
    highlights: [
      "Komponen Blade reusable",
      "Konsistensi desain antarmuka",
      "Alur pengembangan lebih cepat",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/figureiie",
  },
  "pendaftaran-siswa-smktag": {
    title: "pendaftaran-siswa-smktag",
    summary:
      "Sistem pendaftaran siswa berbasis Flutter untuk mempermudah proses input dan tracking data enrollment.",
    problem:
      "Alur pendaftaran manual rentan lambat dan sulit dipantau ketika jumlah pendaftar meningkat.",
    solution:
      "Merancang form, validasi, dan alur data yang terstruktur supaya proses pendaftaran lebih cepat dan minim kesalahan.",
    stack: ["Dart", "Flutter", "Education"],
    highlights: [
      "Form pendaftaran terstruktur",
      "Alur data lebih konsisten",
      "UI ramah operator sekolah",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/pendaftaran-siswa-smktag",
  },
  yakusoku: {
    title: "yakusoku",
    summary:
      "Eksperimen JavaScript untuk mengeksplor pola interaksi modern dan pengalaman pengguna yang lebih hidup.",
    problem:
      "Butuh playground untuk mencoba pattern interaksi tanpa overhead framework yang berat.",
    solution:
      "Membangun interaksi langsung dengan vanilla JavaScript dan fokus pada transisi yang responsif.",
    stack: ["JavaScript", "Web"],
    highlights: [
      "Interaksi front-end responsif",
      "Animasi ringan dan halus",
      "Eksperimen pattern UI modern",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/yakusoku",
  },
  artha: {
    title: "artha",
    summary:
      "Aplikasi Flutter yang dipakai untuk kebutuhan nyata dan berhasil menarik minat komunitas.",
    problem:
      "Membangun app yang tetap stabil untuk penggunaan real-world sambil menjaga kecepatan iterasi fitur.",
    solution:
      "Fokus pada pengalaman pengguna inti, optimasi flow penting, dan maintainability agar update bisa berjalan konsisten.",
    stack: ["Dart", "Flutter", "Mobile"],
    highlights: [
      "Dipakai untuk use case nyata",
      "Iterasi fitur berkelanjutan",
      "Mendapat respons komunitas",
    ],
    repoUrl: "https://github.com/wahyuatmaja3/artha",
  },
};

const caseStudyModal = document.getElementById("caseStudyModal");
const caseStudyClose = document.getElementById("caseStudyClose");
const caseStudyTitle = document.getElementById("caseStudyTitle");
const caseStudySummary = document.getElementById("caseStudySummary");
const caseStudyProblem = document.getElementById("caseStudyProblem");
const caseStudySolution = document.getElementById("caseStudySolution");
const caseStudyStack = document.getElementById("caseStudyStack");
const caseStudyHighlights = document.getElementById("caseStudyHighlights");
const caseStudyRepo = document.getElementById("caseStudyRepo");
const caseStudyDemo = document.getElementById("caseStudyDemo");

let activeCaseStudyTrigger = null;

function closeCaseStudyModal() {
  if (!caseStudyModal || !caseStudyModal.classList.contains("is-open")) return;
  caseStudyModal.classList.remove("is-open");
  caseStudyModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("case-study-open");
  if (activeCaseStudyTrigger) {
    activeCaseStudyTrigger.focus();
    activeCaseStudyTrigger = null;
  }
}

function openCaseStudyModal(triggerEl, data) {
  if (!caseStudyModal || !data) return;

  caseStudyTitle.textContent = data.title || "Case Study";
  caseStudySummary.textContent = data.summary || "";
  caseStudyProblem.textContent = data.problem || "";
  caseStudySolution.textContent = data.solution || "";

  caseStudyStack.innerHTML = "";
  (data.stack || []).forEach((item) => {
    const chip = document.createElement("span");
    chip.textContent = item;
    caseStudyStack.appendChild(chip);
  });

  caseStudyHighlights.innerHTML = "";
  (data.highlights || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    caseStudyHighlights.appendChild(li);
  });

  caseStudyRepo.href = data.repoUrl || triggerEl.href;

  if (data.demoUrl) {
    caseStudyDemo.href = data.demoUrl;
    caseStudyDemo.style.display = "inline-flex";
  } else {
    caseStudyDemo.style.display = "none";
  }

  activeCaseStudyTrigger = triggerEl;
  caseStudyModal.classList.add("is-open");
  caseStudyModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("case-study-open");
  caseStudyClose?.focus();
}

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    const projectId = card.dataset.projectId;
    const data = caseStudies[projectId];
    if (!data) return;
    event.preventDefault();
    openCaseStudyModal(card, data);
  });
});

caseStudyClose?.addEventListener("click", closeCaseStudyModal);

caseStudyModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-case-study]")) {
    closeCaseStudyModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCaseStudyModal();
  }
});

/* =============================================
   INTERSECTION OBSERVER — Reveal & Skill Bars
   ============================================= */
const revealEls = document.querySelectorAll(
  "#about .section-header, .about-grid, #skills .section-header, .skill-category, " +
    "#projects .section-header, .project-card, #contact .section-header, .contact-card, " +
    ".stat-item, .card-inner",
);

revealEls.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 },
);

revealEls.forEach((el) => revealObserver.observe(el));

// Animate skill bars
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".pill-fill").forEach((fill) => {
          const target = fill.style.width || "0";
          fill.style.width = "0";
          requestAnimationFrame(() => {
            setTimeout(() => {
              fill.style.width = target;
            }, 100);
          });
        });
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

document
  .querySelectorAll(".skill-category")
  .forEach((cat) => barObserver.observe(cat));

/* =============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================= */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => (a.style.color = ""));
        const activeLink = document.querySelector(
          `.nav-links a[href="#${entry.target.id}"]`,
        );
        if (activeLink) activeLink.style.color = "var(--text)";
      }
    });
  },
  { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" },
);

sections.forEach((s) => sectionObserver.observe(s));

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    event.preventDefault();
    const navbarHeight = navbar?.offsetHeight || 0;

    if (isDesktop()) {
      // Horizontal scroll for desktop with custom smooth animation
      const targetLeft = targetEl.offsetLeft - navbarHeight - 12;
      const startLeft = window.scrollX;
      const distance = Math.max(targetLeft, 0) - startLeft;
      const duration = 800; // 800ms animation
      let startTime = null;

      function animateScroll(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out-cubic)
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo({
          left: startLeft + (distance * easeProgress),
          behavior: 'auto'
        });

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }

      requestAnimationFrame(animateScroll);
    } else {
      // Vertical scroll for mobile/portrait with custom smooth animation
      const targetTop = targetEl.offsetTop - navbarHeight - 12;
      const startTop = window.scrollY;
      const distance = Math.max(targetTop, 0) - startTop;
      const duration = 800;
      let startTime = null;

      function animateScroll(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out-cubic)
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo({
          top: startTop + (distance * easeProgress),
          behavior: 'auto'
        });

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }

      requestAnimationFrame(animateScroll);
    }
  });
});

/* =============================================
   HANDLE ORIENTATION/RESIZE CHANGES
   ============================================= */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Reset scroll position when switching between modes
    window.scrollTo({ top: 0, left: 0 });
  }, 250);
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, 300);
});

/* =============================================
   THEME SWITCHER — built programmatically
   ============================================= */
(function () {
  const THEMES = [
    { id: 'default',      emoji: '\u26A1', label: 'Default'       },
    { id: 'neobrutalism', emoji: '\u2B1B', label: 'Neobrutalism'  },
    { id: 'y2k',          emoji: '\uD83D\uDCBF', label: 'Y2K Retro'     },
    { id: 'acid',         emoji: '\uD83E\uDDEA', label: 'Acid/Cyberpunk' },
    { id: 'maximalism',   emoji: '\uD83D\uDCA5', label: 'Maximalism'     },
    { id: 'bento',        emoji: '\uD83C\uDF71', label: 'Vibrant Bento'  },
  ];

  const savedTheme = localStorage.getItem('portoh-theme') || 'default';
  document.body.setAttribute('data-theme', savedTheme);

  // Build the widget
  const switcher = document.createElement('div');
  switcher.id = 'theme-switcher';
  // Inline styles so nothing can override or hide it
  switcher.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'left:24px',
    'display:flex',
    'gap:6px',
    'align-items:center',
    'background:rgba(255,255,255,0.96)',
    'padding:8px',
    'border-radius:99px',
    'border:1px solid rgba(0,0,0,0.14)',
    'box-shadow:0 4px 20px rgba(0,0,0,0.18)',
    'z-index:2147483647',
    'backdrop-filter:blur(16px)',
    '-webkit-backdrop-filter:blur(16px)',
  ].join(';');

  THEMES.forEach(({ id, emoji, label }) => {
    const btn = document.createElement('button');
    btn.setAttribute('data-theme-id', id);
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    btn.textContent = emoji;
    btn.style.cssText = [
      'background:transparent',
      'border:none',
      'font-size:20px',
      'width:36px',
      'height:36px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'border-radius:50%',
      'cursor:pointer',
      'transition:all 0.15s ease',
      'opacity:0.55',
      'flex-shrink:0',
      'line-height:1',
    ].join(';');

    if (id === savedTheme) {
      btn.style.opacity = '1';
      btn.style.background = 'rgba(0,0,0,0.1)';
    }

    btn.addEventListener('mouseenter', () => {
      if (btn.getAttribute('data-theme-id') !== document.body.getAttribute('data-theme')) {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.15)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (btn.getAttribute('data-theme-id') !== document.body.getAttribute('data-theme')) {
        btn.style.opacity = '0.55';
        btn.style.transform = 'scale(1)';
      }
    });

    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-id');
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('portoh-theme', theme);

      // Update all buttons
      switcher.querySelectorAll('button').forEach(b => {
        b.style.opacity = '0.55';
        b.style.background = 'transparent';
        b.style.transform = 'scale(1)';
      });
      btn.style.opacity = '1';
      btn.style.background = 'rgba(0,0,0,0.1)';
    });

    switcher.appendChild(btn);
  });

  document.body.appendChild(switcher);
}());

/* =============================================
   THEME DECORATIONS — fill whitespace per theme
   ============================================= */
(function () {
  const Y2K_IMAGES = [
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Y2K_illustration.png/500px-Y2K_illustration.png",
    "https://upload.wikimedia.org/wikipedia/commons/e/e2/Animated_y2k_nightclub_floor.gif",
    "https://upload.wikimedia.org/wikipedia/commons/7/77/Y2K_Logo.gif",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Y2K_Forever_%283891157537%29.jpg/500px-Y2K_Forever_%283891157537%29.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Y2K_server_%282885614250%29.jpg/500px-Y2K_server_%282885614250%29.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Y2k_Electronics_%283437121387%29.jpg/500px-Y2k_Electronics_%283437121387%29.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/The_y2k_decade..._%28449369045%29.jpg/500px-The_y2k_decade..._%28449369045%29.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Y2K_%2819479517290%29.jpg/500px-Y2K_%2819479517290%29.jpg",
  ];

  const DOODLES = [
    '<svg viewBox="0 0 100 100"><path d="M50 8v84M8 50h84" fill="none" stroke="#000" stroke-width="7"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M50 4l11 32 34 4-26 22 8 34-27-19-27 19 8-34-26-22 34-4z" fill="#ffeb3b" stroke="#000" stroke-width="4" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="#000" stroke-width="7"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M55 6L24 56h18l-6 38 38-52H54z" fill="#448aff" stroke="#000" stroke-width="4" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="#000" stroke-width="6"/><circle cx="36" cy="42" r="5" fill="#000"/><circle cx="64" cy="42" r="5" fill="#000"/><path d="M32 64c10 12 26 12 36 0" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M6 60c14-30 20 30 34 0s20 30 34 0 20 30 20-20" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M10 50h62M60 26l22 24-22 24" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M50 50m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0m6 6a14 14 0 1 1 0-28a14 14 0 0 1 0 28m0 6a26 26 0 1 1 0-52a26 26 0 0 1 0 52" fill="none" stroke="#000" stroke-width="6"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M50 12l30 66H20z" fill="none" stroke="#000" stroke-width="7" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 100 100"><path d="M50 88C22 70 12 52 12 38c0-12 9-22 20-22 5 0 10 2 18 10 8-8 13-10 18-10 11 0 20 10 20 22 0 14-10 32-38 50z" fill="#ff5252" stroke="#000" stroke-width="4" stroke-linejoin="round"/></svg>',
  ];

  const ACID_LINES = [
    "$ npm run deploy -- --prod\n> deploying... OK",
    ">_ ./init.sh --theme cyberpunk\n>_ modules loaded [42]",
    "01001000 01001001 01000111 01001000",
    ">>> sudo rm -rf /dev/null\n>>> permission granted",
    "0x7F [OK] 0x00 [OK] 0xDEADBEEF [??]",
    "...connecting to 198.51.100.7:1337",
    'LOAD "*",8,1',
    "MATRIX REV 2.3.1 :: enter the grid",
    "--=[ access granted ]=--",
    "pwd :: /home/cyber/net",
  ];

  const MAX_WORDS = ["WOW!", "COOL", "RAD", "BANG", "POP", "X-TREME", "NEON", "ZOOM", "HELLO", "WILD", "MAX", "FIRE", "STAR", "GO!"];

  const BENTO_COLORS = ["#ff9a9e", "#a18cd1", "#fbc2eb", "#a6c1ee", "#fad0c4", "#84fab0", "#ffd3a5", "#fda085"];

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function el(tag, className, style) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (style) Object.assign(e.style, style);
    return e;
  }

  function place(e, rng) {
    e.style.top = (8 + rng() * 78).toFixed(1) + "%";
    e.style.left = (4 + rng() * 88).toFixed(1) + "%";
    return e;
  }

  function buildNeo(rng) {
    const tmp = document.createElement("div");
    tmp.innerHTML = DOODLES[Math.floor(rng() * DOODLES.length)];
    const svg = tmp.querySelector("svg");
    const size = Math.round(30 + rng() * 60);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    const e = el("div", "deco");
    e.appendChild(svg);
    e.style.transform = "rotate(" + Math.round(-30 + rng() * 60) + "deg)";
    return e;
  }

  function buildY2k(rng, idx) {
    const e = el("div", "deco y2k-pic");
    const img = document.createElement("img");
    img.src = Y2K_IMAGES[idx % Y2K_IMAGES.length];
    img.loading = "lazy";
    img.alt = "";
    e.appendChild(img);
    e.style.width = Math.round(90 + rng() * 90) + "px";
    e.style.transform = "rotate(" + Math.round(-14 + rng() * 28) + "deg)";
    return e;
  }

  function buildAcid(rng) {
    const e = el("div", "deco acid-line");
    e.textContent = ACID_LINES[Math.floor(rng() * ACID_LINES.length)];
    if (rng() < 0.5) e.classList.add("blink");
    e.style.fontSize = Math.round(11 + rng() * 9) + "px";
    e.style.transform = "rotate(" + Math.round(-6 + rng() * 12) + "deg)";
    return e;
  }

  function buildMax(rng) {
    const e = el("div", "deco max-sticker");
    e.textContent = MAX_WORDS[Math.floor(rng() * MAX_WORDS.length)];
    e.style.fontSize = Math.round(20 + rng() * 34) + "px";
    e.style.transform = "rotate(" + Math.round(-20 + rng() * 40) + "deg)";
    if (rng() < 0.33) e.style.background = "#00ffcc";
    else if (rng() < 0.5) e.style.background = "#ff00ff";
    return e;
  }

  function buildBento(rng) {
    const e = el("div", "deco bento-blob");
    const s = Math.round(120 + rng() * 220);
    e.style.width = s + "px";
    e.style.height = s + "px";
    e.style.background = BENTO_COLORS[Math.floor(rng() * BENTO_COLORS.length)];
    return e;
  }

  const BUILDERS = {
    default: null,
    neobrutalism: buildNeo,
    y2k: buildY2k,
    acid: buildAcid,
    maximalism: buildMax,
    bento: buildBento,
  };

  const COUNTS = {
    default: 0,
    neobrutalism: 14,
    y2k: 4,
    acid: 10,
    maximalism: 10,
    bento: 6,
  };

  function renderDecor(theme) {
    document.querySelectorAll("body > section").forEach((section) => {
      let layer = section.querySelector(":scope > .deco-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "deco-layer";
        layer.setAttribute("aria-hidden", "true");
        section.appendChild(layer);
      }
      layer.innerHTML = "";

      const build = BUILDERS[theme] || null;
      const count = COUNTS[theme] || 0;
      const rng = mulberry32(hash(section.id + "::" + theme));

      for (let i = 0; i < count; i++) {
        const item = build(rng, i);
        if (!item) continue;
        place(item, rng);
        layer.appendChild(item);
      }
    });
  }

  function applyDecor() {
    renderDecor(document.body.getAttribute("data-theme") || "default");
  }

  new MutationObserver(applyDecor).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDecor);
  } else {
    applyDecor();
  }
})();

