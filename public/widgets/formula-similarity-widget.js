'use strict';

(function(){ // iife - to encapsulate scope
  const script = document.currentScript;
  const attributes = {
    reference_mathml: script.getAttribute('reference_mathml'),
    comparison_mathml: script.getAttribute('comparison_mathml'),
    similarities: script.getAttribute('similarities'),
  }
  const queryParams = encodeQueryParams(attributes);

  //iframe element
  const iframe = document.createElement('iframe');
  iframe.src = `http://math.citeplag.org/widgets/formula-similarity/index.html?${queryParams}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  script.parentNode.replaceChild(iframe, script);

  function encodeQueryParams({ reference_mathml, comparison_mathml, similarities }) {
    const queryParams = new URLSearchParams();
    queryParams.append('reference_mathml', reference_mathml);
    queryParams.append('comparison_mathml', comparison_mathml);
    queryParams.append('similarities', similarities);
    return queryParams.toString();
  }
})();
