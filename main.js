// GSAP ScrollTrigger animation
gsap.registerPlugin(ScrollTrigger);

const NAV_OFFSET = 20;
ScrollTrigger.getAll().forEach((t) => t.kill());

const section = document.querySelector(".why-choose");
const container = section.querySelector(".container");
const left = section.querySelector(".left");
const right = section.querySelector(".right");

function pinDistance() {
  const leftH = left.offsetHeight;
  const rightH = right.scrollHeight;
  return Math.max(0, rightH - leftH);
}

function lockPinnedWidth() {
  left.style.width = left.getBoundingClientRect().width + "px";
}

lockPinnedWidth();

ScrollTrigger.create({
  trigger: section,
  start: () => `top top+=${NAV_OFFSET}`,
  end: () => `+=${pinDistance()}`,
  pin: left,
  pinSpacing: true,
  pinType: "transform",
  anticipatePin: 1,
  invalidateOnRefresh: true,
  onRefreshInit: lockPinnedWidth,
});

addEventListener("load", () => ScrollTrigger.refresh());
addEventListener("resize", () => {
  left.style.width = "";
  lockPinnedWidth();
  ScrollTrigger.refresh();
});

// --- STACKED CARDS ---

// (function initStackedCards() {
//   const section = document.querySelector(".stacked-cards");
//   if (!section) return;

//   const pinBox = section.querySelector(".stacked-cards__pin");
//   const cards = gsap.utils.toArray(".stacked-cards .scard");
//   if (!cards.length) return;

//   // expose card count to CSS for scroll length calc
//   section.style.setProperty("--card-count", cards.length);

//   // layer cards (top card has highest z-index)
//   cards.forEach((c, i) => (c.style.zIndex = String(cards.length - i)));

//   // Pin the stack while we scroll through all cards
//   ScrollTrigger.create({
//     trigger: section,
//     start: () => `top top+=${NAV_OFFSET || 20}`,
//     end: () =>
//       `+=${window.innerHeight * 0.9 * cards.length + window.innerHeight}`,
//     pin: pinBox,
//     pinSpacing: true,
//     anticipatePin: 1,
//     invalidateOnRefresh: true,
//   });

//   // Each card animates up & out in its own band of scroll
//   const band = () => window.innerHeight * 0.9; // scroll per card
//   cards.forEach((card, i) => {
//     gsap.fromTo(
//       card,
//       { yPercent: 0, scale: 1 },
//       {
//         yPercent: -120,
//         scale: 0.98,
//         ease: "power1.out",
//         scrollTrigger: {
//           trigger: section,
//           start: () => `top+=${band() * i} top+=${NAV_OFFSET || 20}`,
//           end: () => `top+=${band() * (i + 1)} top+=${NAV_OFFSET || 20}`,
//           scrub: true,
//         },
//       }
//     );
//   });

//   // keep things crisp on resize
//   addEventListener("resize", () => ScrollTrigger.refresh());
// })();

// --- STACKED CARDS ---
(function initStackedCards() {
  const section = document.querySelector(".stacked-cards");
  if (!section) return;

  const pinBox = section.querySelector(".stacked-cards__pin");
  const cards = gsap.utils.toArray(".stacked-cards .scard");
  if (!cards.length) return;

  const steps = Math.max(cards.length - 1, 1); // transitions, not cards
  section.style.setProperty("--card-count", steps); // used by CSS min-height

  // topmost card should have highest z-index
  cards.forEach((c, i) => (c.style.zIndex = String(cards.length - i)));

  // pin only for the number of transitions
  const band = () => window.innerHeight * 0.9;
  ScrollTrigger.create({
    trigger: section,
    start: () => `top top+=${NAV_OFFSET || 20}`,
    end: () => `+=${band() * steps + window.innerHeight}`,
    pin: pinBox,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  // animate only the first N−1 cards; keep the last one in place
  cards.slice(0, steps).forEach((card, i) => {
    gsap.fromTo(
      card,
      { yPercent: 0, scale: 1 },
      {
        yPercent: -120,
        scale: 0.98,
        ease: "power1.out",
        scrollTrigger: {
          trigger: section,
          start: () => `top+=${band() * i} top+=${NAV_OFFSET || 20}`,
          end: () => `top+=${band() * (i + 1)} top+=${NAV_OFFSET || 20}`,
          scrub: true,
        },
      }
    );
  });

  addEventListener("resize", () => ScrollTrigger.refresh());
})();

// WE USE — hover to fill the blank with the tool name
(() => {
  const section = document.querySelector(".we-use");
  if (!section) return;

  const slot = section.querySelector(".we-use__slot");
  const tools = section.querySelectorAll(".tool");
  const DEFAULT_TEXT = "many tools";

  const set = (name) => (slot.textContent = name || DEFAULT_TEXT);
  section.addEventListener("mouseleave", () => set(DEFAULT_TEXT));

  tools.forEach((btn) => {
    const name = btn.dataset.name || DEFAULT_TEXT;
    btn.addEventListener("mouseenter", () => set(name));
    btn.addEventListener("focus", () => set(name));
    btn.addEventListener("mouseleave", () => set(DEFAULT_TEXT));
    btn.addEventListener("blur", () => set(DEFAULT_TEXT));
    // Touch support (tap to show)
    btn.addEventListener("touchstart", () => set(name), { passive: true });
  });
})();

// --- WIDE STACK ---
(function wideStack() {
  const section = document.querySelector(".wide-stack");
  if (!section) return;

  const pin = section.querySelector(".wide-stack__pin");
  const cards = gsap.utils.toArray(".wide-stack .wcard");
  if (!cards.length) return;

  // expose count to CSS
  section.style.setProperty("--count", cards.length);

  cards.forEach((c, i) => (c.style.zIndex = String(i + 1)));

  // Pin the deck
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => "+=" + window.innerHeight * (cards.length + 0.5),
    pin: pin,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  // Per-card band (scroll distance each transition occupies)
  const band = () => window.innerHeight;

  // For each step: current card moves "back" (scale down + slight up),
  // next card slides in from bottom behind it, then becomes top.
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;

    // starting states
    // gsap.set(next, { y: "40vh", scale: 0.94 });

    gsap.set(next, { yPercent: 120, scale: 0.94 });

    // timeline for this handoff
    // const tl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: section,
    //     start: () => `top+=${band() * i} top`,
    //     end: () => `top+=${band() * (i + 1)} top`,
    //     scrub: true,
    //   },
    // });

    // tl.to(
    //   card,
    //   {
    //     y: "-10vh",
    //     scale: 0.92,
    //     ease: "power1.out",
    //   },
    //   0
    // ).to(
    //   next,
    //   {
    //     y: "0vh",
    //     scale: 1,
    //     ease: "power1.out",
    //   },
    //   0
    // );

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: () => `top+=${band() * i} top`,
        end: () => `top+=${band() * (i + 1)} top`,
        scrub: true,
      },
    });

    // current card moves back
    tl.to(
      card,
      {
        y: "-10vh",
        scale: 0.92,
        ease: "power1.out",
      },
      0
    )

      // next card comes in a bit later in the same band
      .to(
        next,
        {
          yPercent: 0,
          scale: 1,
          ease: "power1.out",
        },
        0.35
      ); // try 0.35–0.5 for when it should appear
  });

  addEventListener("resize", () => ScrollTrigger.refresh());
})();

window.addEventListener("load", () => {
  if (!window.gsap) return;
  gsap.from([".nav", ".title", ".lead"], {
    opacity: 0,
    y: 18,
    duration: 0.9,
    stagger: 0.08,
    ease: "power2.out",
  });
});
