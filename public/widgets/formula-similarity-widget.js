'use strict';

(function() { // iife - to encapsulate scope
  const script = document.currentScript;
  const attributes = {
    reference_mathml: script.getAttribute('reference_mathml'),
    comparison_mathml: script.getAttribute('comparison_mathml'),
    similarities: script.getAttribute('similarities'),
    isInitialData: true,
  };

  // iframe element
  const iframe = document.createElement('iframe');
  iframe.classList.add('formel-similarities-iframe');
  iframe.src = 'http://math.citeplag.org/widgets/formula-similarity/index.html';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.onload = () => {
    const iframeWindow = iframe.contentWindow;
    iframeWindow.postMessage(attributes, '*');
  };

  script.parentNode.replaceChild(iframe, script);
})();
