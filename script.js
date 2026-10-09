const researchGrid =
  document.getElementById("researchGrid");

const projectGrid =
  document.getElementById("projectGrid");

const researchSection =
  document.getElementById("research");

const projectsSection =
  document.getElementById("projects");

const categoryFilter =
  document.getElementById("categoryFilter");

const yearSort =
  document.getElementById("yearSort");

const modal =
  document.getElementById("projectModal");

const modalImage =
  document.getElementById("modalImage");

const modalImageWrap =
  document.querySelector(".modal-image-wrap");

const modalKicker =
  document.getElementById("modalKicker");

const modalTitle =
  document.getElementById("modalTitle");

const modalSummary =
  document.getElementById("modalSummary");

const modalVenue =
  document.getElementById("modalVenue");

const modalOverview =
  document.getElementById("modalOverview");

const modalBackground =
  document.getElementById("modalBackground");

const modalMethod =
  document.getElementById("modalMethod");

const modalResult =
  document.getElementById("modalResult");

const modalSkills =
  document.getElementById("modalSkills");

const methodFlow =
  document.getElementById("methodFlow");

const videoArea =
  document.getElementById("videoArea");

const modalActions =
  document.getElementById("modalActions");

const progress =
  document.querySelector(
    ".scroll-progress span"
  );

let works = [];


function parseCSV(text) {

  const rows = [];

  let row = [];
  let field = "";
  let quote = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char = text[i];

    if (char === '"') {

      if (
        quote &&
        text[i + 1] === '"'
      ) {

        field += '"';
        i++;

      } else {

        quote = !quote;

      }

    } else if (
      char === "," &&
      !quote
    ) {

      row.push(field);
      field = "";

    } else if (
      (char === "\n" ||
       char === "\r") &&
      !quote
    ) {

      if (
        char === "\r" &&
        text[i + 1] === "\n"
      ) {
        i++;
      }

      row.push(field);

      if (
        row.some(
          x => x.trim() !== ""
        )
      ) {
        rows.push(row);
      }

      row = [];
      field = "";

    } else {

      field += char;

    }
  }

  row.push(field);

  if (
    row.some(
      x => x.trim() !== ""
    )
  ) {
    rows.push(row);
  }

  const headers =
    rows.shift()
      .map(x => x.trim());

  return rows.map(values => {

    const result = {};

    headers.forEach(
      (header,index) => {

        result[header] =
          (values[index] || "")
            .trim();

      }
    );

    return result;

  });
}


function esc(text = "") {

  return text
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");

}


function titleHTML(text = "") {
  return text
    .split("｜")
    .map(part => `<span class="title-line">${esc(part)}</span>`)
    .join("");
}

function plainTitle(text = "") {
  return text.replaceAll("｜", "");
}



function makeCard(
  item,
  index
) {

  const card =
    document.createElement("article");

  card.className =
    "work-card";

  card.id = item.id;
  card.dataset.id = item.id;

  card.tabIndex = 0;


  const tags =
    item.skills
      .split(";")
      .filter(Boolean)
      .slice(0,3)
      .filter(tag => tag !== item.category)
      .map(
        tag =>
          `<span>${esc(tag)}</span>`
      )
      .join("");


  card.innerHTML = `

    <div class="work-info">

      <div>

        <span class="work-index">
          ${String(index + 1).padStart(2,"0")}
        </span>

        <p class="work-kicker">
          ${esc(item.kicker)}
          ·
          ${esc(item.year)}
        </p>

        <h3>
          ${titleHTML(item.title)}
        </h3>

        <p class="work-summary">
          ${esc(item.summary)}
        </p>

        <div class="work-event">

          <small>
            発表・実績
          </small>

          <strong>
            ${esc(item.venue)}
          </strong>

        </div>

      </div>


      <div class="work-bottom">

        <div class="work-tags">
          <span>${esc(item.category)}</span>
          ${tags}
        </div>

        <div class="detail-link">
          詳細を見る
          <span>↗</span>
        </div>

      </div>

    </div>


    <div class="work-media">

      <div class="image-fallback">
        VISUAL
      </div>

      <img
        src="${esc(item.image)}"
        alt="${esc(item.title)}"
        loading="lazy"
      >

    </div>

  `;


  const image =
    card.querySelector("img");

  image.addEventListener("load", () => {
    card.querySelector(".work-media")?.classList.add("image-loaded");
    card.querySelector(".work-media")?.classList.remove("image-error");
  });

  image.addEventListener("error", () => {
    card.querySelector(".work-media")?.classList.add("image-error");
    card.querySelector(".work-media")?.classList.remove("image-loaded");
  });


  card.addEventListener(
    "click",
    () => openModal(item)
  );


  card.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();
        openModal(item);

      }
    }
  );


  return card;
}


const dateValue = value => Number(value.replace("-", ""));

function renderWorks() {

  researchGrid.innerHTML = "";
  projectGrid.innerHTML = "";

  const filteredWorks = categoryFilter.value === "all"
    ? [...works]
    : works.filter(item => item.category === categoryFilter.value);

  filteredWorks.sort((a, b) => yearSort.value === "oldest"
    ? dateValue(a.date) - dateValue(b.date)
    : dateValue(b.date) - dateValue(a.date));

  const research =
    filteredWorks.filter(
      item =>
        item.kind === "research"
    );

  const projects =
    filteredWorks.filter(
      item =>
        item.kind === "project"
    );


  researchSection.hidden = research.length === 0;
  projectsSection.hidden = projects.length === 0;

  research.forEach(
    (item,index) => {

      researchGrid.appendChild(
        makeCard(item,index)
      );

    }
  );


  projects.forEach(
    (item,index) => {

      projectGrid.appendChild(
        makeCard(item,index)
      );

    }
  );


  observeReveal();
  updateScroll();
}

for (const control of [categoryFilter, yearSort]) {
  control.addEventListener("change", renderWorks);
}


function getYoutubeId(url) {

  if (!url) return "";

  try {

    const u = new URL(url);

    if (
      u.hostname.includes(
        "youtu.be"
      )
    ) {
      return u.pathname.slice(1);
    }

    return (
      u.searchParams.get("v") ||
      ""
    );

  } catch {

    return "";

  }
}


function openModal(item) {

  modalKicker.textContent =
    `${item.kicker} · ${item.year}`;

  const isBrainResearch =
    /畳み込みオートエンコーダ|自閉症スペクトラム障害/.test(item.title);

  modalTitle.classList.toggle(
    "modal-title-brain",
    isBrainResearch
  );

  modalTitle.innerHTML = isBrainResearch
    ? `
      <span class="title-line">畳み込みオートエンコーダを</span>
      <span class="title-line">用いた自閉症スペクトラム障害の</span>
      <span class="title-line">脳機能特徴抽出</span>
    `
    : titleHTML(item.title);

  modalSummary.textContent =
    item.summary;

  modalVenue.textContent =
    item.venue;

  modalOverview.textContent =
    item.overview;

  modalBackground.textContent =
    item.background;

  modalMethod.textContent =
    item.method;

  modalResult.textContent =
    item.result;


  modalImageWrap.classList.toggle(
    "office",
    item.id === "office"
  );


  modalImage.src =
    item.image;

  modalImage.alt =
    plainTitle(item.title);

  modalImage.style.display =
    "block";


  modalImage.onerror = () => {
    modalImage.style.display =
      "none";
  };


  modalSkills.innerHTML =
    item.skills
      .split(";")
      .filter(Boolean)
      .map(
        skill =>
          `<span>${esc(skill)}</span>`
      )
      .join("");


  methodFlow.innerHTML =
    item.flow
      .split(";")
      .filter(Boolean)
      .map(
        (step,index) => `

          <div class="flow-item">

            <small>
              ${String(index + 1)
                .padStart(2,"0")}
            </small>

            <strong>
              ${esc(step)}
            </strong>

          </div>

        `
      )
      .join("");


  videoArea.innerHTML = "";
  modalActions.innerHTML = "";


  const yt =
    getYoutubeId(
      item.video_url
    );


  if (yt) {

    videoArea.innerHTML = `

      <div class="video-block">

        <div class="video-title">
          PROJECT VIDEO
        </div>

        <div class="video-frame">

          <iframe
            src="https://www.youtube-nocookie.com/embed/${yt}?rel=0"
            title="WorldLens project video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>

        </div>

      </div>

    `;

  }


  if (item.live_url) {

    modalActions.insertAdjacentHTML(
      "beforeend",
      `
        <a
          href="${esc(item.live_url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Live Demo ↗
        </a>
      `
    );

  }


  if (item.video_url) {

    modalActions.insertAdjacentHTML(
      "beforeend",
      `
        <a
          href="${esc(item.video_url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube ↗
        </a>
      `
    );

  }


  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

  modal.scrollTop = 0;
}


function closeModal() {

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

  videoArea.innerHTML = "";
}


document
  .querySelectorAll(
    "[data-close-modal]"
  )
  .forEach(
    el =>
      el.addEventListener(
        "click",
        closeModal
      )
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal.classList.contains("open")
    ) {
      closeModal();
    }

  }
);


/* reveal */

let observer;

function observeReveal() {

  if (observer) {
    observer.disconnect();
  }

  observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target
                .classList
                .add("visible");

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: .1
      }
    );


  document
    .querySelectorAll(
      ".reveal, .work-card"
    )
    .forEach(
      element =>
        observer.observe(element)
    );
}


/* scroll */

let ticking = false;

function updateScroll() {

  const max =
    document.documentElement
      .scrollHeight -
    window.innerHeight;

  const ratio =
    max > 0
      ? window.scrollY / max
      : 0;


  progress.style.width =
    `${ratio * 100}%`;


  const hero =
    document.querySelector(
      ".hero-content"
    );

  if (hero) {

    const heroRatio =
      Math.min(
        1,
        window.scrollY /
        window.innerHeight
      );

    hero.style.transform =
      `translate3d(
        0,
        ${heroRatio * 38}px,
        0
      )`;

    hero.style.opacity =
      `${1 - heroRatio * .3}`;

  }


  const a =
    document.querySelector(
      ".ambient-one"
    );

  const b =
    document.querySelector(
      ".ambient-two"
    );

  const c =
    document.querySelector(
      ".ambient-three"
    );


  a.style.transform =
    `translate3d(
      ${ratio * 40}px,
      ${window.scrollY * .025}px,
      0
    )`;

  b.style.transform =
    `translate3d(
      ${ratio * -35}px,
      ${window.scrollY * -.018}px,
      0
    )`;

  c.style.transform =
    `translate3d(
      0,
      ${window.scrollY * -.012}px,
      0
    )`;


  document.body.style.background =
    `rgb(
      ${Math.round(248 - ratio * 2)},
      ${Math.round(249 + ratio * 2)},
      ${Math.round(252 - ratio)}
    )`;


  ticking = false;
}


window.addEventListener(
  "scroll",
  () => {

    if (!ticking) {

      requestAnimationFrame(
        updateScroll
      );

      ticking = true;
    }

  },
  {
    passive: true
  }
);


/* load csv */

async function loadWorks() {

  try {

    const response =
      await fetch(
        `works.csv?v=${Date.now()}`
      );

    if (!response.ok) {
      throw new Error(
        `CSV ${response.status}`
      );
    }

    const csv =
      await response.text();

    works =
      parseCSV(csv);

    const categories = new Set(
      works.map(item => item.category).filter(Boolean)
    );

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    renderWorks();

  } catch (error) {

    console.error(error);

    researchGrid.innerHTML =
      "<p>CSVを読み込めませんでした。</p>";

    projectGrid.innerHTML =
      "<p>CSVを読み込めませんでした。</p>";

  }

}


observeReveal();
loadWorks();
updateScroll();


/* === HERO POINTER INTERACTION START === */

(() => {
  const hero = document.querySelector(".hero");

  if (!hero) return;

  let frame = null;
  let latestX = 0;
  let latestY = 0;

  const updatePointer = () => {
    const rect = hero.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      frame = null;
      return;
    }

    const x = Math.max(
      0,
      Math.min(1, (latestX - rect.left) / rect.width)
    );

    const y = Math.max(
      0,
      Math.min(1, (latestY - rect.top) / rect.height)
    );

    hero.style.setProperty(
      "--cursor-x",
      `${(x * 100).toFixed(2)}%`
    );

    hero.style.setProperty(
      "--cursor-y",
      `${(y * 100).toFixed(2)}%`
    );

    const dx = x - 0.5;
    const dy = y - 0.5;

    hero.style.setProperty(
      "--ring-x",
      `${(dx * 48).toFixed(1)}px`
    );

    hero.style.setProperty(
      "--ring-y",
      `${(dy * 36).toFixed(1)}px`
    );

    hero.style.setProperty(
      "--ring-x-small",
      `${(dx * -24).toFixed(1)}px`
    );

    hero.style.setProperty(
      "--ring-y-small",
      `${(dy * -18).toFixed(1)}px`
    );

    frame = null;
  };

  hero.addEventListener(
    "pointermove",
    event => {
      latestX = event.clientX;
      latestY = event.clientY;

      if (!frame) {
        frame = requestAnimationFrame(updatePointer);
      }
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--cursor-x", "68%");
    hero.style.setProperty("--cursor-y", "38%");

    hero.style.setProperty("--ring-x", "0px");
    hero.style.setProperty("--ring-y", "0px");

    hero.style.setProperty(
      "--ring-x-small",
      "0px"
    );

    hero.style.setProperty(
      "--ring-y-small",
      "0px"
    );
  });
})();

/* === HERO POINTER INTERACTION END === */


/* === MODAL VISUAL FX JS START === */

(() => {
  const isVisible = element => {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const commonAncestor = (a, b) => {
    if (!a || !b) return null;

    const parents = new Set();

    let node = a;

    while (node) {
      parents.add(node);
      node = node.parentElement;
    }

    node = b;

    while (node) {
      if (parents.has(node)) return node;
      node = node.parentElement;
    }

    return null;
  };


  const findModalSurface = root => {
    const heading = root.querySelector("h1, h2, h3");
    const image = root.querySelector("img");

    if (!heading || !image) return null;

    return (
      heading.closest(
        ".modal-content, .modal-panel, .modal-card, .modal-inner"
      ) ||
      commonAncestor(heading, image) ||
      root
    );
  };


  const classifyModal = surface => {
    const text = surface.textContent || "";

    surface.classList.remove(
      "fx-modal-brain",
      "fx-modal-spatial",
      "fx-modal-project"
    );

    if (
      /fMRI|BRAIN FUNCTION|自閉症|オートエンコーダ/i.test(text)
    ) {
      surface.classList.add("fx-modal-brain");
      return;
    }

    if (
      /SPATIAL|FREQUENCY|オフィス|什器|周波数/i.test(text)
    ) {
      surface.classList.add("fx-modal-spatial");
      return;
    }

    surface.classList.add("fx-modal-project");
  };


  const enhance = root => {
    if (!isVisible(root)) return;

    const surface = findModalSurface(root);

    if (!surface) return;

    surface.classList.add("fx-modal-surface");

    let ambient = surface.querySelector(
      ":scope > .fx-modal-ambient"
    );

    if (!ambient) {
      ambient = document.createElement("div");
      ambient.className = "fx-modal-ambient";
      ambient.setAttribute("aria-hidden", "true");
      surface.prepend(ambient);
    }

    classifyModal(surface);

    const heading = surface.querySelector(
      "h1, h2, h3"
    );

    if (heading) {
      heading.classList.add("fx-modal-title");
    }

    const image = surface.querySelector("img");

    if (image) {
      image.classList.add("fx-modal-image");

      if (!image.dataset.fxDepthBound) {
        image.dataset.fxDepthBound = "true";

        image.addEventListener(
          "pointermove",
          event => {
            const rect =
              image.getBoundingClientRect();

            const x =
              (event.clientX - rect.left) /
              rect.width - .5;

            const y =
              (event.clientY - rect.top) /
              rect.height - .5;

            image.style.setProperty(
              "--fx-img-x",
              `${(x * 10).toFixed(1)}px`
            );

            image.style.setProperty(
              "--fx-img-y",
              `${(y * 8).toFixed(1)}px`
            );

            image.style.setProperty(
              "--fx-img-scale",
              "1.025"
            );
          },
          { passive: true }
        );

        image.addEventListener(
          "pointerleave",
          () => {
            image.style.setProperty(
              "--fx-img-x",
              "0px"
            );

            image.style.setProperty(
              "--fx-img-y",
              "0px"
            );

            image.style.setProperty(
              "--fx-img-scale",
              "1"
            );
          }
        );
      }
    }

    const kicker =
      surface.querySelector(
        ".kicker, [class*='kicker'], [class*='eyebrow']"
      );

    if (kicker) {
      kicker.classList.add("fx-modal-kicker");
    }

    surface.classList.remove("fx-modal-enter");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        surface.classList.add("fx-modal-enter");
      });
    });
  };


  const scan = () => {
    const selectors = [
      "dialog",
      "[role='dialog']",
      ".modal",
      "[id*='modal']"
    ];

    document
      .querySelectorAll(selectors.join(","))
      .forEach(root => {
        if (
          root.querySelector("img") &&
          root.querySelector("h1, h2, h3")
        ) {
          enhance(root);
        }
      });
  };


  let scheduled = false;

  const scheduleScan = () => {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  };


  document.addEventListener("click", () => {
    setTimeout(scheduleScan, 20);
    setTimeout(scheduleScan, 150);
  });


  const observer = new MutationObserver(
    scheduleScan
  );

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "class",
      "style",
      "open",
      "aria-hidden"
    ]
  });

  scan();
})();

/* === MODAL VISUAL FX JS END === */
