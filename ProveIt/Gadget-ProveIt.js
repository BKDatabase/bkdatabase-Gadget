/**
 * ProveIt is a reference manager for Wikipedia and any other MediaWiki wiki
 * Documentation: https://www.mediawiki.org/wiki/ProveIt
 * Source code: https://www.mediawiki.org/wiki/MediaWiki:Gadget-Global-ProveIt.js
 */
function loadProveIt() {
	mw.config.set( {

		// Local citation templates (without namespace)
		'proveit-templates': [
			'Chú thích',
			'Chú thích sách',
			'Chú thích bách khoa toàn thư',
			'Chú thích tạp chí',
			'Chú thích báo',
			'Chú thích thông cáo báo chí',
			'Chú thích video',
			'Chú thích web'
		],

		// Supported namespaces, see https://www.mediawiki.org/wiki/Manual:Namespace_constants
		'proveit-namespaces': [ 0, 2, 3000, 3002 ],

		// Revision tag defined at Special:Tags
		'proveit-tag': 'Sửa đổi bằng ProveIt',

		// Automatic edit summary
		'proveit-summary': 'Sửa đổi tham khảo bằng [[c:Help:Gadget-ProveIt|ProveIt]]',
	} );

	// Load from the central, global version at MediaWiki.org
	mw.loader.load( '//www.mediawiki.org/w/load.php?modules=ext.gadget.Global-ProveIt' );
}

// Only load when editing
mw.hook( 'wikipage.editform' ).add( editForm => window.ProveIt || loadProveIt() );
mw.hook( 've.newTarget' ).add( target => target.constructor.static.name === 'article' && target.on( 'surfaceReady', loadProveIt ) );
