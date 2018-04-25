'use strict';

const $ = require('jquery');
const Wikibase = require('./Wikibase');

function getCurrentWord(line, position) {
  let pos = position - 1;

  if (pos < 0) {
    pos = 0;
  }

  while ('>'.indexOf(line.charAt(pos)) === -1) {
    pos--;
    if (pos < 0) {
      break;
    }
  }
  const left = pos + 1;

  pos = position;
  while ('<'.indexOf(line.charAt(pos)) === -1) {
    pos++;
    if (pos >= line.length) {
      break;
    }
  }
  const right = pos;

  const word = line.substring(left, right);
  return {
    word,
    start: left,
    end: right
  };
}

function getHintCompletion(lineNum, currentWord, list) {
  const completion = {
    list: []
  };
  completion.from = {
    line: lineNum,
    char: currentWord.start
  };
  completion.to = {
    line: lineNum,
    char: currentWord.end
  };
  completion.list = list;

  return completion;
}

function searchEntities(term, type) {
  const entityList = [];
  const deferred = $.Deferred();

  (new Wikibase()).searchEntities(term, type).done((data) => {
    $.each(data.search, (key, value) => {
      entityList.push({
        className: 'wikibase-rdf-hint',
        text: value.id,
        displayText: value.label + ' (' + value.id + ') ' + value.description + '\n'
      });
    });

    deferred.resolve(entityList);
  });

  return deferred.promise();
}

/**
 * Get list of hints
 * @return {jQuery.Promise} Returns the completion as promise ({list:[], from:, to:})
 */
function getHint(lineContent, lineNum, cursorPos) {
  const deferred = new $.Deferred();
  const currentWord = getCurrentWord(lineContent, cursorPos);
  let list;
  if (!currentWord.word.match(/^Q.*/)) {
    return deferred.reject().promise();
  }

  const term = currentWord.word.trim().substr(1);

  if (term.length === 0) { // empty search term
    list = [ {
      text: term,
      displayText: 'Type to search for an entity'
    } ];
    return deferred.resolve(getHintCompletion(lineNum, currentWord, list))
      .promise();
  }

  searchEntities(term, 'item').done(
    (list) => {
      return deferred.resolve(getHintCompletion(lineNum, currentWord,
        list));
    });

  return deferred.promise();
}

