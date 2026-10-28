declare global {
  interface Window {
    initSpeakersFilter: () => void;
  }
}

let tagToggledHandler: ((event: Event) => void) | null = null;

window.initSpeakersFilter = function () {
  const filtersContainer = document.getElementById("selected-filters")
  const speakerCards = document.querySelectorAll<HTMLElement>(".speaker-card-container")
  const searchInput = document.getElementById("speaker-search") as HTMLInputElement | null
  const emptyMessage = document.getElementById("no-speakers")
  let activeFilters: string[] = [];
  let query = "";

  searchInput?.addEventListener("input", () => {
    query = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  // Remove the previous page visit's listener so toggles aren't handled twice
  if (tagToggledHandler) window.removeEventListener("tag-toggled", tagToggledHandler);
  tagToggledHandler = (event) => {
    const customEvent = event as CustomEvent<string>
    const tag = customEvent.detail;
    activeFilters = activeFilters.includes(tag)
      ? activeFilters.filter((t) => t !== tag)
      : [...activeFilters, tag];

    updateFiltersOnUI();
  };
  window.addEventListener("tag-toggled", tagToggledHandler);
  
  function updateFiltersOnUI() {
    if(!filtersContainer) return
    filtersContainer.innerHTML = "";
    activeFilters.forEach(filter => {
      const span = document.createElement("span");
      span.className = "px-2 py-1 bg-pink-500 hover:bg-pink-700 font-medium text-sm rounded-xl cursor-pointer";
      span.innerHTML = `#${filter} <span class='cursor-pointer font-bold'">&times;</span>`;
      span.querySelector("span")?.addEventListener("click", () => {
        activeFilters = activeFilters.filter((eachFilter) => eachFilter !== filter);
        updateFiltersOnUI();
      });

      filtersContainer.appendChild(span);
    })

    applyFilters();
  }

  function applyFilters() {
    let visible = 0;
    speakerCards.forEach(card => {
      const tags = card.getAttribute("data-labels")?.split(",") || [];
      const text = card.getAttribute("data-search") || "";
      const matchesTags = activeFilters.length === 0 || activeFilters.some(filter => tags.includes(filter));
      const matchesQuery = query === "" || query.split(/\s+/).every(word => text.includes(word));
      const show = matchesTags && matchesQuery;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    emptyMessage?.classList.toggle("hidden", visible > 0);
  }
};

export {};
