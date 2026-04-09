/**
 * After Barba.js SPA transitions, re-run homepage horizontal-scroll setup.
 * FadeTransition already calls horizontalScrolling(), but layout/event binding can
 * occasionally be incomplete; a follow-up pass restores wheel/drag scrolling on desktop.
 */
(function ($) {
  if (typeof Barba === 'undefined' || typeof Barba.Dispatcher === 'undefined') return;

  Barba.Dispatcher.on('transitionCompleted', function () {
    if (!$('body').hasClass('home') || $(window).width() < 1020) return;
    var x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    setTimeout(function () {
      if (typeof stuffForResizeAndReady === 'function') stuffForResizeAndReady();
      if (typeof horizontalScrolling === 'function') horizontalScrolling(x);
    }, 650);
  });
})(jQuery);
