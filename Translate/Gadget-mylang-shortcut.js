/**
 * My language shortcut
 *
 * Adds a shortcut link below the language selector in Special:Translate
 * if you're translating into a language that is different from your
 * interface language. It saves you a click (and potentially some
 * waiting time) by not having to open the language selector and
 * finding your language in the list.
 *
 * Technically, `ext.translate.special.translate` could be considered
 * a dependency for this script, in order to use functions like
 * `mw.translate.changeLanguage()`. However, it is not added as a
 * dependency in MediaWiki:Gadgets-definition because that would
 * lead that module to be loaded everywhere all the time, instead
 * of this code only executing when the module is loaded (via the
 * JavaScript hook).
 *
 * @author Jon Harald Søby
 * @version 1.1.1 (2025-04-22)
 */

( function() {
	// Only enable on Special:Translate
	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Translate' ) return;

	const userLanguage = mw.config.get( 'wgUserLanguage' );

	mw.hook( 'mw.translate.translationView.stateChange' ).add( function( state ) {
		// Do nothing if we're already translating into our language
		if ( state.language === userLanguage ) {
			$( '#gadget-mylanglink' ).remove();
			return;
		}

		mw.translate.getMessageGroup( state.group, 'sourcelanguage' ).done( function( data ) {
			const sourceLanguage = data.sourcelanguage;

			// Do nothing if our language is the source language (because you
			// can't translate into the same language as the source)
			if ( sourceLanguage === userLanguage) {
				$( '#gadget-mylanglink' ).remove();
				return;
			}

			new mw.Api().loadMessagesIfMissing( [
				'tux-languageselector',
				'word-separator'
			] ).then( function() {
				const url = new URL( location.href );
				url.searchParams.set( 'language', userLanguage );

				const languageDetails = mw.translate.getLanguageDetailsForHtml( userLanguage );

				const $myLangLink = $( '<a>' )
					.attr( 'href', url.toString() )
					.text( languageDetails.autonym );
				const $myLangLabel = $( '<div>' )
					.attr( 'id', 'gadget-mylanglink' )
					.text( mw.msg( 'tux-languageselector' ) + mw.msg( 'word-separator' ) )
					.css( 'font-size', 'smaller' )
					.append( $myLangLink );

				$myLangLink.on( 'click', function( e ) {
					// Behave as a normal link if Alt, Ctrl or Shift are pressed
					const oe = e.originalEvent;
					if ( oe.altKey || oe.ctrlKey || oe.shiftKey ) return;

					e.preventDefault();

					// Use Special:Translate's built-in functionality to switch language
					// without reloading the page.
					mw.translate.changeLanguage( userLanguage );
					$( '.ext-translate-language-selector .ext-translate-target-language' )
						.text( languageDetails.autonym )
						.attr( 'lang', userLanguage )
						.attr( 'dir', languageDetails.direction );
					$myLangLabel.remove();
				} );

				if ( $( '#gadget-mylanglink' ).length ) {
					// If a shortcut link is already present, just amend its URL
					$( '#gadget-mylanglink a' ).attr( 'href', url );
				} else {
					// If a shortcut link is not present, add it
					$( '.ext-translate-language-selector' ).append( $myLangLabel );
				}
			} );
		} );
	} );
} )();
