// Smart home — 3D apartment scene.
// Replaces the original Home Assistant climate screen with the interactive
// 3D apartment twin loaded in an iframe. No native bridge required.
// app.js calls window.smartHome.{available,open,close,move,ok,paint,reply,isOpen,icon}.
(function () {
  "use strict";

  var SCENE_URL = "smarthome-3d.html";
  var iframe = null;
  var open = false;

  function post(msg) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(msg, "*");
    }
  }

  function ensureIframe() {
    if (iframe) return;
    iframe = document.createElement("iframe");
    iframe.src = SCENE_URL;
    iframe.style.cssText = [
      "position:absolute",
      "top:0","right:0","bottom:0","left:0",
      "width:100%","height:100%",
      "border:none",
      "background:#0a0810"
    ].join(";");
    iframe.allow = "fullscreen";
    var el = document.getElementById("smart");
    // Remove padding from the #smart container so the iframe fills edge-to-edge.
    if (el) {
      el.style.padding = "0";
      el.style.position = "fixed";
      el.appendChild(iframe);
    }
  }

  var ICON = '<svg viewBox="0 0 24 24"><path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.8 9.5V20h12.4V9.5"/><path d="M10 20v-5.2h4V20"/></svg>';

  window.smartHome = {
    available: function () { return true; },
    isOpen:    function () { return open; },
    icon:      ICON,

    open: function () {
      open = true;
      ensureIframe();
      var el = document.getElementById("smart");
      if (el) el.classList.add("on");
      document.documentElement.classList.add("smarting");
    },

    close: function () {
      open = false;
      var el = document.getElementById("smart");
      if (el) el.classList.remove("on");
      document.documentElement.classList.remove("smarting");
    },

    // D-pad left/right/up/down forwarded from app.js
    move: function (dx, dy) {
      post({ type: "dpad", dx: dx, dy: dy });
    },

    // D-pad centre / OK
    ok: function () {
      post({ type: "ok" });
    },

    // Called by app.js after any focus change while smart zone is active
    paint: function () {},

    // Not used (no native Home Assistant bridge), kept for API compatibility
    reply: function () {},
  };
})();
