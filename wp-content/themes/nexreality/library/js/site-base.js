/**
 * GitHub Pages project sites live at https://<host>/<repo>/...
 * If the site is opened without the repo segment (e.g. /social-ar/... instead of /nexreality-io/social-ar/...),
 * relative links like ../glb-viewer/ resolve to the wrong origin path. This script normalizes the URL early.
 */
(function () {
  var REPO = 'nexreality-io';
  var host = location.hostname;
  if (host !== 'nexreality.github.io') {
    window.__SITE_BASE__ = '';
    return;
  }

  var path = location.pathname;
  var segs = path.split('/').filter(Boolean);
  var first = segs[0] || '';

  if (path === '/' || path === '/index.html') {
    location.replace('/' + REPO + '/index.html');
    return;
  }

  var topLevelSiteRoots = [
    'social-ar',
    'contact',
    'projects',
    'glb-viewer',
    'about-us',
    'blog',
    'wp-content',
    'use.typekit.net',
    'frog-animation',
    'mediapipe',
    'rotimatic',
    'shadespot',
    'evendi',
    'ice_sculptures',
    'demo_01',
    'demo_02',
    'demo_03',
    'demo_04',
    'demo_05',
    'demo_06',
    'demo_07',
    'demo_08',
    'demo_11',
    'demo_12'
  ];

  if (first && first !== REPO && topLevelSiteRoots.indexOf(first) !== -1) {
    location.replace('/' + REPO + path);
    return;
  }

  window.__SITE_BASE__ = first === REPO ? '/' + REPO + '/' : '';
})();
