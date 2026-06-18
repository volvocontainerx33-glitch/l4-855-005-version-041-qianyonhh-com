(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNav() {
    all("[data-nav]").forEach(function (nav) {
      var button = nav.querySelector("[data-nav-toggle]");
      if (!button) {
        return;
      }
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    all("[data-filter-panel]").forEach(function (panel) {
      var textInput = panel.querySelector("[data-filter-text]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var cards = all(".movie-card", panel);
      var empty = panel.querySelector("[data-empty-note]");

      function apply() {
        var query = (textInput && textInput.value || "").trim().toLowerCase();
        var type = typeSelect && typeSelect.value || "";
        var year = yearSelect && yearSelect.value || "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            ok = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [textInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var box = document.querySelector("[data-global-results]");
    if (!input || !box || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function escapeText(value) {
      return String(value || "").replace(/[&<>"']/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    function render(items) {
      box.innerHTML = items.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeText(item.title) + '">' +
          '<span><strong>' + escapeText(item.title) + '</strong><span>' + escapeText(item.meta) + '</span></span>' +
          '</a>';
      }).join("");
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        box.innerHTML = "";
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(query) !== -1;
      }).slice(0, 12);
      render(results);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();
