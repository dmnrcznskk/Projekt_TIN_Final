function initializeLightbox() {
  const overlay = document.getElementById("lightbox-overlay");
  const image = document.getElementById("lightbox-image");
  const closeBtn = document.getElementById("lightbox-close");

  document.querySelectorAll(".lightbox-trigger").forEach(img => {
    img.addEventListener("click", () => {
      image.src = img.src;
      overlay.classList.remove("d-none");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    overlay.classList.add("d-none");
    image.src = "";
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target === closeBtn) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
  });
}

window.initializeLightbox = initializeLightbox;
