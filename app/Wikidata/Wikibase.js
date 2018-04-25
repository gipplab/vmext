'use strict';

const $ = require('jquery');

const API_ENDPOINT = 'https://www.wikidata.org/w/api.php';
const
  LANGUAGE = 'en';

const
  SEARCH_ENTITES = {
    action: 'wbsearchentities',
    format: 'json',
    limit: 50,
    continue: 0,
    language: LANGUAGE,
    uselang: LANGUAGE
  };
const
  QUERY_LANGUGES = {
    action: 'query',
    meta: 'siteinfo',
    format: 'json',
    siprop: 'languages'
  };
const
  QUERY_LABELS = {
    action: 'wbgetentities',
    props: 'labels',
    format: 'json',
    languages: LANGUAGE,
    languagefallback: '1'
  };
const
  QUERY_DATATYPE = {
    action: 'wbgetentities',
    props: 'datatype',
    format: 'json'
  };

class Wikibase {
  /**
   * API for the Wikibase API
   * @class wikibase.queryService.api.Wikibase
   * @license GNU GPL v2+
   *
   * @author Jonas Kress
   * @constructor
   * @param {string} endpoint default: 'https://www.wikidata.org/w/api.php'
   * @param defaultLanguage
   */
  constructor(endpoint, defaultLanguage) {
    this._endpoint = API_ENDPOINT;

    if (endpoint) {
      this._endpoint = endpoint;
    }

    if (defaultLanguage) {
      this._language = defaultLanguage;
    }
  }

  /**
   * Search an entity with using wbsearchentities
   * @param {string} term search string
   * @param {string} type entity type to search for
   * @param {string} language of search string default:en
   *
   * @return {jQuery.Promise}
   */
  searchEntities(term, type, language) {
    const query = SEARCH_ENTITES;
    query.search = term;

    if (type) {
      query.type = type;
    }
    if (this._language || language) {
      query.language = language || this._language;
      query.uselang = language || this._language;
    } else {
      query.language = LANGUAGE;
      query.uselang = LANGUAGE;
    }

    return this._query(query);
  }

  /**
   * List of supported languages
   * @return {jQuery.Promise}
   */
  getLanguages() {
    return this._query(QUERY_LANGUGES);
  }

  /**
   * Get labels for given entities
   * @param {string|string[]} ids entity IDs
   * @return {jQuery.Promise}
   */

  getLabels(ids) {

    if (typeof ids === 'string') {
      ids = [ids];
    }

    const query = QUERY_LABELS;
    query.ids = ids.join('|');

    if (this._language) {
      query.languages = this._language;
    }

    return this._query(query);
  };

  /**
   * Get datatype of property
   * @param {string} id property ID
   * @return {jQuery.Promise}
   */

  getDataType(id) {
    const query = QUERY_DATATYPE;
    const deferred = $.Deferred();

    query.ids = id;

    this._query(query).done((data) => {
      if (data.entities && data.entities[id] && data.entities[id].datatype) {
        deferred.resolve(data.entities[id].datatype);
      }
      deferred.reject();

    }).fail(deferred.reject);

    return deferred.promise();
  }

  /**
   * @private
   */
  _query(query) {
    return $.ajax({
      url: this._endpoint + '?' + $.param(query),
      dataType: 'jsonp'
    });
  }

  /**
   * Set the default language
   * @param {string} language of search string default:en
   */
  setLanguage(language) {
    this._language = language;
  }
}

module.exports = Wikibase;
