"use strict";

// EDIT THIS LIST TO ADD YOUR PHOTOS.
// Paths are relative to the repository root.
// Put your image files inside the images folder.
const photos = [
  {
    src: "images/photo-01.jpg",
    title: "Mountain Escape",
    alt: "Mountain landscape"
  },
  {
    src: "images/photo-02.jpg",
    title: "By the Sea",
    alt: "Coastal scenery"
  },
  {
    src: "images/photo-03.jpg",
    title: "Into the Forest",
    alt: "Trees and forest scenery"
  }
];

const slidesContainer = document.getElementById("slides");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const counter = document.getElementById("counter");
const photoTitle = document.getElementById("photo-title");
const progressTrack = document.getElementById("progress-track");
const emptyState = document.getElementById("empty-state");
const viewer = document.querySelector(".viewer");

let currentIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let isPointerDown = false;
let hasMoved = false;

document.getElementById("year").textContent =
  new Date().getFullYear();

function buildGallery() {
  slidesContainer.replaceChildren();
  progressTrack.replaceChildren();

  if (photos.length === 0) {
    emptyState.hidden = false;
    previousButton.hidden = true;
    nextButton.hidden = true;
    photoTitle.textContent = "My Gallery";
    counter.textContent = "0 / 0";
    return;
  }

  emptyState.hidden = true;

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label",
      `${index + 1} of ${photos.length}`);

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || photo.title || "Gallery photo";
    image.draggable = false;
    image.decoding = "async";

    // Load the first image immediately.
    if (index === 0) {
      image.fetchPriority = "high";
    } else {
      image.loading = "lazy";
    }

    image.addEventListener("error", () => {
      console.warn("Could not load gallery image:", photo.src);
      image.alt = "Image could not be loaded: " +
        (photo.title || photo.src);
    });

    slide.appendChild(image);
    slidesContainer.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "progress-button";
    dot.setAttribute("aria-label",
      `Show photo ${index + 1}: ${photo.title || "Untitled"}`);

    dot.addEventListener("click", () => {
      showPhoto(index);
    });

    progressTrack.appendChild(dot);
  });

  showPhoto(0, false);
}

function showPhoto(index, animate = true) {
  if (photos.length === 0) return;

  currentIndex = (index + photos.length) % photos.length;

  const slides = slidesContainer.children;
  const dots = progressTrack.children;

  Array.from(slides).forEach((slide, i) => {
    slide.classList.remove("is-active", "is-before", "is-after");

    if (i === currentIndex) {
      slide.classList.add("is-active");
    } else if (i < currentIndex) {
      slide.classList.add("is-before");
    } else {
      slide.classList.add("is-after");
    }
  });

  // Respect reduced-motion preferences and direct initial display.
  if (!animate) {
    slides[currentIndex].style.transition = "none";
    void slides[currentIndex].offsetWidth;
    slides[currentIndex].style.transition = "";
  }

  Array.from(dots).forEach((dot, i) => {
    if (i === currentIndex) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });

  const photo = photos[currentIndex];
  photoTitle.textContent = photo.title || "Untitled";
  counter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ` +
    `${String(photos.length).padStart(2, "0")}`;

  previousButton.disabled = photos.length < 2;
  nextButton.disabled = photos.length < 2;
}

function nextPhoto() {
  showPhoto(currentIndex + 1);
}

function previousPhoto() {
  showPhoto(currentIndex - 1);
}

previousButton.addEventListener("click", previousPhoto);
nextButton.addEventListener("click", nextPhoto);

// Keyboard navigation, unless the user is typing in a control.
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const tag = event.target.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    nextPhoto();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    previousPhoto();
  }
});

// Touch gestures: horizontal swipes navigate the gallery.
viewer.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) return;

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

viewer.addEventListener("touchend", (event) => {
  if (event.changedTouches.length !== 1) return;

  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;

  // Require a clear horizontal gesture.
  if (Math.abs(deltaX) < 45 ||
      Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return;
  }

  if (deltaX < 0) {
    nextPhoto();
  } else {
    previousPhoto();
  }
}, { passive: true });

// Mouse dragging also works on desktop.
viewer.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;

  touchStartX = event.clientX;
  touchStartY = event.clientY;
  isPointerDown = true;
  hasMoved = false;
});

viewer.addEventListener("pointermove", (event) => {
  if (!isPointerDown) return;

  if (Math.abs(event.clientX - touchStartX) > 8) {
    hasMoved = true;
  }
});

viewer.addEventListener("pointerup", (event) => {
  if (!isPointerDown) return;
  isPointerDown = false;

  const deltaX = event.clientX - touchStartX;
  const deltaY = event.clientY - touchStartY;

  if (!hasMoved ||
      Math.abs(deltaX) < 60 ||
      Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return;
  }

  if (deltaX < 0) {
    nextPhoto();
  } else {
    previousPhoto();
  }
});

viewer.addEventListener("pointercancel", () => {
  isPointerDown = false;
});

buildGallery();
