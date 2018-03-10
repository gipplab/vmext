'use strict';

/**
 * This file contains default values, enums and functions used by both widgets
 */
const Dimension = {
  WIDTH: 'width',
  HEIGHT: 'height',
};

const defaults = {
  minNodeSize: 30,
  exScalingFactor: 9,
  nodeHoverScaling: 1.2,
  color: {
    referenceNode: '#EDF1FA',
    referenceNodeHighlight: '#d5e1fd',
    comparisonNode: '#edfaf1',
    comparisonNodeHighlight: '#d6f5e0',
    singleAST: '#FFF',
  },
  borderWidth: '2px',
  animation: {
    nodeCollapsing: 400,
  }
};

const highlightNode = (node) => {
  const newWidth = Math.floor(node.style('width').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  const newHeight = Math.floor(node.style('height').match('([0-9]*.[0-9]*)px')[1]) * defaults.nodeHoverScaling;
  node.data('oldWidth', node.style('width'));
  node.data('oldHeight', node.style('height'));
  node.data('oldColor', node.style('background-color'));
  node.css('width', newWidth);
  node.css('height', newHeight);
  node.css('background-color', '#c4e4ff');
};

const unhighlightNode = (node) => {
  node.css('width', node.data('oldWidth'));
  node.css('height', node.data('oldHeight'));
  node.css('background-color', node.data('oldColor'));
};

const highlightNodeAndSuccessors = (node) => {
  highlightNode(node);
  node.successors().nodes().forEach((ele) => {
    if (!ele.data('isHidden')) { highlightNode(ele); }
  });
};

const unhighlightNodeAndSuccessors = (node) => {
  unhighlightNode(node);
  node.successors().nodes().forEach((ele) => {
    if (!ele.data('isHidden')) { unhighlightNode(ele); }
  });
};

const toggleErrorDeails = () => {
  document.querySelector('.error-details').classList.toggle('error-details--display');
};

const throttle = (callback, limit) => {
  let wait = false;
  return () => {
    if (!wait) {
      callback.call();
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
};

function debounce(func, wait, immediate) {
  let timeout;
  return () => {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) { func.apply(context, args); }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) { func.apply(context, args); }
  };
}
