( function( $, mw ) {
$alert = '<div id="mw-echo-sliding-alert">';
$alert += '<div id="mw-echo-close-box"><img style="display: block;" src="//upload.wikimedia.org/wikipedia/commons/3/36/CloseWindow.svg"/></div>';
$alert += '<div id="mw-echo-alert-text">You have <a href="#" id="mw-echo-talk-link">new messages</a>. (<a href="#" id="mw-echo-talk-diff-link">view changes</a>)</div>';
$alert += '</div>';
$(document).ready(function() {
	var newMsgRevisionId = mw.config.get( 'wgUserNewMsgRevisionId' );
	if ( newMsgRevisionId ) {
		var userName = mw.config.get( 'wgUserName' );
		var talkLink = '/wiki/User_talk:' + userName + '?redirect=no';
		var diffLink = '/w/index.php?title=User_talk:' + userName + '&oldid=' + newMsgRevisionId + '&diff=cur';
		$( 'body' ).append( $alert );
		$( '#mw-echo-close-box' ).click( function( e ) {
			$( '#mw-echo-sliding-alert' ).hide();
			e.preventDefault();
		} );
		$( 'a#mw-echo-talk-link' ).attr( 'href', talkLink );
		$( 'a#mw-echo-talk-diff-link' ).attr( 'href', diffLink );
		mw.config.set( 'echoNewMsgAlertDisplayed', true );
	}
} );
} )( jQuery, mediaWiki );