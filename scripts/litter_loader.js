document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const litterName = params.get("name");

  if (!litterName) {
    console.warn("Brak nazwy miotu w URL.");
    return;
  }

  fetch(`/api/miot?name=${encodeURIComponent(litterName)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Błąd pobierania danych: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const title = document.getElementById("litter-title");
      const container = document.getElementById("litter-container");

      if (title) title.textContent = litterName;

      data.forEach((kitten, index) => {
        const section = document.createElement("section");
        section.className = "mb-5 scroll-reveal";

        const header = document.createElement("h2");
        header.textContent = kitten.name;
        header.className = "text-center fw-bold text-mocha mb-4";

        const row = document.createElement("div");
        row.className = "row justify-content-center g-4";

        kitten.images.forEach(src => {
          const col = document.createElement("div");
          col.className = "col-sm-6 col-md-4 col-lg-3 text-center";

          const img = document.createElement("img");
          img.src = src;
          img.alt = kitten.name;
          img.className = "img-fluid rounded shadow lightbox-trigger";
          img.style.cursor = "pointer";

          col.appendChild(img);
          row.appendChild(col);
        });

        section.appendChild(header);
        section.appendChild(row);
        container.appendChild(section);
      });

      if (window.initializeLightbox) initializeLightbox();
    })
    .catch(err => {
      console.error("Błąd ładowania danych:", err);
    });
});
