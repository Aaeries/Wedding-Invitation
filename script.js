/**
 * Monica & Larry — Wedding Invitation
 * Envelope → You're Invited → Photo + Music → Wedding details
 */

(function () {
  "use strict";

  const audio = document.getElementById("wedding-audio");
  const intro = document.getElementById("intro");
  const mainSite = document.getElementById("main-site");

  const stepEnvelope = document.getElementById("step-envelope");
  const stepInvite = document.getElementById("step-invite");
  const stepListen = document.getElementById("step-listen");

  const envelopeBtn = document.getElementById("btn-open-envelope");
  const btnToPhoto = document.getElementById("btn-to-photo");
  const btnEnter = document.getElementById("btn-enter");
  const playIcon = document.getElementById("play-icon");
  const btnRewind = document.getElementById("btn-rewind");
  const btnForward = document.getElementById("btn-forward");
  const btnPlay = document.getElementById("btn-play");

  const seekBar = document.getElementById("seek-bar");
  const seekProgress = document.getElementById("seek-progress");
  const seekKnob = document.getElementById("seek-knob");

  const musicFab = document.getElementById("music-fab");
  const btnPlayFab = document.getElementById("btn-play-fab");
  const fabCover = document.querySelector(".music-fab__cover");
  const fabState = document.getElementById("fab-state");

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpNote = document.getElementById("rsvp-note");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  let isPlaying = false;
  let audioUnlocked = false;
  let seeking = false;
  let hasEnteredSite = false;

  function setupAudioSource() {
    if (!audio) return;

    const onError = function () {
      if (audio.src.indexOf("palagi.mp3") !== -1) {
        audio.removeEventListener("error", onError);
        audio.src = "assets/palagi.wav";
        audio.load();
      }
    };

    audio.addEventListener("error", onError);
    audio.src = "assets/palagi.mp3";
    audio.load();
  }

  setupAudioSource();

  function showStep(step) {
    stepEnvelope.hidden = step !== "envelope";
    stepInvite.hidden = step !== "invite";
    stepListen.hidden = step !== "listen";
    intro.dataset.step = step;
  }

  function setPlayingUI(playing) {
    isPlaying = playing;
    if (playIcon) playIcon.textContent = playing ? "❚❚" : "▶";
    if (btnPlay) {
      btnPlay.classList.toggle("is-playing", playing);
      btnPlay.setAttribute("aria-pressed", playing ? "true" : "false");
    }
    if (fabCover) fabCover.classList.toggle("is-spinning", playing);
    if (fabState) fabState.textContent = playing ? "Pause" : "Play";
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function updateSeekUI() {
    if (!audio || seeking) return;
    const cur = document.getElementById("time-current");
    const tot = document.getElementById("time-total");
    if (cur) cur.textContent = formatTime(audio.currentTime || 0);
    if (tot) tot.textContent = formatTime(audio.duration || 0);
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (seekProgress) seekProgress.style.width = pct + "%";
    if (seekKnob) seekKnob.style.left = pct + "%";
    if (seekBar) seekBar.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  async function unlockAudio() {
    if (audioUnlocked || !audio) return;
    try {
      audio.volume = 1;
      audio.muted = true;
      const p = audio.play();
      if (p && typeof p.then === "function") await p;
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audioUnlocked = true;
    } catch (_) {
      audio.muted = false;
    }
  }

  async function playMusic() {
    if (!audio) return;
    try {
      audio.muted = false;
      audio.volume = 1;
      if (audio.error) audio.load();
      const p = audio.play();
      if (p && typeof p.then === "function") await p;
      setPlayingUI(true);
      enterWeddingDetails();
    } catch (err) {
      console.warn("Audio play failed:", err);
      setPlayingUI(false);
      alert(
        "Hindi mag-play ang audio.\n\nSiguraduhing nandito ang:\nassets/palagi.mp3\n\nSubukan din via Live Server."
      );
    }
  }

  function pauseMusic() {
    if (!audio) return;
    audio.pause();
    setPlayingUI(false);
  }

  async function toggleMusic() {
    if (isPlaying) pauseMusic();
    else await playMusic();
  }

  function enterWeddingDetails() {
    if (hasEnteredSite) return;
    hasEnteredSite = true;
    intro.classList.add("is-done");
    mainSite.hidden = false;
    musicFab.hidden = false;
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
    window.setTimeout(function () {
      observeReveals();
      updateActiveFrame();
    }, 120);
  }

  function seekFromClientX(clientX) {
    if (!audio || !audio.duration || !seekBar) return;
    const rect = seekBar.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    audio.currentTime = pct * audio.duration;
    if (seekProgress) seekProgress.style.width = pct * 100 + "%";
    if (seekKnob) seekKnob.style.left = pct * 100 + "%";
    const cur = document.getElementById("time-current");
    if (cur) cur.textContent = formatTime(audio.currentTime);
  }

  /* ---------- Envelope → Invite card ---------- */
  envelopeBtn.addEventListener("click", async function () {
    if (envelopeBtn.classList.contains("is-open")) return;

    intro.dataset.step = "opening";
    envelopeBtn.classList.add("is-open");

    const hint = document.getElementById("open-hint");
    if (hint) hint.hidden = true;

    await unlockAudio();

    window.setTimeout(function () {
      showStep("invite");
    }, 1500);
  });

  /* ---------- Invite → Photo + Music ---------- */
  btnToPhoto.addEventListener("click", function () {
    showStep("listen");
  });

  /* ---------- Player ---------- */
  btnPlay.addEventListener("click", async function () {
    if (!hasEnteredSite) {
      await playMusic();
      return;
    }
    toggleMusic();
  });

  btnPlayFab.addEventListener("click", function () {
    toggleMusic();
  });

  btnRewind.addEventListener("click", function () {
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    updateSeekUI();
  });

  btnForward.addEventListener("click", function () {
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    updateSeekUI();
  });

  audio.addEventListener("timeupdate", updateSeekUI);
  audio.addEventListener("loadedmetadata", updateSeekUI);
  audio.addEventListener("durationchange", updateSeekUI);
  audio.addEventListener("playing", function () {
    setPlayingUI(true);
  });
  audio.addEventListener("pause", function () {
    if (!audio.ended) setPlayingUI(false);
  });

  seekBar.addEventListener("pointerdown", function (e) {
    seeking = true;
    seekFromClientX(e.clientX);
    seekBar.setPointerCapture(e.pointerId);
  });

  seekBar.addEventListener("pointermove", function (e) {
    if (!seeking) return;
    seekFromClientX(e.clientX);
  });

  seekBar.addEventListener("pointerup", function () {
    seeking = false;
  });

  seekBar.addEventListener("pointercancel", function () {
    seeking = false;
  });

  if (btnEnter) {
    btnEnter.addEventListener("click", enterWeddingDetails);
  }

  document.body.style.overflow = "hidden";

  /* ---------- Mobile nav ---------- */
  navToggle.addEventListener("click", function () {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- RSVP ---------- */
  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    rsvpNote.textContent =
      "Salamat! Natanggap namin ang RSVP ninyo (demo — walang backend pa).";
    rsvpForm.reset();
  });

  /* ---------- Lightbox ---------- */
  document.querySelectorAll(".gallery__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const src = btn.getAttribute("data-full");
      if (!src) return;
      lightboxImg.src = src;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Gallery active frame on scroll ---------- */
  const artHall = document.getElementById("art-hall") || document.querySelector(".art-hall");
  const artFrames = Array.prototype.slice.call(document.querySelectorAll(".art-frame"));
  const galleryDots = document.getElementById("gallery-dots");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");
  let activeFrameIndex = 0;

  function buildGalleryDots() {
    if (!galleryDots || !artFrames.length) return;
    galleryDots.innerHTML = "";
    artFrames.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", "Go to photo " + (i + 1));
      dot.addEventListener("click", function () {
        scrollToFrame(i);
      });
      galleryDots.appendChild(dot);
    });
  }

  function scrollToFrame(index) {
    if (!artHall || !artFrames[index]) return;
    const frame = artFrames[index];
    const target =
      frame.offsetLeft - (artHall.clientWidth - frame.offsetWidth) / 2;
    artHall.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }

  function updateActiveFrame() {
    if (!artHall || !artFrames.length) return;
    const hallRect = artHall.getBoundingClientRect();
    const centerX = hallRect.left + hallRect.width / 2;
    let closest = null;
    let closestIndex = 0;
    let closestDist = Infinity;

    artFrames.forEach(function (frame, i) {
      const rect = frame.getBoundingClientRect();
      const frameCenter = rect.left + rect.width / 2;
      const dist = Math.abs(frameCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = frame;
        closestIndex = i;
      }
    });

    activeFrameIndex = closestIndex;
    artFrames.forEach(function (frame) {
      frame.classList.toggle("is-active", frame === closest);
    });

    if (galleryDots) {
      const dots = galleryDots.querySelectorAll(".gallery-dot");
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === closestIndex);
        dot.setAttribute("aria-current", i === closestIndex ? "true" : "false");
      });
    }

    if (galleryPrev) galleryPrev.disabled = closestIndex <= 0;
    if (galleryNext) galleryNext.disabled = closestIndex >= artFrames.length - 1;
  }

  if (artHall && artFrames.length) {
    buildGalleryDots();

    let scrollTick = false;
    artHall.addEventListener("scroll", function () {
      if (scrollTick) return;
      scrollTick = true;
      window.requestAnimationFrame(function () {
        updateActiveFrame();
        scrollTick = false;
      });
    }, { passive: true });

    artHall.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      artHall.scrollLeft += e.deltaY;
    }, { passive: false });

    if (galleryPrev) {
      galleryPrev.addEventListener("click", function () {
        scrollToFrame(Math.max(0, activeFrameIndex - 1));
      });
    }
    if (galleryNext) {
      galleryNext.addEventListener("click", function () {
        scrollToFrame(Math.min(artFrames.length - 1, activeFrameIndex + 1));
      });
    }

    window.addEventListener("resize", updateActiveFrame);
    updateActiveFrame();
  }

  function observeReveals() {
    const els = document.querySelectorAll(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  try {
    audio.volume = 1;
  } catch (_) {
    /* ignore */
  }
})();
