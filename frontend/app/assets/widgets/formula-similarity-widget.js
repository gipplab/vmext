'use strict';

(function() { // iife - to encapsulate scope
  const script = document.currentScript;
  const widgetHost = script.src.match(new RegExp('(https?://)?[^/]*'))[0];
  const attributes = {
    reference_mathml: script.getAttribute('reference_mathml'),
    comparison_mathml: script.getAttribute('comparison_mathml'),
    similarities: script.getAttribute('similarities'),
    isInitialData: true,
    widgetHost,
  };

  // iframe element
  const iframe = document.createElement('iframe');
  iframe.classList.add('formel-similarities-iframe');
  iframe.src = `${widgetHost}/widgets/formula-similarity/index.html`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.onload = () => {
    const iframeWindow = iframe.contentWindow;
    iframeWindow.postMessage(attributes, '*');
    iframe.contentDocument.body.addEventListener('rendered', () => {
      document.dispatchEvent(new Event('astRendered', { targetIframe: iframe }));
    });
  };

  script.parentNode.replaceChild(iframe, script);
})();
