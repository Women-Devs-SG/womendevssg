interface Window {
  initSpeakersFilter:() => void;
}

window.initSpeakersFilter = function () {
  const filtersContainer = document.getElementById("selected-filters")
  const speakerCards = document.querySelectorAll<HTMLElement>(".speaker-card-container")
  let activeFilters: string[] = [];

  window.addEventListener("tag-toggled", (event) => {
    const customEvent = event as CustomEvent<string>
    const tag = customEvent.detail;
    activeFilters = activeFilters.includes(tag)
      ? activeFilters.filter((t) => t !== tag)
      : [...activeFilters, tag];

    updateFiltersOnUI();
  });
  
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

    speakerCards.forEach(card => {
      const tags = card.getAttribute("data-labels")?.split(",") || [];
      const show = activeFilters.length === 0 || activeFilters.some(filter => tags.includes(filter));
      card.style.display = show ? "" : "none";
    });
  }
};
