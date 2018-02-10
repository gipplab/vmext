'use strict';

function line(sign) {
  return `<mrow><mo>${sign}</mo></mrow>`;
}

module.exports = {
  divide: line('÷'),
  times: line('·'),
  power: line('^'),
  sqrt: line('√'),
  partialdiff: line('∂')
};
