/**
 * Smart Home Adapter — Google Home + Govee
 *
 * Handles:
 *   - Google Home OAuth 2.0 flow (one-time, tokens stored in localStorage)
 *   - Govee REST API via bridge proxy (key stored in localStorage)
 *   - Maps 3D panel device IDs → real device IDs
 *   - Intercepts lightState mutations and sends real commands
 *
 * Setup: include this script after smarthome-3d.html's </script> tag,
 * or load it from index.html when the smart home panel opens.
 *
 * Config is stored in localStorage under 'couchtv.smarthome.*'
 * No secrets are ever sent to any server except the intended API endpoints.
 */

(async function () {
  'use strict';

  // ── Config keys in localStorage ──────────────────────────────────────────
  var LS = {
    GOOGLE_CLIENT_ID:     'couchtv.smarthome.google_client_id',
    GOOGLE_CLIENT_SECRET: 'couchtv.smarthome.google_client_secret',
    GOOGLE_ACCESS_TOKEN:  'couchtv.smarthome.google_access_token',
    GOOGLE_REFRESH_TOKEN: 'couchtv.smarthome.google_refresh_token',
    GOOGLE_TOKEN_EXPIRY:  'couchtv.smarthome.google_token_expiry',
    GOVEE_API_KEY:        'couchtv.smarthome.govee_api_key',
    GOVEE_DEVICE_MAP:     'couchtv.smarthome.govee_device_map',
    GOOGLE_DEVICE_MAP:    'couchtv.smarthome.google_device_map',
  };

  // ── Google Home OAuth ─────────────────────────────────────────────────────
  var GOOGLE_SCOPE   = 'https://www.googleapis.com/auth/sdm.service';
  var GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  var GOOGLE_API_BASE  = 'https://smartdevicemanagement.googleapis.com/v1';

  function googleClientId()     { return localStorage.getItem(LS.GOOGLE_CLIENT_ID) || ''; }
  function googleClientSecret() { return localStorage.getItem(LS.GOOGLE_CLIENT_SECRET) || ''; }
  function googleAccessToken()  { return localStorage.getItem(LS.GOOGLE_ACCESS_TOKEN) || ''; }
  function googleRefreshToken() { return localStorage.getItem(LS.GOOGLE_REFRESH_TOKEN) || ''; }
  function googleTokenExpiry()  { return parseInt(localStorage.getItem(LS.GOOGLE_TOKEN_EXPIRY) || '0', 10); }

  function googleTokenValid() {
    return googleAccessToken() && Date.now() < googleTokenExpiry() - 60000;
  }

  function saveGoogleTokens(data) {
    localStorage.setItem(LS.GOOGLE_ACCESS_TOKEN, data.access_token);
    localStorage.setItem(LS.GOOGLE_TOKEN_EXPIRY, String(Date.now() + data.expires_in * 1000));
    if (data.refresh_token) localStorage.setItem(LS.GOOGLE_REFRESH_TOKEN, data.refresh_token);
  }

  async function googleRefreshAccessToken() {
    var r = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     googleClientId(),
        client_secret: googleClientSecret(),
        refresh_token: googleRefreshToken(),
        grant_type:    'refresh_token',
      }).toString(),
    });
    if (!r.ok) throw new Error('Google token refresh failed: ' + r.status);
    saveGoogleTokens(await r.json());
  }

  async function googleExchangeCode(code) {
    var redirectUri = window.location.origin + window.location.pathname;
    var r = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     googleClientId(),
        client_secret: googleClientSecret(),
        code:          code,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }).toString(),
    });
    if (!r.ok) throw new Error('Google code exchange failed: ' + r.status);
    saveGoogleTokens(await r.json());
    // Clean the code from the URL
    var url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('scope');
    window.history.replaceState({}, '', url.toString());
    log('Google Home: authorised successfully');
  }

  async function googleToken() {
    if (!googleTokenValid()) await googleRefreshAccessToken();
    return googleAccessToken();
  }

  function googleAuthUrl() {
    var redirectUri = window.location.origin + window.location.pathname;
    return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id:    googleClientId(),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope:        GOOGLE_SCOPE,
      access_type:  'offline',
      prompt:       'consent',
    }).toString();
  }

  // ── Govee REST API ────────────────────────────────────────────────────────
  var GOVEE_BASE = 'https://couch-tv-smarthome.couchtv.workers.dev';

  function goveeKey() { return localStorage.getItem(LS.GOVEE_API_KEY) || ''; }

  async function goveeRequest(path, method, body) {
    var opts = {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    var r = await fetch(GOVEE_BASE + path, opts);
    if (!r.ok) throw new Error('Govee API error: ' + r.status);
    return r.json();
  }

  async function goveeGetScenes(sku, deviceId) {
    return goveeRequest('/govee/scenes', 'POST', { requestId: 'scenes', payload: { sku, device: deviceId } });
  }

  async function goveeActivateScene(sku, deviceId, sceneCode) {
    return goveeControl(sku, deviceId, {
      type: 'devices.capabilities.dynamic_scene',
      instance: 'lightScene',
      value: sceneCode,
    });
  }

  async function goveeListDevices() {
    var data = await goveeRequest('/govee/devices');
    return (data.data || []);
  }

  async function goveeControl(sku, deviceId, capability) {
    return goveeRequest('/govee/control', 'POST', {
      requestId: Math.random().toString(36).slice(2),
      payload: { sku: sku, device: deviceId, capability: capability },
    });
  }

  async function goveeSetOn(sku, deviceId, on) {
    return goveeControl(sku, deviceId, {
      type: 'devices.capabilities.on_off',
      instance: 'powerSwitch',
      value: on ? 1 : 0,
    });
  }

  async function goveeSetBrightness(sku, deviceId, brightness) {
    // brightness is 0–1 float, Govee wants 1–100 integer
    var val = Math.max(1, Math.min(100, Math.round(brightness * 100)));
    return goveeControl(sku, deviceId, {
      type: 'devices.capabilities.range',
      instance: 'brightness',
      value: val,
    });
  }

  async function goveeSetColor(sku, deviceId, rgb) {
    var packed = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    return goveeControl(sku, deviceId, {
      type: 'devices.capabilities.color_setting',
      instance: 'colorRgb',
      value: packed,
    });
  }

  // ── Debounce helper — prevents 429s on slider drag ────────────────────────
  var debounceTimers = {};
  function debounce(key, fn, ms) {
    clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(fn, ms || 400);
  }

  // ── Device maps ───────────────────────────────────────────────────────────
  // Maps 3D panel IDs → real device info
  // Populated by discoverDevices() or set manually via setup UI
  // Stored in localStorage as JSON

  function goveeDeviceMap() {
    try { return JSON.parse(localStorage.getItem(LS.GOVEE_DEVICE_MAP) || '{}'); } catch(e) { return {}; }
  }

  function googleDeviceMap() {
    try { return JSON.parse(localStorage.getItem(LS.GOOGLE_DEVICE_MAP) || '{}'); } catch(e) { return {}; }
  }

  // ── Command dispatcher ────────────────────────────────────────────────────
  // Called whenever the 3D panel changes a device state.
  // Sends the command to the real API silently (3D panel already updated visually).

  async function dispatchCommand(panelId, changes) {
    var gmap = goveeDeviceMap();
    var entry = gmap[panelId];
    if (entry) {
      try {
        if ('on' in changes) await goveeSetOn(entry.sku, entry.device, changes.on);
        if ('brightness' in changes) debounce('bri:' + panelId, function() {
          goveeSetBrightness(entry.sku, entry.device, changes.brightness).catch(function(e) { log('Govee bri error: ' + e.message); });
        }, 400);
        if ('color' in changes) debounce('col:' + panelId, function() {
          goveeSetColor(entry.sku, entry.device, changes.color).catch(function(e) { log('Govee col error: ' + e.message); });
        }, 400);
      } catch(e) { log('Govee error for ' + panelId + ': ' + e.message); }
      return;
    }
    log('No real device mapped for: ' + panelId + ' — running in mock mode');
  }

  // ── Patch the 3D panel's lightState mutations ─────────────────────────────
  // We wrap the actions that the panel exposes so every real change also
  // dispatches to the API. The 3D scene already updated visually — we just
  // fire-and-forget the API call.

  function patchPanel() {
    if (!window.smartHome3D) { setTimeout(patchPanel, 200); return; }

    var orig = window.smartHome3D.setLightState;
    window.smartHome3D.setLightState = function(id, on, bri) {
      orig(id, on, bri);
      var changes = {};
      if (on != null) changes.on = on;
      if (bri != null) changes.brightness = bri;
      dispatchCommand(id, changes);
    };

    // Also intercept the iframe postMessage path used by Couch TV's d-pad
    var origMsg = window.addEventListener;
    window.addEventListener('smarthome:colorchange', function(e) {
      if (e.detail && e.detail.id && e.detail.color) {
        dispatchCommand(e.detail.id, { color: e.detail.color });
      }
    });

    log('Smart home adapter patched into 3D panel');
  }

  // ── Auto-discover Govee devices ───────────────────────────────────────────
  // Fetches real devices from Govee and tries to auto-map them to panel IDs
  // by matching device names. Shows results in the setup UI.

  async function discoverGoveeDevices() {
    if (!goveeKey()) return [];
    try {
      var devices = await goveeListDevices();
      log('Govee: found ' + devices.length + ' devices');
      return devices;
    } catch(e) {
      log('Govee discovery failed: ' + e.message);
      return [];
    }
  }

  // ── Setup UI ──────────────────────────────────────────────────────────────
  // A floating panel for entering credentials and mapping devices.
  // Shown when ?smarthome-setup is in the URL, or via window.smartHomeSetup.open()

  function buildSetupUI() {
    var el = document.createElement('div');
    el.id = 'sh-setup';
    el.style.cssText = [
      'position:fixed;top:0;right:0;bottom:0;width:420px;z-index:9999',
      'background:rgba(10,8,20,0.97);border-left:1px solid rgba(255,255,255,0.1)',
      'backdrop-filter:blur(24px);padding:32px 28px;overflow-y:auto',
      'font-family:system-ui,sans-serif;color:#fff;display:none',
    ].join(';');

    el.innerHTML = `
      <h2 style="font-size:17px;font-weight:600;margin-bottom:24px;letter-spacing:0.04em">
        Smart Home Setup
      </h2>

      <section style="margin-bottom:28px">
        <h3 style="font-size:12px;font-weight:600;text-transform:uppercase;opacity:0.5;margin-bottom:12px;letter-spacing:0.08em">
          Govee API
        </h3>
        <input id="sh-govee-key" type="password" placeholder="Govee API Key"
          style="width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
          border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:10px;outline:none">
        <button id="sh-govee-save" style="${btnStyle()}">Save &amp; Discover Devices</button>
        <div id="sh-govee-devices" style="margin-top:14px;font-size:13px;opacity:0.7"></div>
      </section>

      <section style="margin-bottom:28px">
        <h3 style="font-size:12px;font-weight:600;text-transform:uppercase;opacity:0.5;margin-bottom:12px;letter-spacing:0.08em">
          Google Home
        </h3>
        <input id="sh-google-client-id" type="text" placeholder="OAuth Client ID"
          style="width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
          border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:10px;outline:none">
        <input id="sh-google-client-secret" type="password" placeholder="OAuth Client Secret"
          style="width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
          border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;margin-bottom:10px;outline:none">
        <button id="sh-google-auth" style="${btnStyle()}">Authorise with Google</button>
        <div id="sh-google-status" style="margin-top:10px;font-size:13px;opacity:0.7"></div>
      </section>

      <button id="sh-setup-close" style="${btnStyle('rgba(255,255,255,0.05)')}">Close</button>
    `;

    document.body.appendChild(el);

    // Pre-fill saved values
    el.querySelector('#sh-govee-key').value = goveeKey();
    el.querySelector('#sh-google-client-id').value = googleClientId();
    el.querySelector('#sh-google-client-secret').value = googleClientSecret();

    // Govee save + discover
    el.querySelector('#sh-govee-save').addEventListener('click', async function() {
      var key = el.querySelector('#sh-govee-key').value.trim();
      if (!key) return;
      localStorage.setItem(LS.GOVEE_API_KEY, key);
      var out = el.querySelector('#sh-govee-devices');
      out.textContent = 'Discovering...';
      var devices = await discoverGoveeDevices();
      if (!devices.length) { out.textContent = 'No devices found or invalid key.'; return; }
      out.innerHTML = devices.map(function(d) {
        return '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.07)">' +
          '<b>' + esc(d.deviceName || d.device) + '</b>' +
          '<span style="opacity:0.5;margin-left:8px">' + esc(d.sku || '') + '</span>' +
          '<div style="font-size:11px;opacity:0.4;margin-top:2px">' + esc(d.device) + '</div>' +
          '</div>';
      }).join('');
    });

    // Google auth
    el.querySelector('#sh-google-auth').addEventListener('click', function() {
      var cid = el.querySelector('#sh-google-client-id').value.trim();
      var csec = el.querySelector('#sh-google-client-secret').value.trim();
      if (!cid || !csec) { el.querySelector('#sh-google-status').textContent = 'Enter Client ID and Secret first.'; return; }
      localStorage.setItem(LS.GOOGLE_CLIENT_ID, cid);
      localStorage.setItem(LS.GOOGLE_CLIENT_SECRET, csec);
      window.location.href = googleAuthUrl();
    });

    el.querySelector('#sh-setup-close').addEventListener('click', function() {
      el.style.display = 'none';
    });

    // Show Google auth status
    if (googleRefreshToken()) {
      el.querySelector('#sh-google-status').textContent = 'Authorised';
      el.querySelector('#sh-google-status').style.color = '#4ade80';
    }

    return el;
  }

  function btnStyle(bg) {
    return [
      'background:' + (bg || 'rgba(255,255,255,0.1)'),
      'border:1px solid rgba(255,255,255,0.15)',
      'border-radius:8px;padding:10px 18px;color:#fff',
      'font-size:13px;font-weight:500;cursor:pointer;width:100%',
    ].join(';');
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function log(msg) {
    console.log('[SmartHomeAdapter]', msg);
  }

  // ── Handle OAuth redirect ─────────────────────────────────────────────────
  async function handleOAuthRedirect() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    if (!code || !googleClientId() || !googleClientSecret()) return;
    try {
      await googleExchangeCode(code);
      var status = document.getElementById('sh-google-status');
      if (status) { status.textContent = 'Authorised'; status.style.color = '#4ade80'; }
    } catch(e) {
      log('OAuth redirect error: ' + e.message);
    }
  }

  // ── Public dispatch hook (called directly from smarthome-3d.html) ─────────
  window.dispatchSmartHomeCommand = function(panelId, changes) {
    dispatchCommand(panelId, changes);
  };

  // ── Public API ────────────────────────────────────────────────────────────
  var setupEl = null;

  window.smartHomeSetup = {
    open: function() {
      if (!setupEl) setupEl = buildSetupUI();
      setupEl.style.display = 'block';
    },
    close: function() {
      if (setupEl) setupEl.style.display = 'none';
    },
    // Map a 3D panel ID to a real Govee device
    // e.g. mapGovee('govee-floor-1', 'H6076', 'AA:BB:CC:DD:EE:FF:GG:HH')
    mapGovee: function(panelId, sku, deviceId) {
      var map = goveeDeviceMap();
      map[panelId] = { sku: sku, device: deviceId };
      localStorage.setItem(LS.GOVEE_DEVICE_MAP, JSON.stringify(map));
    },
    discoverGovee: discoverGoveeDevices,
    googleAuthUrl: googleAuthUrl,
    getGoveeScenes: async function(panelId) {
      var map = goveeDeviceMap();
      var entry = map[panelId];
      if (!entry) return [];
      var data = await goveeGetScenes(entry.sku, entry.device);
      return (data.data && data.data.capabilities) ? data.data.capabilities : [];
    },
    activateGoveeScene: async function(panelId, sceneCode) {
      var map = goveeDeviceMap();
      var entry = map[panelId];
      if (!entry) return;
      return goveeActivateScene(entry.sku, entry.device, sceneCode);
    },
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  handleOAuthRedirect();
  patchPanel();

  // Show setup if ?smarthome-setup in URL
  if (new URLSearchParams(window.location.search).has('smarthome-setup')) {
    if (!setupEl) setupEl = buildSetupUI();
    setupEl.style.display = 'block';
  }

  log('Adapter loaded — Govee key: ' + (goveeKey() ? 'set' : 'not set') +
      ', Google: ' + (googleRefreshToken() ? 'authorised' : 'not authorised'));

}());
