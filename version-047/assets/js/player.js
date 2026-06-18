(function () {
  function run(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMoviePlayer(sourceUrl) {
    run(function () {
      var video = document.getElementById("movie-video");
      var button = document.getElementById("player-start");
      var message = document.getElementById("player-message");
      if (!video || !button || !sourceUrl) {
        return;
      }

      var hls = null;
      var loaded = false;
      var loading = false;
      var pendingPlay = false;

      function showMessage(text) {
        if (message) {
          message.style.display = "block";
          message.textContent = text;
        }
      }

      function hideButton() {
        button.style.display = "none";
        video.setAttribute("controls", "controls");
      }

      function playVideo() {
        hideButton();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            button.style.display = "flex";
          });
        }
      }

      function loadSource() {
        if (loaded || loading) {
          return;
        }
        loading = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            loading = false;
            if (pendingPlay) {
              playVideo();
            }
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              loading = false;
              showMessage("视频加载失败，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
          loaded = true;
          loading = false;
        } else {
          loading = false;
          showMessage("当前浏览器暂不支持此视频播放");
        }
      }

      function start() {
        pendingPlay = true;
        if (!loaded) {
          loadSource();
        }
        if (loaded) {
          playVideo();
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
          return;
        }
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
