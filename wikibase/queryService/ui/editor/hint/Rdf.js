var wikibase = wikibase || {};
wikibase.queryService = wikibase.queryService || {};
wikibase.queryService.ui = wikibase.queryService.ui || {};
wikibase.queryService.ui.editor = wikibase.queryService.ui.editor || {};
wikibase.queryService.ui.editor.hint = wikibase.queryService.ui.editor.hint || {};

( function( $, wikibase ) {
	'use strict';

	var MODULE = wikibase.queryService.ui.editor.hint;

	/**
	 * Code completion for Wikibase entities RDF prefixes in SPARQL completes SPARQL keywords and ?variables
	 *
	 * @class wikibase.queryService.ui.editor.hint.Rdf licence GNU GPL v2+
	 *
	 * @author Jonas Kress
	 * @param {wikibase.queryService.api.Wikibase} api
	 * @param {wikibase.queryService.RdfNamespaces} rdfNamespaces
	 * @constructor
	 */
	var SELF = MODULE.Rdf = function( api, rdfNamespaces ) {
		this._api = api;
		this._rdfNamespaces = rdfNamespaces;

		if ( !this._api ) {
			this._api = new wikibase.queryService.api.Wikibase();
		}

		if ( !this._rdfNamespaces ) {
			this._rdfNamespaces = wikibase.queryService.RdfNamespaces;
		}
	};

	/**
	 * @property {wikibase.queryService.RdfNamespaces}
	 * @private
	 */
	SELF.prototype._rdfNamespaces = null;

	/**
	 * @property {wikibase.queryService.api.Wikibase}
	 * @private
	 */
	SELF.prototype._api = null;

	/**
	 * Get list of hints
	 *
	 * @return {jQuery.Promise} Returns the completion as promise ({list:[], from:, to:})
	 */
	SELF.prototype.getHint = function( editorContent, lineContent, lineNum, cursorPos ) {
		var deferred = new $.Deferred(),
			currentWord = this._getCurrentWord( lineContent, cursorPos ),
			list,
			term,
			self = this;
		if ( !currentWord.word.match( /^Q.*/ ) ) {
			return deferred.reject().promise();
		}

		term = currentWord.word.trim().substr(1);

		if ( term.length === 0 ) { // empty search term
			list = [ {
				text: term,
				displayText: 'Type to search for an entity'
			} ];
			return deferred.resolve( this._getHintCompletion( lineNum, currentWord, list ) )
					.promise();
		}

			this._searchEntities( term, 'item').done(
					function( list ) {
						return deferred.resolve( self._getHintCompletion( lineNum, currentWord,
								 list ) );
					} );

		return deferred.promise();
	};


	SELF.prototype._getHintCompletion = function( lineNum, currentWord, list ) {
		var completion = {
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
	};

	SELF.prototype._searchEntities = function( term, type ) {
		var entityList = [],
			deferred = $.Deferred();

		this._api.searchEntities( term, type ).done( function( data ) {
			$.each( data.search, function( key, value ) {
				entityList.push( {
					className: 'wikibase-rdf-hint',
					text: value.id,
					displayText: value.label + ' (' + value.id + ') ' + value.description + '\n'
				} );
			} );

			deferred.resolve( entityList );
		} );

		return deferred.promise();
	};

	SELF.prototype._getCurrentWord = function( line, position ) {
		var pos = position - 1,
			wordSeparator = [ '>','<'];

		if ( pos < 0 ) {
			pos = 0;
		}

		while ( '>'.indexOf( line.charAt( pos ) ) === -1 ) {
			pos--;
			if ( pos < 0 ) {
				break;
			}
		}
		var left = pos + 1;

		pos = position;
		while ( '<'.indexOf( line.charAt( pos ) ) === -1 ) {
			pos++;
			if ( pos >= line.length ) {
				break;
			}
		}
		var right = pos;

		var word = line.substring( left, right );
		return {
			word: word,
			start: left,
			end: right
		};
	};

}( jQuery, wikibase ) );
