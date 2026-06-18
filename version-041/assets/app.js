(function () {
  var menuButton = document.querySelector(".js-menu-button");
  var mobilePanel = document.querySelector(".js-mobile-panel");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var searchLayer = document.querySelector(".js-search-layer");
  var searchOpen = document.querySelector(".js-search-open");
  var searchClose = document.querySelector(".js-search-close");
  if (searchLayer && searchOpen) {
    searchOpen.addEventListener("click", function () {
      searchLayer.classList.add("is-open");
      searchLayer.setAttribute("aria-hidden", "false");
      var input = searchLayer.querySelector("input");
      if (input) {
        input.focus();
      }
    });
  }
  if (searchLayer && searchClose) {
    searchClose.addEventListener("click", function () {
      searchLayer.classList.remove("is-open");
      searchLayer.setAttribute("aria-hidden", "true");
    });
  }
  if (searchLayer) {
    searchLayer.addEventListener("click", function (event) {
      if (event.target === searchLayer) {
        searchLayer.classList.remove("is-open");
        searchLayer.setAttribute("aria-hidden", "true");
      }
    });
  }

  var hero = document.querySelector(".js-hero");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".js-hero-prev");
    var next = hero.querySelector(".js-hero-next");
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }
    startTimer();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards(term) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
    var query = normalize(term);
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search") || card.textContent);
      var matched = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle("is-filtered-out", !matched);
    });
  }

  var filterInput = document.querySelector(".js-filter-input");
  var queryInput = document.querySelector(".js-query-input");
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    queryInput.value = q;
    filterCards(q);
  }
  if (filterInput) {
    filterInput.addEventListener("input", function () {
      filterCards(filterInput.value);
      Array.prototype.slice.call(document.querySelectorAll(".js-filter-chip")).forEach(function (chip) {
        chip.classList.remove("is-active");
      });
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-filter-chip")).forEach(function (chip) {
    chip.addEventListener("click", function () {
      var value = chip.getAttribute("data-filter") || "";
      if (filterInput) {
        filterInput.value = value;
      }
      filterCards(value);
      Array.prototype.slice.call(document.querySelectorAll(".js-filter-chip")).forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
    });
  });

  var clearFilter = document.querySelector(".js-filter-clear");
  if (clearFilter) {
    clearFilter.addEventListener("click", function () {
      if (filterInput) {
        filterInput.value = "";
      }
      filterCards("");
      Array.prototype.slice.call(document.querySelectorAll(".js-filter-chip")).forEach(function (chip) {
        chip.classList.remove("is-active");
      });
    });
  }
})();

function setupPlayer(sourceUrl) {
  var video = document.querySelector(".js-video-player");
  var cover = document.querySelector(".js-player-cover");
  var button = document.querySelector(".js-player-button");
  var message = document.querySelector(".js-player-message");
  var hlsInstance = null;
  var ready = false;

  if (!video || !sourceUrl) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add("is-visible");
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("播放暂时不可用，请稍后再试");
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          ready = false;
        }
      });
      return;
    }
    video.src = sourceUrl;
  }

  function playVideo() {
    prepare();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
        showMessage("点击播放按钮开始播放");
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }
  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      playVideo();
    });
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
}
