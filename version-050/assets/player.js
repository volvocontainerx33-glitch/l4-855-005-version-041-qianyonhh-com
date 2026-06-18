(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");
    var hls = null;
    var connected = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    function attach(autoPlay) {
      if (connected) {
        if (autoPlay) {
          playVideo();
        }
        return;
      }
      connected = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        if (autoPlay) {
          playVideo();
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoPlay) {
            playVideo();
          }
        });
      } else {
        video.src = streamUrl;
        if (autoPlay) {
          playVideo();
        }
      }
    }

    function begin() {
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      attach(true);
    }

    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
