(function () {
  var mobileButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var targets = section ? Array.prototype.slice.call(section.querySelectorAll('.filter-targets .movie-card, .filter-targets .movie-card-row')) : [];
      var search = panel.querySelector('.movie-search');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var count = panel.querySelector('.filter-count');

      if (!targets.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && search) {
        search.value = q;
      }

      function apply() {
        var keyword = normalize(search ? search.value : '');
        var activeFilters = {};

        selects.forEach(function (select) {
          var key = select.getAttribute('data-filter');
          activeFilters[key] = normalize(select.value);
        });

        var visible = 0;

        targets.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' '));

          var matched = !keyword || haystack.indexOf(keyword) !== -1;

          Object.keys(activeFilters).forEach(function (key) {
            var value = activeFilters[key];
            if (!value) {
              return;
            }
            var dataValue = normalize(card.getAttribute('data-' + key));
            if (dataValue !== value) {
              matched = false;
            }
          });

          card.classList.toggle('filter-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部内容';
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.play-cover');
      var loaded = false;
      var hls = null;

      if (!video) {
        return;
      }

      function load() {
        if (loaded) {
          return Promise.resolve();
        }

        var stream = video.getAttribute('data-stream');
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          });
        }

        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        load().then(function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
    initPlayers();
  });
})();
