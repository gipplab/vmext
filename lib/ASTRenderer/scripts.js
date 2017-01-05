//<![CDATA[
  var nodes = document.querySelectorAll('.node');
  for (var i = 0; i < nodes.length; i++) {
    var mainFormulaContainer = document.querySelector('.header__formula');
    nodes[i].addEventListener('mouseover', function(evt) {
      debugger;
      var escapedID = evt.currentTarget.attributes['data-xref'].value.replace(/\./g, '\\.');
      mainFormulaContainer.querySelector('#' + escapedID).style.fill = '#e01818';
    });
    nodes[i].addEventListener('mouseout', function(evt) {
      var escapedID = evt.currentTarget.attributes['data-xref'].value.replace(/\./g, '\\.');
      mainFormulaContainer.querySelector('#' + escapedID).style.removeProperty('fill');
    });
  }
//]]>
