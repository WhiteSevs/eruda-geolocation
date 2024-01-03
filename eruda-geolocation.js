/* eslint-disable no-undef */
(function (root, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else {
    // eslint-disable-next-line no-undef
    root = typeof globalThis !== "undefined" ? globalThis : root || self;
    root.erudaGeolocation = factory(root);
  }
})(typeof window !== "undefined" ? window : this, function () {
  return function (eruda) {
    let { evalCss } = eruda.util;
    function loadCss(src, container) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = src;
      (container || document.head || document.documentElement).appendChild(
        link
      );
    }
    function loadJs(src, cb) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = function () {
        var isNotLoaded =
          script.readyState &&
          script.readyState != "complete" &&
          script.readyState != "loaded";

        cb && cb(!isNotLoaded);
      };
      (document.body || document.head || document.documentElement).appendChild(
        script
      );
    }
    class Geolocation extends eruda.Tool {
      constructor() {
        super();
        this.name = "geolocation";
        this._style = evalCss(
          [
            ".eruda-geolocation {position: relative;}",
            ".eruda-map {position: absolute;left: 0;top: 0;width: 100%;height: 100%;}",
            ".eruda-info{position:absolute;bottom:0;left:0;background:var(--darker-background);padding:10px;color:var(--foreground);width:100%;border-top:1px solid var(--border);z-index:1000}",
          ].join(".eruda-dev-tools .eruda-tools .eruda-geolocation ")
        );
      }
      init($el, container) {
        super.init($el, container);
        $el.html(`
              <div id="eruda-map" class="eruda-map"></div>
              <div class="eruda-info">test</div>
          `);
        this._initMap();
        this._$info = this._$el.find(".eruda-info");
      }
      show() {
        super.show();
        this.resetView();
      }
      resetView() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            var coords = position.coords,
              longitude = coords.longitude,
              latitude = coords.latitude;

            this.setView(latitude, longitude);
          },
          (e) => {
            this.setInfo(e.message);
          }
        );
      }
      setView(latitude, longitude) {
        if (!this._map) return;
        /* 设置地图中心点，经纬度 */
        this._map.setView([latitude, longitude], 13);
        /* 标记 */
        if (this._marker) {
          this._marker?.remove();
          this._marker = L.marker([latitude, longitude]).addTo(this._map);
        }
        /* 重新绘图大小【重要】 */
        this._map.invalidateSize();
        this.setInfo("latitude: " + latitude + " " + "longitude: " + longitude);
      }
      setInfo(text) {
        this._$info.text(text);
      }
      hide() {
        super.hide();
      }
      destroy() {
        super.destroy();
        evalCss.remove(this._style);
      }
      _initMap() {
        /* 资源地址 */
        let srcPathName = "https://unpkg.com/leaflet@1.9.4/dist/";
        loadCss(srcPathName + "leaflet.css", this._$el.get(0));
        loadJs(srcPathName + "leaflet.js", (isLoaded) => {
          if (!isLoaded) return this.setInfo("Failed to init map");
          L.Icon.Default.imagePath = srcPathName + "images/";
          this.setInfo("Map successfully initialized");
          this._map = L.map(this._$el.find("#eruda-map").get(0)).setView(
            [39.9, 116.39],
            13
          );
          this._marker = L.marker([39.9, 116.39]).addTo(this._map);
          // eslint-disable-next-line no-undef
          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            /* id: "mapbox.streets", */
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }).addTo(this._map);

          this.resetView();

          this._map.whenReady(() => {
            setTimeout(() => {
              this._map.invalidateSize();
            }, 0);
          });
        });
      }
    }
    return new Geolocation();
  };
});
