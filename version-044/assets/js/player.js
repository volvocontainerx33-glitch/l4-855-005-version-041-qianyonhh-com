(function () {
    function initPlayer(source) {
        var shell = document.querySelector("[data-player-shell]");
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var hls = null;
        var loaded = false;
        var requested = false;

        if (!shell || !video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            requested = true;
            loadSource();
            shell.classList.add("is-playing");
            video.controls = true;

            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });

        video.addEventListener("loadedmetadata", function () {
            if (requested) {
                var attempt = video.play();

                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initPlayer = initPlayer;
})();
