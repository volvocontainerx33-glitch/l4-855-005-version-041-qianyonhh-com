(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
        dot.setAttribute("aria-current", position === index ? "true" : "false");
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        reset();
      });
    });
    show(0);
    play();
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");
    var grid = document.querySelector(".filter-grid");
    if (!panel || !grid) {
      return;
    }
    var input = panel.querySelector(".filter-input");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
    var clear = panel.querySelector(".filter-clear");
    var count = document.querySelector(".filter-count");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function text(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        filters[select.dataset.filter] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var matched = true;
        if (query && text(card).indexOf(query) === -1) {
          matched = false;
        }
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && card.dataset[key] !== filters[key]) {
            matched = false;
          }
        });
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        apply();
      });
    }
    apply();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function setupSearchPage() {
    var form = document.querySelector(".page-search-form");
    var input = document.querySelector(".page-search-input");
    var grid = document.querySelector(".search-results");
    var title = document.querySelector(".search-title");
    if (!form || !input || !grid || typeof MOVIE_SEARCH_INDEX === "undefined") {
      return;
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      if (title) {
        title.textContent = value ? "搜索结果：" + query : "热门推荐";
      }
      var list = MOVIE_SEARCH_INDEX.filter(function (item) {
        if (!value) {
          return item.featured;
        }
        return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.summary].join(" ").toLowerCase().indexOf(value) !== -1;
      }).slice(0, value ? 160 : 48);
      if (!list.length) {
        grid.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试其他关键词。</div>';
        return;
      }
      grid.innerHTML = list.map(function (item) {
        return [
          '<a class="movie-card" href="./' + item.url + '">',
          '  <span class="poster-wrap">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="movie-badge">' + escapeHtml(item.category) + '</span>',
          '    <span class="movie-year">' + escapeHtml(item.year) + '</span>',
          '  </span>',
          '  <span class="movie-card-body">',
          '    <h3>' + escapeHtml(item.title) + '</h3>',
          '    <span class="movie-one-line">' + escapeHtml(item.oneLine) + '</span>',
          '    <span class="movie-card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</span>',
          '  </span>',
          '</a>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    var initial = getQuery();
    input.value = initial;
    render(initial);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", url);
      render(query);
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
