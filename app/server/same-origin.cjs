'use strict';
// Default ports are equivalent. A Referer supports older Chromium, which does
// not send Sec-Fetch-Site. Never accept a missing or cross-site source.
module.exports = function sameOrigin(req) {
  try {
    const expected = new URL('http://' + req.headers.host).origin;
    const site = req.headers['sec-fetch-site'];
    if (site && site !== 'same-origin' && site !== 'none') return false;
    if (req.headers.origin) return new URL(req.headers.origin).origin === expected;
    return !!req.headers.referer && new URL(req.headers.referer).origin === expected;
  } catch { return false; }
};
