(function () {
  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = toArray(hero.querySelectorAll('[data-hero-slide]'));
    var dots = toArray(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startTimer();
      });
    }

    showHero(0);
    startTimer();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters(panel) {
    var container = document.querySelector('[data-card-container]');
    if (!panel || !container) {
      return;
    }
    var cards = toArray(container.querySelectorAll('.filter-card'));
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var years = [];
    var regions = [];

    cards.forEach(function (card) {
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      if (cardYear && years.indexOf(cardYear) === -1) {
        years.push(cardYear);
      }
      if (cardRegion && regions.indexOf(cardRegion) === -1) {
        regions.push(cardRegion);
      }
    });

    years.sort().reverse();
    regions.sort();
    fillSelect(year, years);
    fillSelect(region, regions);

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden-by-filter', !matched);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (region) {
      region.addEventListener('change', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
      applyFilter();
    }
  }

  toArray(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilters);
})();
