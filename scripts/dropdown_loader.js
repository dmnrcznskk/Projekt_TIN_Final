fetch("/api/mioty")
  .then(res => res.json())
  .then(mioty => {
    mioty.sort((a, b) => a.localeCompare(b, "pl", { numeric: true }));

    mioty.reverse();

    const listContainer = document.getElementById("mioty-dropdown");
    if (!listContainer) {
      console.warn("Nie znaleziono #mioty-dropdown");
      return;
    }

    listContainer.innerHTML = "";

    mioty.forEach(miot => {
      const link = document.createElement("a");
      link.classList.add("dropdown-item", "text-mocha");
      link.href = `miot_template.html?name=${encodeURIComponent(miot)}`;
      link.textContent = miot;
      listContainer.appendChild(link);
    });
  })
  .catch(err => {
    console.error("Błąd ładowania miotów:", err);
  });
