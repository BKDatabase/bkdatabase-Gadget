/**
 * RefToolbar
 *
 * Adds tools for citing references to the edit toolbar.
 * See [[w:Wikipedia:RefToolbar]] or [[BKDatabase:RefToolBar]] for further documentation. One of two
 * possible versions will load (Reftoolbar 1.0 or Reftoolbar 1.0)
 * depending on the user preferences (the usebetatoolbar preference).
 *
 * @see: [[w:Wikipedia:RefToolbar]] or [[BKDatabase:RefToolBar]]
 * @see: [[MediaWiki:RefToolbar.js]]
 * @see: [[MediaWiki:RefToolbarConfig.js]]
 * @see: [[MediaWiki:RefToolbarLegacy.js]]
 * @see: [[MediaWiki:RefToolbarMessages-en.js]]
 * @see: [[MediaWiki:RefToolbarMessages-vi.js]]
 * @see: [[MediaWiki:RefToolbarMessages-es.js]]
 * @see: [[MediaWiki:RefToolbarMessages-de.js]]
 * @see: [[MediaWiki:RefToolbarMessages-fr.js]]
 * @see: [[MediaWiki:RefToolbarMessages-ru.js]]
 * @see: [[MediaWiki:Gadget-refToolbarBase.js]]
 * @author: [[Wikipedia:User:Mr.Z-man]]
 * @author: [[Wikipedia:User:Kaldari]]
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true */
/*global $, mw, importScript */
( function () {
'use strict';
function initializeRefTools() {
	if ( window.refToolbarInstalled || $( '#wpTextbox1[readonly]' ).length ) {
		return;
	}
        // cast to number, support both 1 and "1" 
	if ( +mw.user.options.get( 'usebetatoolbar' ) === 1 ) {
		// Enhanced editing toolbar is on. Going to load RefToolbar 2.0.
		// TODO:
		// * Explicitly declare global variables from [[MediaWiki:RefToolbar.js]] using window.*
		// * Move [[MediaWiki:RefToolbar.js]] to [[MediaWiki:Gadget-refToolbarDialogs.js]]
		// * Create the module 'ext.gadget.refToolbarDialogs' depending on 'ext.gadget.refToolbarBase' and 'ext.wikiEditor'
		// * Replace the code below by mw.loader.load( 'ext.gadget.refToolbarDialogs' );
		mw.loader.using( [ 'ext.gadget.refToolbarBase', 'ext.wikiEditor' ], function () {
			importScript( 'MediaWiki:RefToolbar.js' );
		} );
	} else if ( mw.user.options.get( 'showtoolbar' ) ) {
		// Enhanced editing toolbar is off. Loading RefToolbar 1.0. (legacy)
		// importScript( 'MediaWiki:RefToolbarLegacy.js' );
	} else {
		return;
	}
	window.refToolbarInstalled = true;
}

if ( /^(edit|submit)$/.test( mw.config.get( 'wgAction' ) ) ) {
	// Double check if user.options is loaded, to prevent errors when copy pasted accross installations
	$.when( mw.loader.using( ['user.options'] ), $.ready ).then( initializeRefTools );
}

}() );
