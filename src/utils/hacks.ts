function includes(s: string, needle: string) {
  return s.indexOf(needle) >= 0;
}

function isWebkit() {
  const ua = navigator.userAgent;
  return includes(ua, 'AppleWebKit') && !(includes(ua, 'Chrome') || includes(ua, 'Edge'));
}

export let DEV_NULL = 0;

// https://stackoverflow.com/questions/3485365/
// how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes/3485654#3485654
export function forceRedrawInWebkit() {
  if (!isWebkit()) {
    return;
  }
  const el = document.querySelector('body');
  if (el) {
    el.style.display = 'none';
    // No need to use el.offsetHeight. Just accessing it triggers redraw.
    // We store it just to prevent some optimizers to optimize it away :-)
    // Maybe this is not needed, but you can never know in crazy browser land.
    DEV_NULL = el.offsetHeight;
    el.style.display = 'block';
  }
}
