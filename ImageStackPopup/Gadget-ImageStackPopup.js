/******************************************************************************/
/**** THIS PAGE TRACKS [[mw:MediaWiki:Gadget-Global-ImageStackPopup.js]]. PLEASE AVOID EDITING DIRECTLY. 
/**** EDITS SHOULD BE PROPOSED DIRECTLY to [[mw:MediaWiki:Gadget-Global-ImageStackPopup.js]].
/**** A BOT WILL RAISE AN EDIT REQUEST IF IT BECOMES DIFFERENT FROM UPSTREAM.
/******************************************************************************/

// Script written by Bawolff for WikiProject Med Foundation based on earlier ImageStack script by Hellerhoff.
var ImageStackPopup = {

	messages: {
		en: {
			ImageStackPopupFrameBack: 'Back',
			ImageStackPopupFrameImageCredit: 'View media credits',
			ImageStackPopupNextImage: "Next image",
			ImageStackPopupPreviousImage: "Previous image",
			ImageStackPopupSliderLabel: "Select image",
			ImageStackPopupPlayLabel: "Show slideshow",
			ImageStackPopupLoading: "Loading... $1%"
		},
		vi: {
			ImageStackPopupFrameBack: 'Trở lại',
			ImageStackPopupFrameImageCredit: 'Xem ghi công phương tiện',
			ImageStackPopupNextImage: 'Ảnh tiếp theo',
			ImageStackPopupPreviousImage: 'Ảnh trước đó',
			ImageStackPopupSliderLabel: 'Chọn hình ảnh',
			ImageStackPopupPlayLabel: 'Hiện trình chiếu',
			ImageStackPopupLoading: 'Đang tải... $1%'
		},
		es: {
			ImageStackPopupFrameBack: 'Volver',
            ImageStackPopupFrameImageCredit: 'Ver créditos del medio',
            ImageStackPopupNextImage: 'Imagen siguiente',
            ImageStackPopupPreviousImage: 'Imagen anterior',
            ImageStackPopupSliderLabel: 'Seleccionar imagen',
            ImageStackPopupPlayLabel: 'Mostrar presentación',
            ImageStackPopupLoading: 'Cargando... $1%'
		},
		de: {
			ImageStackPopupFrameBack: 'Zurück',
            ImageStackPopupFrameImageCredit: 'Mediendaten anzeigen',
            ImageStackPopupNextImage: 'Nächstes Bild',
            ImageStackPopupPreviousImage: 'Vorheriges Bild',
            ImageStackPopupSliderLabel: 'Bild auswählen',
            ImageStackPopupPlayLabel: 'Diashow anzeigen',
            ImageStackPopupLoading: 'Wird geladen... $1%'
		},
		fr: {
			ImageStackPopupFrameBack: 'Retour',
            ImageStackPopupFrameImageCredit: 'Voir les crédits des médias',
            ImageStackPopupNextImage: 'Image suivante',
            ImageStackPopupPreviousImage: 'Image précédente',
            ImageStackPopupSliderLabel: 'Choisir une image',
            ImageStackPopupPlayLabel: 'Afficher le diaporama',
            ImageStackPopupLoading: 'Chargement... $1%'
		},
		ru: {
			ImageStackPopupFrameBack: 'Назад',
            ImageStackPopupFrameImageCredit: 'Просмотреть авторство изображения',
            ImageStackPopupNextImage: 'Следующее изображение',
            ImageStackPopupPreviousImage: 'Предыдущее изображение',
            ImageStackPopupSliderLabel: 'Выбрать изображение',
            ImageStackPopupPlayLabel: 'Показать слайд-шоу',
            ImageStackPopupLoading: 'Загрузка... $1%'
		},
		zh: {
			ImageStackPopupFrameBack: '返回',
            ImageStackPopupFrameImageCredit: '查看媒体来源',
            ImageStackPopupNextImage: '下一张图片',
            ImageStackPopupPreviousImage: '上一张图片',
            ImageStackPopupSliderLabel: '选择图片',
            ImageStackPopupPlayLabel: '显示幻灯片',
            ImageStackPopupLoading: '加载中... $1%'
		},
		'zh-tw': {
			ImageStackPopupFrameBack: '返回',
            ImageStackPopupFrameImageCredit: '查看媒體來源',
            ImageStackPopupNextImage: '下一張圖片',
            ImageStackPopupPreviousImage: '上一張圖片',
            ImageStackPopupSliderLabel: '選擇圖片',
            ImageStackPopupPlayLabel: '顯示投影片',
            ImageStackPopupLoading: '載入中... $1%'
		},
		yue: {
			ImageStackPopupFrameBack: '返回',
            ImageStackPopupFrameImageCredit: '查看媒體來源',
            ImageStackPopupNextImage: '下一張圖片',
            ImageStackPopupPreviousImage: '上一張圖片',
            ImageStackPopupSliderLabel: '選擇圖片',
            ImageStackPopupPlayLabel: '播放幻燈片',
            ImageStackPopupLoading: '載入中... $1%'
		},
		ja: {
			ImageStackPopupFrameBack: '戻る',
            ImageStackPopupFrameImageCredit: 'メディアのクレジットを見る',
            ImageStackPopupNextImage: '次の画像',
            ImageStackPopupPreviousImage: '前の画像',
            ImageStackPopupSliderLabel: '画像を選択',
            ImageStackPopupPlayLabel: 'スライドショーを表示',
            ImageStackPopupLoading: '読み込み中... $1%'
		},
	},

	init: function () {
		ImageStackPopup.setMessages();
		mw.hook( 'wikipage.content' ).add( ImageStackPopup.addPlayButton );
	},

	/**
	 * Set the interface messages in the most appropriate language
	 *
	 * Favor the user language first, the page language second, the wiki language third, and lastly English
	 */
	setMessages: function () {
		var userLanguage = mw.config.get( 'wgUserLanguage' );
		if ( userLanguage in ImageStackPopup.messages ) {
			mw.messages.set( ImageStackPopup.messages[ userLanguage ] );
			return;
		}
		var pageLanguage = mw.config.get( 'wgPageContentLanguage' );
		if ( pageLanguage in ImageStackPopup.messages ) {
			mw.messages.set( ImageStackPopup.messages[ pageLanguage ] );
			return;
		}
		var contentLanguage = mw.config.get( 'wgContentLanguage' );
		if ( contentLanguage in ImageStackPopup.messages ) {
			mw.messages.set( ImageStackPopup.messages[ contentLanguage ] );
			return;
		}
		mw.messages.set( ImageStackPopup.messages.en );
	},

	/**
	 * Append a play button ► to every ImageStackPopup div
 	 */
	addPlayButton: function ( $content ) {
		$content.find( 'div.ImageStackPopup' ).each( function () {
			var $frame = $( this );
			var viewerInfo = $frame.data( 'imagestackpopupConfig' );
			if ( !( viewerInfo instanceof Array) ) {
				return;
			}
			// match both img and span for broken files in galleries
			$frame.find( '.mw-file-element, .lazy-image-placeholder' ).each( function ( i ) {
				if ( viewerInfo[i] instanceof Object && typeof viewerInfo[i].list === "string" ) {
					var $play = $( '<button></button>' )
						.attr( {
							type: 'button',
							"class": 'ImageStackPopup-play',
							title: mw.msg( 'ImageStackPopupPlayLabel' ),
							"aria-label": mw.msg( 'ImageStackPopupPlayLabel' )
						} ).text( '►' );
					var data = viewerInfo[i];
					$play.on( 'click', data, ImageStackPopup.showFrame );
					var $this = $( this );
					$this.parent().css( {display: 'inline-block', height: 'fit-content', position: 'relative' } );
					$this.after( $play );
				}
			} );
		} );
	},

	showFrame: function ( event ) {
		event.preventDefault();
		var data = event.data;

		var $loading = $( '#ImageStackPopupLoading' );
		if ( !$loading.length ) {
				$loading = $( '<div></div>' )
					.attr( {
						id: "ImageStackPopupLoading",
						role: "status"
					}
				);
				$( document.body ).append( $loading );
		}
		$loading.text( mw.msg( 'ImageStackPopupLoading', "0" ) );
		// Load dependencies
		var state = mw.loader.getState( 'oojs-ui-windows' );
		if ( state === 'registered' ) {
			mw.loader.using( 'oojs-ui-windows', function () { ImageStackPopup.showFrame( event ) } );
			return;
		}
		var $viewer = ImageStackPopup.getViewer();

		var config = {
			size: 'full',
			// This doesn't seem to work.
			classes: 'ImageStackPopupDialog',
			title: typeof data.title === 'string' ? data.title : false,
			actions: [ {
				action: 'accept',
				label: mw.msg( 'ImageStackPopupFrameBack' ),
				flags: [ 'primary', 'progressive' ]
			} ],
			message: $viewer
		};

		var dialog = function ( config ) {
			dialog.super.call( this, config );
			this.$element.addClass( 'ImageStackPopupDialog' );
		}

		OO.inheritClass( dialog, OO.ui.MessageDialog );
		dialog.static.name = 'ImageStack'
		OO.ui.getWindowManager().addWindows( [ new dialog() ] );
		// copied from OO.ui.alert definition.
		OO.ui.getWindowManager().openWindow( 'ImageStack', config )
			.closed.done( function () {
				// There has to be a better way to do this.
				if ( window.ImageStackPopupCancel ) {
					window.ImageStackPopupCancel();
				}
			});
		ImageStackPopup.loadImages( $viewer, data );
	},

	getViewer: function () {
		var $viewer = $( '<div></div>' ).attr( {
			class: 'ImageStackPopup-viewer ImageStackPopup-loading'
		} );
		// From https://commons.wikimedia.org/wiki/File:Loading_spinner.svg
		$viewer.append( '<svg xmlns="http://www.w3.org/2000/svg" aria-label="Loading..." viewBox="0 0 100 100" width="25%" height="25%" style="display:block;margin:auto"><rect fill="#555" height="6" opacity=".083" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".167" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".25" rx="3" ry="3" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".417" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".583" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".667" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".833" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47"/><rect fill="#555" height="6" opacity=".917" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47"/></svg>' );
		return $viewer;
	},

	loadImages: function ( $viewer, data ) {
		var page = mw.Title.newFromText( data.list );
		if ( !page ) {
			console.log( "Image stack error, invalid page " + data.list );
			return;
		}

		fetch( page.getUrl() )
			.then( function ( response ) { return response.text() } )
			.then( function ( text ) { return ImageStackPopup.handlePage( $viewer, data, text ) } );
	},

	handlePage: function( $viewer, data, text ) {
		var parser = new DOMParser;
		var listDoc = parser.parseFromString( text, 'text/html' );
		var idSelector = mw.Title.newFromText( data.list ).getFragment();

		var listElm = listDoc.getElementById( idSelector );
		if ( !listElm ) {
			console.log( "Error finding element in list document" );
			return;
		}

		var imgs = listElm.querySelectorAll( 'img.mw-file-element' );

		var width = imgs[0].width;
		var height = imgs[0].height;

		var context = new ImageStackPopup.Context( $viewer, data, imgs, width, height );
	},

	getSource: function ( imgElm, width, height ) {
		// desired dimensions
		var w = width * window.devicePixelRatio;
		var h = height * window.devicePixelRatio;
		// current candidate
		var imgW = parseInt(imgElm.width);
		var imgH = parseInt(imgElm.height);
		// img tag width/height.
		var originalW = imgW;
		var originalH = imgH;
		var src = imgElm.src;
		if ( imgW >= w && imgH >= h ) {
			return src;
		}
		var srcSets = imgElm.srcset.split( /\s*,\s*/ );
		for ( var i = 0; i < srcSets.length; i++ ) {
			var parts = srcSets[i].match( /^(\S+)\s+([0-9.])x\s*$/ );
			if (
				parts &&
				parts.length === 3
			) {
				var pixelRatio = parseFloat( parts[2] );
				if (
					( imgW < w && originalW*pixelRatio > imgW ) ||
					( imgW > w && originalW*pixelRatio - w >= 0 && originalW*pixelRatio < imgW )
				) {
					imgW = originalW*pixelRatio;
					imgH = originalH*pixelRatio;
					src = parts[1];
				}
			}
		}
		return src;
	},

	doStats: function () {
		if ( window.imageStackPopupStatsAlreadyDone !== true ) {
			window.imageStackPopupStatsAlreadyDone = true;
			mw.track( 'counter.gadget_ImageStackPopup._all' );
			mw.track( 'counter.gadget_ImageStackPopup.' + mw.config.get( 'wgDBname' ) + '_all' );
			var statName = mw.config.get( 'wgDBname' ) + '_' + mw.config.get( 'wgPageName' );
			statName = encodeURIComponent( statName );
			// Symbols don't seem to work.
			statName = statName.replace( /[^a-zA-Z0-9_]/g, '_' );
			mw.track( 'counter.gadget_ImageStackPopup.' + statName );
		}
	},

	Context: function ( $viewer, config, imgs, width, height ) {
		ImageStackPopup.doStats();
		this.$viewer = $viewer;
		this.loop = !!config.loop;
		this.start = typeof config.start === 'number' ? config.start - 1 : 0;
		this.urls = null;
		this.infoUrls = null;
		this.imgs = imgs;
		this.captionId = typeof config.caption === 'string' ? config.caption : false;
		// Future TODO - make the size of image adaptive to screen size
		// Future TODO - handle images of different sizes and aspect ratios.
		this.width = config.width;
		this.height = config.height;
		if ( this.width && !this.height ) {
			this.height = this.width * (imgs[0].height)/(imgs[0].width);
		}
		if ( !this.width && this.height ) {
			this.width = this.height * (imgs[0].width)/(imgs[0].height);
		}
		this.imgWidth = width;
		this.imgHeight = height;
		this.currentImage = this.start;
		this.pendingFrame = false;
		this.$loading = $( '#ImageStackPopupLoading' );
		this.urlsLoaded = 0;
		this.pendingTouches = {};

		this.init();
	}
};

// This part is based on Hellerhoff's https://commons.wikimedia.org/wiki/MediaWiki:Gadget-ImageStack.js
ImageStackPopup.Context.prototype = {
	init: function () {
		var that = this;
		// Chrome scrolls much faster than firefox
		const SCROLL_SLOWDOWN = navigator.userAgent.includes( "Chrome/" ) ? 25 : 2;
		this.pendingScrollDelta = 0;

		var containingWidth = this.$viewer[0].parentElement.parentElement.parentElement.clientWidth;
		var containingHeight = this.$viewer[0].parentElement.parentElement.parentElement.clientHeight;
		this.$viewer.empty();
		$counter = $('<div class="ImageStackCounter">');
		this.$leftLink = $('<a>', {
			href: '#',
			text: '← ',
			title: mw.msg( 'ImageStackPopupPreviousImage' ),
			"aria-label": mw.msg( 'ImageStackPopupPreviousImage' ),
		}).click(function() {
			that.currentImage--;
			that.repaint();
			return false;
		});
		this.$rightLink = $('<a>', {
			href: '#',
			text: ' →',
			title: mw.msg( 'ImageStackPopupNextImage' ),
			"aria-label": mw.msg( 'ImageStackPopupNextImage' ),
		}).click(function() {
			that.currentImage++;
			that.repaint();
			return false;
		});

		this.$slider = $( '<input>', {
			type: 'range',
			min: 0,
			max: that.imgs.length - 1,
			value: this.currentImage,
			"aria-label": mw.msg( 'ImageStackPopupSliderLabel' ),
			class: 'ImageStackPopupSlider'
		} ).on( 'input', function (e) {
			that.currentImage = parseInt( e.target.value );
			that.repaint();
		} ).on( 'keydown', function (e) {
			// Hacky fix. Not enough browsers support the direction: css
			// keyword, so we fix up events here.
			if ( e.key === 'ArrowUp' ) {
				e.preventDefault();
				that.currentImage--;
				that.repaint();
			} else if ( e.key === 'ArrowDown' ) {
				e.preventDefault();
				that.currentImage++;
				that.repaint();
			}
		} );

		var handleTouchStart = this.handleTouchStart.bind(this);
		var handleTouchMove = this.handleTouchMove.bind(this);
		var handleTouchCancel = this.handleTouchCancel.bind(this);
		var handleTouchEnd = this.handleTouchEnd.bind(this);
		var touchElement = this.$viewer[0].parentElement.parentElement;
		var opt = { passive: true };

		// For now it seems like we don't have to cancel events. Unclear if we should
		touchElement.addEventListener( 'touchstart', handleTouchStart, opt );
		touchElement.addEventListener( 'touchmove', handleTouchMove, opt );
		touchElement.addEventListener( 'touchend', handleTouchEnd, opt );
		touchElement.addEventListener( 'touchcancel', handleTouchCancel, opt );

		var keyeventhandler = this.handleArrow.bind(this);
		document.addEventListener( 'keydown', keyeventhandler );
		// Hacky!
		window.ImageStackPopupCancel = function () {
			document.removeEventListener( 'keydown', keyeventhandler );
			touchElement.removeEventListener( 'touchstart', handleTouchStart, opt );
			touchElement.removeEventListener( 'touchmove', handleTouchMove, opt );
			touchElement.removeEventListener( 'touchend', handleTouchEnd, opt );
			touchElement.removeEventListener( 'touchcancel', handleTouchCancel, opt );
		};
		this.$currentCount = $('<span>', {
			'class': 'ImageStackCounterCurrent',
			text: that.currentImage + 1
		});
		var left = $( '<span>', { class: "ImageStackPopupCounterHideMobile" } ).append( this.$leftLink, '(' );
		var right = $( '<span>', { class: "ImageStackPopupCounterHideMobile" } ).append( ')', this.$rightLink );
		$counter.append(left, this.$currentCount, '/', that.imgs.length, right);
		this.$leftLink.add(this.$rightLink).css({
			fontSize: "110%",
			fontweight: "bold"
		});

		this.img = new Image();
		this.img.fetchPriority = 'high';
		this.img.loading = 'eager';
		this.img.decoding = 'sync';
		this.img.className = 'ImageStackPopupImg';
		// width/height set later.
		var $img = $( this.img );
		$img.on('mousewheel', function(event, delta) {
			// Scroll is too fast (Esp. on chrome), so we buffer scroll events.
			that.pendingScrollDelta += delta;
			var realDelta = Math.floor(that.pendingScrollDelta/SCROLL_SLOWDOWN);
			if (delta !== 0) {
				// We reverse the direction of scroll.
				that.currentImage -= realDelta > 2 ? 2 : realDelta;
				that.pendingScrollDelta -= realDelta*SCROLL_SLOWDOWN;
				that.repaint();
			}
			return false;
		});
		$img.on('mousedown', function(event) { // prepare scroll by drag
			mouse_y = event.screenY; // remember mouse-position
			that.scrollobject = true; // set flag
			return false;
		});
		$img.on('mousemove', function(event) {
			if (that.scrollobject && Math.abs(mouse_y - event.screenY) > 10) {
				var offset = (mouse_y < event.screenY) ? 1 : -1;
				mouse_y = event.screenY; //  remember mouse-position for next event
				that.currentImage += offset;
				that.repaint();
			}
			return false;
		});

		this.img.addEventListener( 'load', this.urlLoaded.bind( this ), { once: true } );
		this.img.addEventListener( 'error', this.urlLoaded.bind( this ), { once: true } );

		var $container = $( '<div class="ImageStackPopupImgContainer"></div>' )
			.append( $counter )
			.append( this.$slider )
			.append( $img );

		this.$viewer.append( $container );
		this.$credit = $( '<a></a>' );
		this.$credit.text( mw.msg( 'ImageStackPopupFrameImageCredit' ) );
		var $creditDiv = $( '<div class="ImageStackPopupCredit"></div>' ).append( this.$credit );
		this.$viewer.append( $creditDiv );
		var $wrapper = false;
		if ( this.captionId ) {
			var captionElm = document.getElementById( this.captionId );
			if ( captionElm ) {
				var newCaption = $( captionElm ).clone();
				newCaption.show();
				$wrapper = $( '<div class="ImageStackPopup-caption"></div>' ).append( newCaption );
				this.$viewer.append( $wrapper );
			}
		}
		// Try to adjust image size to viewer window
		// but do not go so far that the image is blurry
		if ( !this.width ) {
			var controlHeight = $creditDiv[0].clientHeight;
			var paddingDivStyles = getComputedStyle( this.$viewer[0].parentElement.parentElement );
			controlHeight += parseFloat( paddingDivStyles.getPropertyValue( 'padding-top' ) ) + parseFloat( paddingDivStyles.getPropertyValue( 'padding-bottom' ) );
			containingWidth -= parseFloat( paddingDivStyles.getPropertyValue( 'padding-left' ) ) + parseFloat( paddingDivStyles.getPropertyValue( 'padding-right' ) );
			if ( $wrapper ) {
				controlHeight += $wrapper[0].clientHeight;
			}
			controlHeight += 5; // fudge factor.
			if ( this.$viewer[0].parentElement.previousElementSibling ) {
				// OOUI window label. This is a bit hacky.
				controlHeight += this.$viewer[0].parentElement.previousElementSibling.clientHeight;
			}
			var maxImgDim = this.getMaxImgDim();
			var aspect = maxImgDim[0]/maxImgDim[1];
			containingHeight -= controlHeight;
			// 3 to account for slider and text controls. but not on narrow screens.
			if ( containingWidth >= 500 ) {
				containingWidth -= parseFloat( getComputedStyle( this.$slider[0] ).getPropertyValue( 'width' ) ) * 3;
			}

			if ( maxImgDim[0] > maxImgDim[1] ) {
				if ( maxImgDim[0] > containingWidth ) {
					// shrink to fit.
					maxImgDim[0] = containingWidth;
					maxImgDim[1] = Math.floor(containingWidth/aspect);
				}
				if ( maxImgDim[1] > containingHeight ) {
					maxImgDim[1] = containingHeight;
					maxImgDim[0] = Math.floor( containingHeight * aspect );
				}
			} else {
				if ( maxImgDim[1] > containingHeight ) {
					maxImgDim[1] = containingHeight;
					maxImgDim[0] = Math.floor( containingHeight * aspect );
				}
				if ( maxImgDim[0] > containingWidth ) {
					// shrink to fit.
					maxImgDim[0] = containingWidth;
					maxImgDim[1] = Math.floor(containingWidth/aspect);
				}
			}
			this.width = maxImgDim[0];
			this.height = maxImgDim[1];
		}
		this.img.width = this.width;
		this.img.height = this.height;
		// different font size in credit div, so don't use em.
		var sliderRoom;
		if ( containingWidth >= 500 ) {
			sliderRoom = parseFloat( getComputedStyle( this.$slider[0] ).getPropertyValue( 'width' ) ) * 3;
		} else {
			sliderRoom = 0;
		}
		$creditDiv.css( 'width', this.width + sliderRoom + 'px' );
		$creditDiv.css( 'padding-right', sliderRoom + 'px' );
		$container.css( 'width', 'calc( ' + this.width + 'px' + ' + 3em )' );
		this.$slider.css( 'height', this.height + 'px' );
		$counter.css( 'min-height', this.height + 'px' );

		this.getUrls();
		this.toggleImg();
		this.preload();
	},

	getMaxImgDim: function () {
		// This assumes that even on high-DPI displays, enlarging to 96dpi is ok.
		var w = this.imgs[0].width;
		var h = this.imgs[0].height;
		if ( this.imgs[0].srcset.match( /\s2x\s*(,|$)/ ) ) {
			w *= 2;
			h *= 2;
		} else if ( this.imgs[0].srcset.match( /\s1.5x\s*(,|$)/ ) ) {
			w = Math.floor( 1.5*w );
			h = Math.floor( 1.5*h );
		}
		return [w,h];
	},

	repaint: function () {
		if ( this.pendingFrame ) {
			return;
		}
		requestAnimationFrame( this.toggleImg.bind( this ) );
	},

	toggleImg: function () {
		if ( this.loop ) {
			if ( this.currentImage < 0 ) {
				this.currentImage = this.urls.length - 1;
			} else if ( this.currentImage >= this.urls.length ) {
				this.currentImage = 0;
			}
		} else {
			this.$rightLink.css( 'visibility', 'visible' );
			this.$leftLink.css( 'visibility', 'visible' );
			if ( this.currentImage <= 0 ) {
				this.currentImage = 0;
				this.$leftLink.css( 'visibility', 'hidden' );
			} else if ( this.currentImage >= this.urls.length - 1 ) {
				this.currentImage = this.urls.length - 1;
				this.$rightLink.css( 'visibility', 'hidden' );
			}
		}
		this.$slider[0].value = this.currentImage;
		// Future todo might be to localize digits.
		this.$currentCount[0].textContent = this.currentImage + 1;
		this.img.src = this.urls[this.currentImage];
		this.$credit[0].href = this.infoUrls[this.currentImage];
		if ( this.infoUrls[this.currentImage] === false ) {
			this.$credit.css( 'visibility', 'hidden' );
		} else {
			this.$credit.css( 'visibility', 'visible' );
		}
		this.pendingFrame = false;
	},
	
	preload: function () {
		for ( var i = 0; i < this.urls.length; i++ ) {
			if ( i === this.currentImage ) {
				// already fetched.
				continue;
			}
			var img = new Image();
			if ( Math.abs( this.currentImage - i ) > 4 ) {
				img.fetchPriority = 'low';
			}
			img.loading = 'eager';
			img.decoding = 'sync';
			img.addEventListener( 'load', this.urlLoaded.bind( this ), { once: true } );
			img.addEventListener( 'error', this.urlLoaded.bind( this ), { once: true} );
			img.src = this.urls[i];
		}

	},

	getUrls: function () {
		this.urls = [];
		this.infoUrls = [];
		for( var i = 0; i < this.imgs.length; i++ ) {
			this.urls[i] = ImageStackPopup.getSource( this.imgs[i], this.width, this.height );
			if ( this.imgs[i].parentElement.href ) {
				this.infoUrls[i] = this.imgs[i].parentElement.href;
			} else {
				this.infoUrls[i] = false;
			}
		}
	},

	urlLoaded: function () {
		// For now, this still increments for failed loads, so
		// as not to have the progress bar stuck.
		this.urlsLoaded++;
		var progress = Math.floor( ( this.urlsLoaded / this.urls.length ) * 100 );
		if ( this.$loading.length ) {
			this.$loading.text( mw.msg( 'ImageStackPopupLoading', progress ) );
			if ( this.urlsLoaded === this.urls.length ) {
				this.$viewer.removeClass( 'ImageStackPopup-loading' );
				this.$loading.remove();
			}
		}
	},
	
	handleArrow: function (e) {
		// Not sure if we should prevent default here
		// possible accessibility issue if there is somehow something scrollable.
		// in theory, nothing here should be scrollable so it shouldn't matter.
		if (
			( e.key === 'ArrowUp' ||
			e.key === 'ArrowDown' ||
			e.key === 'ArrowRight' ||
			e.key === 'ArrowLeft' )
			&& e.target.tagName !== 'INPUT' 
			&& this.$viewer.find(e)
		) {
			if ( e.key === 'ArrowUp' || e.key === 'ArrowRight' ) {
				this.currentImage--;
				this.repaint();
			} else if ( e.key === 'ArrowDown' || e.key === 'ArrowLeft' ) {
				this.currentImage++;
				this.repaint();
			}
		}
	},

	handleTouchStart: function (e) {
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t = e.changedTouches[i];
			this.pendingTouches[t.identifier] = [t.clientX, t.clientY];
		}
	},
	handleTouchCancel: function (e) {
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t = e.changedTouches[i];
			delete this.pendingTouches[t.identifier];
		}
	},
	handleTouchMove: function (e) {
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t = e.changedTouches[i];
			if ( !this.pendingTouches[t.identifier] ) {
				continue;
			}
			var startX = this.pendingTouches[t.identifier][0];
			var startY = this.pendingTouches[t.identifier][1];
			var angle = Math.abs( Math.atan( ( startY - t.clientY ) / ( startX - t.clientX ) ) );

			if ( angle > 1 ) {
				// vertical. > ~60 degrees
				if ( Math.abs( startY - t.clientY ) < 15 ) {
					// Not large enough
					continue;
				}
				// reset calculation so we move image if they move 15 more pixels
				this.pendingTouches[t.identifier] = [t.clientX, t.clientY];
				if ( startY - t.clientY > 0 ) {
					// swipe up
					this.currentImage--;
					this.repaint();
				} else {
					// swipe down
					this.currentImage++;
					this.repaint();
				}
			}
		}
	},
	handleTouchEnd: function (e) {
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t = e.changedTouches[i];
			if ( !this.pendingTouches[t.identifier] ) {
				continue;
			}
			var startX = this.pendingTouches[t.identifier][0];
			var startY = this.pendingTouches[t.identifier][1];
			var angle = Math.abs( Math.atan( ( startY - t.clientY ) / ( startX - t.clientX ) ) );
			if ( angle < 0.7 ) {
				// horizontal swipe. < 40 degrees
				if ( Math.abs( startX - t.clientX ) < 30 ) {
					// Not large enough
					continue;
				}

				if ( startX - t.clientX < 0 ) {
					// swipe right
					this.currentImage--;
					this.repaint();
				} else {
					// swipe left
					this.currentImage++;
					this.repaint();
				}
			}
			if ( angle > 1 ) {
				// vertical swipe. > ~60 degrees
				if ( Math.abs( startY - t.clientY ) < 30 ) {
					// Not large enough
					continue;
				}
				if ( startY - t.clientY > 0 ) {
					// swipe up
					this.currentImage--;
					this.repaint();
				} else {
					// swipe down
					this.currentImage++;
					this.repaint();
				}
			}

			delete this.pendingTouches[t.identifier];
		}
	},
};

// Include jquery.mousewheel dependency.
// --------
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.11
 *
 * Requires: jQuery 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.11',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $parent = $(elem)['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10);
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.on('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.off('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));


// --- Start image stack popup
$( ImageStackPopup.init );
