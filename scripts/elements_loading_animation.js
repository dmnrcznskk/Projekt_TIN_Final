document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".scroll-reveal").forEach(el => observer.observe(el));

  const observerDOM = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains("scroll-reveal")) {
          observer.observe(node);
        }
        if (node.nodeType === 1) {
          node.querySelectorAll(".scroll-reveal").forEach(el => observer.observe(el));
        }
      });
    });
  });

  observerDOM.observe(document.body, {
    childList: true,
    subtree: true
  });
});
