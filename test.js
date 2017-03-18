const svg = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20class%3D%22ltx_Math%22%20id%3D%22A%22%20width%3D%221.808ex%22%20height%3D%221.343ex%22%20style%3D%22vertical-align%3A%200.307ex%3B%22%20viewBox%3D%220%20-504.3%20778.5%20578.1%22%20role%3D%22img%22%20focusable%3D%22false%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cdefs%3E%0A%3Cpath%20stroke-width%3D%221%22%20id%3D%22E1-MJMAIN-3D%22%20d%3D%22M56%20347Q56%20360%2070%20367H707Q722%20359%20722%20347Q722%20336%20708%20328L390%20327H72Q56%20332%2056%20347ZM56%20153Q56%20168%2072%20173H708Q722%20163%20722%20153Q722%20140%20707%20133H70Q56%20140%2056%20153Z%22%3E%3C%2Fpath%3E%0A%3C%2Fdefs%3E%0A%3Cg%20stroke%3D%22currentColor%22%20fill%3D%22currentColor%22%20stroke-width%3D%220%22%20transform%3D%22matrix(1%200%200%20-1%200%200)%22%3E%0A%3Cg%20id%3D%22A.4%22%20xref%3D%22A.4.cmml%22%3E%0A%20%3Cuse%20xlink%3Ahref%3D%22%23E1-MJMAIN-3D%22%3E%3C%2Fuse%3E%0A%3C%2Fg%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E';


function transformSVGToPixelUnits(svgdata) {
  const widthInEXUnit = svgdata.match('width%3D%22([0-9]*.[0-9]*)ex')[1];
  const heightInEXUnit = svgdata.match('height%3D%22([0-9]*.[0-9]*)ex')[1];
  svgdata = svgdata.replace(/width%3D%22[0-9]*.[0-9]*ex/, `width%3D%22${widthInEXUnit * 9}px`);
  svgdata = svgdata.replace(/height%3D%22[0-9]*.[0-9]*ex/, `height%3D%22${heightInEXUnit * 9}px`);
  return svgdata;
}

console.log(transformSVGToPixelUnits(svg));
