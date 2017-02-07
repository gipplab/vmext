'use strict';

(function() { // iife - to encapsulate scope
  const script = document.currentScript;
  const attributes = {
    mathml: script.getAttribute('mathml'),
    collapseSingleOperandNodes: script.getAttribute('collapseSingleOperandNodes') || 'false',
    nodesToBeCollapsed: script.getAttribute('nodesToBeCollapsed') || '[""]',
    bgColor: script.getAttribute('bgColor') || '#fff',
    formulaIdentifier: script.getAttribute('formulaIdentifier') || 'A',
    isInitialData: true,
  };

  // iframe element
  const iframe = document.createElement('iframe');
  iframe.classList.add('abstract-syntaxtree-iframe');
  iframe.src = 'http://localhost:4001/widgets/formula-ast/index.html';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.onload = () => {
    const iframeWindow = iframe.contentWindow;
    iframeWindow.postMessage(attributes, '*');
  };

  script.parentNode.replaceChild(iframe, script);
})();
