//<![CDATA[
  var nodes = document.querySelectorAll('.node.node--internal');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].addEventListener('mouseover', function(evt) {
      var escapedID = evt.currentTarget.attributes['data-xref'].value.replace(/\./g, '\\.');
      document.querySelector('#' + escapedID).oldcolor = document.querySelector('#' + escapedID).style.color;
      document.querySelector('#' + escapedID).style.color = "red";
    });
    nodes[i].addEventListener('mouseout', function(evt) {
      var escapedID = evt.currentTarget.attributes['data-xref'].value.replace(/\./g, '\\.');
        document.querySelector('#' + escapedID).style.color = document.querySelector('#' + escapedID).oldcolor;
    });
  }
//]]>
