/**
 * Adds a [mark as patrolled] link to change list items, which have the red exclamation mark.
 */
/*global mw, $ */
/*jslint vars: true, unparam: true, white: true */
( function () {
	'use strict';

	if (
		mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Watchlist' &&
		mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Recentchanges' &&
		mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Recentchangeslinked'
	) {
		return;
	}

	var messages = 'markaspatrolleddiff';

	function markPatrolled( event ) {
		new mw.Api()
		.postWithToken( 'patrol', { formatversion: 2, action: 'patrol', revid: event.data.revid } )
		.then( function () {
			$( event.target ).closest( '.patrollink' ).remove();
		} );
		event.preventDefault();
	}

	function main( element ) {
		$( element ).find( 'abbr.unpatrolled' ).closest( 'li, tr' ).each( function () {
			var href = $( this ).find( 'a[href*="&diff="]' ).attr( 'href' );
			if ( href === undefined ) {
				return;
			}

			var revid = href.match( /&diff=(\d*)/ )[ 1 ];
			if ( revid === '0' ) {
				revid = href.match( /&oldid=(\d*)/ )[ 1 ];
			}

			var $target = this.nodeName === 'TR' ? $( this ).children( 'td:last' ) : $( this );

			$target
			.append( ' ',
				$( '<span>' ).addClass( 'patrollink' )
				.append( '[',
					$( '<a>' ).attr( 'href', '#' )
					.text( mw.msg( 'markaspatrolleddiff' ) )
					.click( { revid: revid }, markPatrolled ),
				']' )
			);
		} );
	}

	new mw.Api().loadMessages( messages )
	.then( function () {
		mw.hook( 'wikipage.content' ).add( main );
	} );

}() );
