'use strict';

(function() { // iife - to encapsulate scope
  const script = document.currentScript;
  const attributes = {
    mathml: script.getAttribute('mathml'),
    collapseSingleOperandNodes: script.getAttribute('collapseSingleOperandNodes'),
    nodesToBeCollapsed: script.getAttribute('nodesToBeCollapsed'),
  }
  const queryParams = encodeQueryParams(attributes);

  //iframe element
  const iframe = document.createElement('iframe');
  iframe.src = `http://math.citeplag.org/widgets/formula-ast/index.html?${queryParams}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  script.parentNode.replaceChild(iframe, script);

  function encodeQueryParams({ mathml, collapseSingleOperandNodes, nodesToBeCollapsed }) {
    const queryParams = new URLSearchParams();
    queryParams.append('mathml', mathml);
    queryParams.append('collapseSingleOperandNodes', collapseSingleOperandNodes);
    queryParams.append('nodesToBeCollapsed', nodesToBeCollapsed);
    return queryParams.toString();
  }
})();
