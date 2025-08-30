// Xem [[mw:Reference Tooltips]]
// Nguồn https://vi.wikipedia.org/wiki/MediaWiki:Gadget-ReferenceTooltips.js

( function () {

// Cài đặt viwiki
var REF_LINK_SELECTOR = '.reference, a[href^="#CITEREF"]',
	COMMENTED_TEXT_CLASS = 'rt-commentedText',
	COMMENTED_TEXT_SELECTOR = ( COMMENTED_TEXT_CLASS ? '.' + COMMENTED_TEXT_CLASS + ', ' : '') +
		'abbr[title]';

mw.messages.set( {
	'rt-settings': 'Cài đặt Chú thích nổi',
	'rt-enable-footer': 'Bật Chú thích nổi',
	'rt-settings-title': 'Chú thích nổi',
	'rt-save': 'Lưu',
	'rt-cancel': 'Hủy',
	'rt-enable': 'Bật',
	'rt-disable': 'Tắt',
	'rt-activationMethod': 'Chú thích nổi xuất hiện khi',
	'rt-hovering': 'trỏ chuột',
	'rt-clicking': 'nhấn chuột',
	'rt-delay': 'Thời gian chờ trước khi chú thích nổi xuất hiện (dưới dạng mili giây)',
	'rt-tooltipsForComments': 'Làm xuất hiện chú thích nổi trên <span title="Ví dụ Chú thích nổi" class="' + ( COMMENTED_TEXT_CLASS || 'rt-commentedText' ) + '" style="border-bottom: 1px dotted; cursor: help;">văn bản được gạch chấm dưới</span> theo kiểu chú thích nổi (cho phép xem chú thích nổi trên các thiết bị không được hỗ trợ chuột)',
	'rt-disabledNote': 'Bạn có thể bật lại Chú thích nổi bằng cách sử dụng liên kết ở cuối trang.',
	'rt-done': 'Xong',
	'rt-enabled': 'Chú thích nổi đã được bật'
} );

// Biến số "toàn cục"
var SECONDS_IN_A_DAY = 60 * 60 * 24,
	CLASSES = {
		FADE_IN_DOWN: 'rt-fade-in-down',
		FADE_IN_UP: 'rt-fade-in-up',
		FADE_OUT_DOWN: 'rt-fade-out-down',
		FADE_OUT_UP: 'rt-fade-out-up'
	},
	IS_TOUCHSCREEN = 'ontouchstart' in document.documentElement,
	// Kiểm tra kỹ các trình duyệt trên thiết bị di động, kết hợp với những gì được nhắc đến tại
	// https://stackoverflow.com/a/24600597 (gửi đến
	// https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent)
	// và https://stackoverflow.com/a/14301832
	IS_MOBILE = /Mobi|Android/i.test( navigator.userAgent ) ||
		typeof window.orientation !== 'undefined',
	CLIENT_NAME = $.client.profile().name,
	settingsString, settings, enabled, delay, activatedByClick, tooltipsForComments, cursorWaitCss,
	windowManager,
	$body = $( document.body ),
	$window = $( window );

function rt( $content ) {
	// Tiện ích nổi
	if ( window.pg ) {
		return;
	}

	var teSelector,
		settingsDialogOpening = false;

	function setSettingsCookie() {
		mw.cookie.set(
			'RTsettings',
			Number( enabled ) + '|' + delay + '|' + Number( activatedByClick ) + '|' +
				Number( tooltipsForComments ),
			{ path: '/', expires: 90 * SECONDS_IN_A_DAY, prefix: '' }
		);
	}

	function enableRt() {
		enabled = true;
		setSettingsCookie();
		$( '.rt-enableItem' ).remove();
		rt( $content );
		mw.notify( mw.msg( 'rt-enabled' ) );
	}

	function disableRt() {
		$content.find( teSelector ).removeClass( 'rt-commentedText' ).off( '.rt' );
		$body.off( '.rt' );
		$window.off( '.rt' );
	}

	function addEnableLink() {
		// #footer-places – Vector
		// #f-list – Timeless, Monobook, Modern
		// cha của #footer li – Cologne Blue
		var $footer = $( '#footer-places, #f-list' );
		if ( !$footer.length ) {
			$footer = $( '#footer li' ).parent();
		}
		$footer.append(
			$( '<li>' )
				.addClass( 'rt-enableItem' )
				.append(
					$( '<a>' )
						.text( mw.msg( 'rt-enable-footer' ) )
						.attr( 'href', 'javascript:' )
						.click( function ( e ) {
							e.preventDefault();
							enableRt();
						} )
			)
		);
	}

	function TooltippedElement( $element ) {
		var tooltip,
			events,
			te = this;

		function onStartEvent( e ) {
			var showRefArgs;

			if ( activatedByClick && te.type !== 'commentedText' && e.type !== 'contextmenu' ) {
				e.preventDefault();
			}
			if ( !te.noRef ) {
				showRefArgs = [ $( this ) ];
				if ( te.type !== 'supRef' ) {
					showRefArgs.push( e.pageX, e.pageY );
				}
				te.showRef.apply( te, showRefArgs );
			}
		}

		function onEndEvent() {
			if ( !te.noRef ) {
				te.hideRef();
			}
		}

		if ( !$element ) {
			return;
		}

		// TooltippedElement.$element và TooltippedElement.$originalElement sẽ trở nên khác nhau khi
		// điều đầu tiên được thay đổi sau khi nhân bản của nó được trỏ chuột qua chú thích nổi
		this.$element = $element;
		this.$originalElement = $element;
		if ( this.$element.is( REF_LINK_SELECTOR ) ) {
			if ( this.$element.prop( 'tagName' ) === 'SUP' ) {
				this.type = 'supRef';
			} else {
				this.type = 'harvardRef';
			}
		} else {
			this.type = 'commentedText';
			this.comment = this.$element.attr( 'title' );
			if ( !this.comment ) {
				return;
			}
			this.$element.addClass('rt-commentedText');
		}
		
		if ( activatedByClick ) {
			events = {
				'click.rt': onStartEvent
			};
			// Thêm khả năng xem chú thích nổi cho các liên kết
			if ( this.type === 'commentedText' &&
				( this.$element.closest( 'a' ).length ||
					this.$element.has( 'a' ).length
				)
			) {
				events[ 'contextmenu.rt' ] = onStartEvent;
			}
		} else {
			events = {
				'mouseenter.rt': onStartEvent,
				'mouseleave.rt': onEndEvent
			};
		}

		this.$element.on( events );

		this.hideRef = function ( immediately ) {
			clearTimeout( te.showTimer );

			if ( this.type === 'commentedText' ) {
				this.$element.attr( 'title', this.comment );
			}

			if ( this.tooltip && this.tooltip.isPresent ) {
				if ( activatedByClick || immediately ) {
					this.tooltip.hide();
				} else {
					this.hideTimer = setTimeout( function () {
						te.tooltip.hide();
					}, 200 );
				}
			} else if ( this.$ref && this.$ref.hasClass( 'rt-target' ) ) {
				this.$ref.removeClass( 'rt-target' );
				if ( activatedByClick ) {
					$body.off( 'click.rt touchstart.rt', this.onBodyClick );
				}
			}
		};

		this.showRef = function ( $element, ePageX, ePageY ) {
			// Tiện ích nổi
			if ( window.pg ) {
				disableRt();
				return;
			}
			
			if ( this.tooltip && !this.tooltip.$content.length ) {
				return;
			}

			var tooltipInitiallyPresent = this.tooltip && this.tooltip.isPresent;

			function reallyShow() {
				var viewportTop, refOffsetTop, teHref;

				if ( !te.$ref && !te.comment ) {
					teHref = te.type === 'supRef' ?
						te.$element.find( 'a' ).attr( 'href' ) :
						te.$element.attr( 'href' ); // harvardRef
					te.$ref = teHref &&
						$( '#' + $.escapeSelector( teHref.slice( 1 ) ) );
					if ( !te.$ref || !te.$ref.length || !te.$ref.text() ) {
						te.noRef = true;
						return;
					}
				}

				if ( !tooltipInitiallyPresent && !te.comment ) {
					viewportTop = $window.scrollTop();
					refOffsetTop = te.$ref.offset().top;
					if ( !activatedByClick &&
						viewportTop < refOffsetTop &&
						viewportTop + $window.height() > refOffsetTop + te.$ref.height() &&
						// Có thể có các tiện ích/tập lệnh làm cho các tham chiếu có thể cuộn theo chiều ngang.
						$window.width() > te.$ref.offset().left + te.$ref.width()
					) {
						// Đánh dấu chính tham chiếu đó
						te.$ref.addClass( 'rt-target' );
						return;
					}
				}

				if ( !te.tooltip ) {
					te.tooltip = new Tooltip( te );
					if ( !te.tooltip.$content.length ) {
						return;
					}
				}

				// Nếu chú thích nổi này được gọi từ bên trong chú thích nổi khác. Chúng tôi không thể
				// định nghĩa nó trong hàm tạo vì một ref có thể được sao chép nhưng có cùng một đối tượng Tooltip;
				// vì vậy, Tooltip.parent là một giá trị động.
				te.tooltip.parent = te.$element.closest( '.rt-tooltip' ).data( 'tooltip' );
				if ( te.tooltip.parent && te.tooltip.parent.disappearing ) {
					return;
				}

				te.tooltip.show();

				if ( tooltipInitiallyPresent ) {
					if ( te.tooltip.$element.hasClass( 'rt-tooltip-above' ) ) {
						te.tooltip.$element.addClass( CLASSES.FADE_IN_DOWN );
					} else {
						te.tooltip.$element.addClass( CLASSES.FADE_IN_UP );
					}
					return;
				}

				te.tooltip.calculatePosition( ePageX, ePageY );

				$window.on( 'resize.rt', te.onWindowResize );
			}

			// Chúng tôi sẽ xác định lại this.$element ở đây bởi vì e.target có thể là liên kết tham khảo bên trong
			// chú thích nổi, chứ không phải là một liên kết ban đầu được chỉ định cho this.$element
			this.$element = $element;

			if ( this.type === 'commentedText' ) {
				this.$element.attr( 'title', '' );
			}

			if ( activatedByClick ) {
				if ( tooltipInitiallyPresent ||
					( this.$ref && this.$ref.hasClass( 'rt-target' ) )
				) {
					return;
				} else {
					setTimeout( function () {
						$body.on( 'click.rt touchstart.rt', te.onBodyClick );
					}, 0 );
				}
			}

			if ( activatedByClick || tooltipInitiallyPresent ) {
				reallyShow();
			} else {
				this.showTimer = setTimeout( reallyShow, delay );
			}
		};

		this.onBodyClick = function ( e ) {
			if(!te.$ref || !te.$ref.hasClass ) {
				return;
			}
			if ( !te.tooltip && !te.$ref.hasClass( 'rt-target' ) ) {
				return;
			}

			var $current = $( e.target );

			function contextMatchesParameter( parameter ) {
				return this === parameter;
			}

			// Điều kiện cuối cùng được sử dụng để xác định các trường hợp khi chú thích nổi được nhấn vào là
			// chú thích nổi của phần tử hiện tại hoặc một trong phần tử con của nó
			while ( $current.length &&
				( !$current.hasClass( 'rt-tooltip' ) ||
					!$current.data( 'tooltip' ) ||
					!$current.data( 'tooltip' ).upToTopParent(
						contextMatchesParameter, [ te.tooltip ],
						true
					)
				)
			) {
				$current = $current.parent();
			}
			if ( !$current.length ) {
				te.hideRef();
			}
		};

		this.onWindowResize = function () {
			te.tooltip.calculatePosition();
		};
	}

	function Tooltip( te ) {
		function openSettingsDialog() {
			var settingsDialog, settingsWindow;

			if ( cursorWaitCss ) {
				cursorWaitCss.disabled = true;
			}

			function SettingsDialog() {
				SettingsDialog.parent.call( this );
			}
			OO.inheritClass( SettingsDialog, OO.ui.ProcessDialog );

			SettingsDialog.static.name = 'settingsDialog';
			SettingsDialog.static.title = mw.msg( 'rt-settings-title' );
			SettingsDialog.static.actions = [
				{
					modes: 'basic',
					action: 'save',
					label: mw.msg( 'rt-save' ),
					flags: [ 'primary', 'progressive' ]
				},
				{
					modes: 'basic',
					label: mw.msg( 'rt-cancel' ),
					flags: 'safe'
				},
				{
					modes: 'disabled',
					action: 'deactivated',
					label: mw.msg( 'rt-done' ),
					flags: [ 'primary', 'progressive' ]
				}
			];

			SettingsDialog.prototype.initialize = function () {
				var dialog = this;

				SettingsDialog.parent.prototype.initialize.apply( this, arguments );

				this.enableOption = new OO.ui.RadioOptionWidget( {
					label: mw.msg( 'rt-enable' )
				} );
				this.disableOption = new OO.ui.RadioOptionWidget( {
					label: mw.msg( 'rt-disable' )
				} );
				this.enableSelect = new OO.ui.RadioSelectWidget( {
					items: [ this.enableOption, this.disableOption ],
					classes: [ 'rt-enableSelect' ]
				} );
				this.enableSelect.selectItem( this.enableOption );
				this.enableSelect.on( 'choose', function ( item ) {
					if ( item === dialog.disableOption ) {
						dialog.activationMethodSelect.setDisabled( true );
						dialog.delayInput.setDisabled( true );
						dialog.tooltipsForCommentsCheckbox.setDisabled( true );
					} else {
						dialog.activationMethodSelect.setDisabled( false );
						dialog.delayInput.setDisabled( dialog.clickOption.isSelected() );
						dialog.tooltipsForCommentsCheckbox.setDisabled( false );
					}
				} );

				this.hoverOption = new OO.ui.RadioOptionWidget( {
					label: mw.msg( 'rt-hovering' )
				} );
				this.clickOption = new OO.ui.RadioOptionWidget( {
					label: mw.msg( 'rt-clicking' )
				} );
				this.activationMethodSelect = new OO.ui.RadioSelectWidget( {
					items: [ this.hoverOption, this.clickOption ]
				} );
				this.activationMethodSelect.selectItem( activatedByClick ?
					this.clickOption :
					this.hoverOption
				);
				this.activationMethodSelect.on( 'choose', function ( item ) {
					if ( item === dialog.clickOption ) {
						dialog.delayInput.setDisabled( true );
					} else {
						dialog.delayInput.setDisabled( dialog.clickOption.isSelected() );
					}
				} );
				this.activationMethodField = new OO.ui.FieldLayout( this.activationMethodSelect, {
					label: mw.msg( 'rt-activationMethod' ),
					align: 'top'
				} );

				this.delayInput = new OO.ui.NumberInputWidget( {
					input: { value: delay },
					step: 50,
					min: 0,
					max: 5000,
					disabled: activatedByClick,
					classes: [ 'rt-numberInput' ]
				} );
				this.delayField = new OO.ui.FieldLayout( this.delayInput, {
					label: mw.msg( 'rt-delay' ),
					align: 'top'
				} );

				this.tooltipsForCommentsCheckbox = new OO.ui.CheckboxInputWidget( {
					selected: tooltipsForComments
				} );
				this.tooltipsForCommentsField = new OO.ui.FieldLayout(
					this.tooltipsForCommentsCheckbox,
					{
						label: new OO.ui.HtmlSnippet( mw.msg( 'rt-tooltipsForComments' ) ),
						align: 'inline',
						classes: [ 'rt-tooltipsForCommentsField' ]
					}
				);
				new TooltippedElement(
					this.tooltipsForCommentsField.$element.find(
						'.' + ( COMMENTED_TEXT_CLASS || 'rt-commentedText' )
					)
				);

				this.fieldset = new OO.ui.FieldsetLayout();
				this.fieldset.addItems( [
					this.activationMethodField,
					this.delayField,
					this.tooltipsForCommentsField
				] );

				this.panelSettings = new OO.ui.PanelLayout( {
					padded: true,
					expanded: false
				} );
				this.panelSettings.$element.append(
					this.enableSelect.$element,
					$( '<hr>' ).addClass( 'rt-settingsFormSeparator' ),
					this.fieldset.$element
				);

				this.panelDisabled = new OO.ui.PanelLayout( {
					padded: true,
					expanded: false
				} );
				this.panelDisabled.$element.append(
					$( '<table>' )
						.addClass( 'rt-disabledHelp' )
						.append(
							$( '<tr>' ).append(
								$( '<td>' ).append(
									$( '<img>' ).attr( 'src', 'https://vi.wikipedia.org/w/load.php?modules=ext.popups.images&image=footer&format=rasterized&lang=ru&skin=vector&version=0uotisb' )
								),
								$( '<td>' )
									.addClass( 'rt-disabledNote' )
									.text( mw.msg( 'rt-disabledNote' ) )
							)
						)
				);

				this.stackLayout = new OO.ui.StackLayout( {
					items: [ this.panelSettings, this.panelDisabled ]
				} );

				this.$body.append( this.stackLayout.$element );
			};

			SettingsDialog.prototype.getSetupProcess = function ( data ) {
				return SettingsDialog.parent.prototype.getSetupProcess.call( this, data )
					.next( function () {
						this.stackLayout.setItem( this.panelSettings );
						this.actions.setMode( 'basic' );
					}, this );
			};

			SettingsDialog.prototype.getActionProcess = function ( action ) {
				var dialog = this;

				if ( action === 'save' ) {
					return new OO.ui.Process( function () {
						var newDelay = Number( dialog.delayInput.getValue() );

						enabled = dialog.enableOption.isSelected();
						if ( newDelay >= 0 && newDelay <= 5000 ) {
							delay = newDelay;
						}
						activatedByClick = dialog.clickOption.isSelected();
						tooltipsForComments = dialog.tooltipsForCommentsCheckbox.isSelected();

						setSettingsCookie();

						if ( enabled ) {
							dialog.close();
							disableRt();
							rt( $content );
						} else {
							dialog.actions.setMode( 'disabled' );
							dialog.stackLayout.setItem( dialog.panelDisabled );
							disableRt();
							addEnableLink();
						}
					} );
				} else if ( action === 'deactivated' ) {
					dialog.close();
				}
				return SettingsDialog.parent.prototype.getActionProcess.call( this, action );
			};

			SettingsDialog.prototype.getBodyHeight = function () {
				return this.stackLayout.getCurrentItem().$element.outerHeight( true );
			};

			tooltip.upToTopParent( function adjustRightAndHide() {
				if ( this.isPresent ) {
					if ( this.$element[ 0 ].style.right ) {
						this.$element.css(
							'right',
							'+=' + ( window.innerWidth - $window.width() )
						);
					}
					this.te.hideRef( true );
				}
			} );

			if ( !windowManager ) {
				windowManager = new OO.ui.WindowManager();
				$body.append( windowManager.$element );
			}

			settingsDialog = new SettingsDialog();
			windowManager.addWindows( [ settingsDialog ] );
			settingsWindow = windowManager.openWindow( settingsDialog );
			settingsWindow.opened.then( function () {
				settingsDialogOpening = false;
			} );
			settingsWindow.closed.then( function () {
				windowManager.clearWindows();
			} );
		}

		var tooltip = this;

		// Biến này có thể thay đổi: một chú thích nổi có thể được gọi từ một liên kết tham chiếu kiểu harvard
		// mà được đưa vào các chú thích nổi khác nhau
		this.te = te;

		switch ( this.te.type ) {
			case 'supRef':
				this.id = 'rt-' + this.te.$originalElement.attr( 'id' );
				this.$content = this.te.$ref
					.contents()
					.filter( function ( i ) {
						var $this = $( this );
						return this.nodeType === Node.TEXT_NODE ||
							!( $this.is( '.mw-cite-backlink' ) ||
								( i === 0 &&
									// Template:Cnote, Template:Note
									( $this.is( 'b' ) ||
										// Template:Note_label
										$this.is( 'a' ) &&
										$this.attr( 'href' ).indexOf( '#ref' ) === 0
									)
								)
							);
					} )
					.clone( true );
				break;
			case 'harvardRef':
				this.id = 'rt-' + this.te.$originalElement.closest( 'li' ).attr( 'id' );
				this.$content = this.te.$ref
					.clone( true )
					.removeAttr( 'id' );
				break;
			case 'commentedText':
				this.id = 'rt-' + String( Math.random() ).slice( 2 );
				this.$content = $( document.createTextNode( this.te.comment ) );
				break;
		}
		if ( !this.$content.length ) {
			return;
		}

		this.insideWindow = Boolean( this.te.$element.closest( '.oo-ui-window' ).length );

		this.$element = $( '<div>' )
			.addClass( 'rt-tooltip' )
			.attr( 'id', this.id )
			.attr( 'role', 'tooltip' )
			.data( 'tooltip', this );
		if ( this.insideWindow ) {
			this.$element.addClass( 'rt-tooltip-insideWindow' );
		}

		// Chúng ta cần lớp xen kẽ $content ở đây để biểu tượng cài đặt được căn lề
		// chính xác
		this.$content = this.$content
			.wrapAll( '<div>' )
			.parent()
			.addClass( 'rt-tooltipContent' )
			.addClass( 'mw-parser-output' )
			.appendTo( this.$element );

		if ( !activatedByClick ) {
			this.$element
				.mouseenter( function () {
					if ( !tooltip.disappearing ) {
						tooltip.upToTopParent( function () {
							this.show();
						} );
					}
				} )
				.mouseleave( function ( e ) {
					// Cách giải quyết từ https://stackoverflow.com/q/47649442. Chỉ dựa vào relatedTarget
					// cũng có những hạn chế: khi tab thay thế, relatedTarget cũng trống
					if ( CLIENT_NAME !== 'chrome' ||
						( !e.originalEvent ||
							e.originalEvent.relatedTarget !== null ||
							!tooltip.clickedTime ||
							$.now() - tooltip.clickedTime > 50
						)
					) {
						tooltip.upToTopParent( function () {
							this.te.hideRef();
						} );
					}
				} )
				.click( function () {
					tooltip.clickedTime = $.now();
				} );
		}

		if ( !this.insideWindow ) {
			$( '<div>' )
				.addClass( 'rt-settingsLink' )
				.attr( 'title', mw.msg( 'rt-settings' ) )
				.click( function () {
					if ( settingsDialogOpening ) {
						return;
					}
					settingsDialogOpening = true;

					if ( mw.loader.getState( 'oojs-ui' ) !== 'ready' ) {
						if ( cursorWaitCss ) {
							cursorWaitCss.disabled = false;
						} else {
							cursorWaitCss = mw.util.addCSS( 'body { cursor: wait; }' );
						}
					}
					mw.loader.using( [ 'oojs', 'oojs-ui' ], openSettingsDialog );
				} )
				.prependTo( this.$content );
		}

		// Phần tử cạnh chú chú thích nổi phải nằm bên trong phần tử nội dung chú thích nổi
		// để chú thích nổi không biến mất khi chuột đang ở trên cạnh của nó
		this.$tail = $( '<div>' )
			.addClass( 'rt-tooltipTail' )
			.prependTo( this.$element );

		this.disappearing = false;

		this.show = function () {
			this.disappearing = false;
			clearTimeout( this.te.hideTimer );
			clearTimeout( this.te.removeTimer );

			this.$element
				.removeClass( CLASSES.FADE_OUT_DOWN )
				.removeClass( CLASSES.FADE_OUT_UP );

			if ( !this.isPresent ) {
				$body.append( this.$element );
			}

			this.isPresent = true;
		};

		this.hide = function () {
			var tooltip = this;

			tooltip.disappearing = true;

			if ( tooltip.$element.hasClass( 'rt-tooltip-above' ) ) {
				tooltip.$element
					.removeClass( CLASSES.FADE_IN_DOWN )
					.addClass( CLASSES.FADE_OUT_UP );
			} else {
				tooltip.$element
					.removeClass( CLASSES.FADE_IN_UP )
					.addClass( CLASSES.FADE_OUT_DOWN );
			}

			tooltip.te.removeTimer = setTimeout( function () {
				if ( tooltip.isPresent ) {
					tooltip.$element.detach();
					
					tooltip.$tail.css( 'left', '' );

					if ( activatedByClick ) {
						$body.off( 'click.rt touchstart.rt', tooltip.te.onBodyClick );
					}
					$window.off( 'resize.rt', tooltip.te.onWindowResize );

					tooltip.isPresent = false;
				}
			}, 200 );
		};

		this.calculatePosition = function ( ePageX, ePageY ) {
			var teElement, teOffsets, teOffset, tooltipTailOffsetX, tooltipTailLeft,
				offsetYCorrection = 0;

			this.$tail.css( 'left', '' );

			teElement = this.te.$element.get( 0 );
			if ( ePageX !== undefined ) {
				tooltipTailOffsetX = ePageX;
				teOffsets = teElement.getClientRects &&
					teElement.getClientRects() ||
					teElement.getBoundingClientRect();
				if ( teOffsets.length > 1 ) {
					for (var i = teOffsets.length - 1; i >= 0; i--) {
						if ( ePageY >= Math.round( $window.scrollTop() + teOffsets[i].top ) &&
							ePageY <= Math.round(
								$window.scrollTop() + teOffsets[i].top + teOffsets[i].height
							)
						) {
							teOffset = teOffsets[i];
						}
					}
				}
			}

			if ( !teOffset ) {
				teOffset = teElement.getClientRects &&
					teElement.getClientRects()[0] ||
					teElement.getBoundingClientRect();
			}
			teOffset = {
				top: $window.scrollTop() + teOffset.top,
				left: $window.scrollLeft() + teOffset.left,
				width: teOffset.width,
				height: teOffset.height
			};
			if ( !tooltipTailOffsetX ) {
				tooltipTailOffsetX = ( teOffset.left * 2 + teOffset.width ) / 2;
			}
			if ( CLIENT_NAME === 'msie' && this.te.type === 'supRef' ) {
				offsetYCorrection = -Number(
					this.te.$element.parent().css( 'font-size' ).replace( 'px', '' )
				) / 2;
			}
			this.$element.css( {
				top: teOffset.top - this.$element.outerHeight() - 7 + offsetYCorrection,
				left: tooltipTailOffsetX - 20,
				right: ''
			} );

			// Nó có bị bóp méo so với phần bên phải của trang không?
			if ( this.$element.offset().left + this.$element.outerWidth() > $window.width() - 1 ) {
				this.$element.css( {
					left: '',
					right: 0
				} );
				tooltipTailLeft = tooltipTailOffsetX - this.$element.offset().left - 5;
			}

			// Một phần của nó có nằm trên đầu màn hình không?
			if ( teOffset.top < this.$element.outerHeight() + $window.scrollTop() + 6 ) {
				this.$element
					.removeClass( 'rt-tooltip-above' )
					.addClass( 'rt-tooltip-below' )
					.addClass( CLASSES.FADE_IN_UP )
					.css( {
						top: teOffset.top + teOffset.height + 9 + offsetYCorrection
					} );
				if ( tooltipTailLeft ) {
					this.$tail.css( 'left', ( tooltipTailLeft + 12 ) + 'px' );
				}
			} else {
				this.$element
					.removeClass( 'rt-tooltip-below' )
					.addClass( 'rt-tooltip-above' )
					.addClass( CLASSES.FADE_IN_DOWN )
					// Cách khắc phục các trường hợp chú thích nổi được hiển thị một lần sau đó bị định vị sai khi nó được hiển thị lại
					// sau khi thay đổi kích thước cửa sổ. Chúng tôi chỉ lặp lại những gì ở trên.
					.css( {
						top: teOffset.top - this.$element.outerHeight() - 7 + offsetYCorrection
					} );
				if ( tooltipTailLeft ) {
					// 12 là chiều rộng/chiều cao của phần tử cạnh
					this.$tail.css( 'left', tooltipTailLeft + 'px' );
				}
			}
		};

		// Chạy một số chức năng cho tất cả các chú thích nổi cho đến chú giải trên cùng trong một cây. Bối cảnh của nó sẽ là
		// chú thích nổi, trong khi các tham số của nó có thể được chuyển đến Tooltip.upToTopParent dưới dạng một mảng
		// trong tham số thứ hai. Nếu tham số thứ ba được truyền đến ToolTip.upToTopParent là true,
		// thì việc thực thi sẽ dừng khi hàm được đề cập trả về true lần đầu tiên,
		// và ToolTip.upToTopParent cũng trả về true.
		this.upToTopParent = function ( func, parameters, stopAtTrue ) {
			var returnValue,
				currentTooltip = this;

			do {
				returnValue = func.apply( currentTooltip, parameters );
				if ( stopAtTrue && returnValue ) {
					break;
				}
			} while ( currentTooltip = currentTooltip.parent );

			if ( stopAtTrue ) {
				return returnValue;
			}
		};
	}

	if ( !enabled ) {
		addEnableLink();
		return;
	}

	teSelector = REF_LINK_SELECTOR;
	if ( tooltipsForComments ) {
		teSelector += ', ' + COMMENTED_TEXT_SELECTOR;
	}
	$content.find( teSelector ).each( function () {
		new TooltippedElement( $( this ) );
	} );
}

settingsString = mw.cookie.get( 'RTsettings', '' );
if ( settingsString ) {
	settings = settingsString.split( '|' );
	enabled = Boolean( Number( settings[ 0 ] ) );
	delay = Number( settings[ 1 ] );
	activatedByClick = Boolean( Number( settings[ 2 ] ) );
	// Giá trị thứ tư đã được thêm vào sau đó, vì vậy chúng tôi cung cấp giá trị mặc định. Xem ghi chú bên dưới
	// để biết lý do tại sao chúng tôi sử dụng "IS_TOUCHSCREEN && IS_MOBILE".
	tooltipsForComments = settings[ 3 ] === undefined ?
		IS_TOUCHSCREEN && IS_MOBILE :
		Boolean( Number( settings[ 3 ] ) );
} else {
	enabled = true;
	delay = 200;
	// Vì kiểm tra trình duyệt trên thiết bị di động dễ xảy ra lỗi, việc thêm điều kiện IS_MOBILE ở đây có thể
	// sẽ để lại các trường hợp người dùng tương tác với trình duyệt bằng cách chạm không biết cách gọi ra
	// chú thích nổi để chuyển sang kích hoạt bằng cách nhấn. Một số người dùng máy tính xách tay hỗ trợ cảm ứng
	// tương tác bằng cách chạm (mặc dù có lẽ không phải là trường hợp sử dụng phổ biến nhất) cũng sẽ không hài lòng.
	activatedByClick = IS_TOUCHSCREEN;
	// Có thể cho rằng chúng ta không nên chuyển đổi chú thích nổi gốc thành chú thích nổi là tiện ích cho các thiết bị có
	// hỗ trợ chuột, ngay cả khi chúng có màn hình cảm ứng (có những máy tính xách tay có màn hình cảm ứng).
	// Việc kiểm tra IS_TOUCHSCREEN ở đây là để đảm bảo độ tin cậy, vì kiểm tra trên thiết bị di động dễ gây ra hiện tượng
	// dương tính giả.
	tooltipsForComments = IS_TOUCHSCREEN && IS_MOBILE;
}

mw.hook( 'wikipage.content' ).add( rt );

}() );
