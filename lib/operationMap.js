'use strict';

module.exports = {
      divide: line('÷'),
      times: line('·')
}

function line(sign) {
  return `<mrow><mo>${sign}</mo></mrow>`;
}
