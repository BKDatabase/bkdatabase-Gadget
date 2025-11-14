(function(mw) {
	'use strict';
	if (
		['Allpages', 'Prefixindex'].indexOf(mw.config.get('wgCanonicalSpecialPageName')) === -1 ||
		window.AllPagesHideRedirectLoaded
	) {
		return;
	}
	window.AllPagesHideRedirectLoaded = true;

	var sheet, button, labelSpan;

	function update() {
		sheet.disabled = !sheet.disabled;
		labelSpan.textContent = sheet.disabled ? 'Hide Redirects' : 'Show Redirects';
	}

	function init() {
		sheet = mw.util.addCSS('.allpagesredirect { display: none; }');

		// Create the wrapper span
		var wrapper = document.createElement('span');
		wrapper.id = 'toggle-redirects-button';
		wrapper.className = 'mw-htmlform-submit oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-labelElement oo-ui-flaggedElement-primary oo-ui-flaggedElement-progressive oo-ui-buttonInputWidget';
		wrapper.setAttribute('data-ooui', JSON.stringify({
			_: "OO.ui.ButtonInputWidget",
			type: "button",
			value: "Show Redirects",
			label: "Show Redirects",
			flags: ["primary", "progressive"],
			classes: ["mw-htmlform-submit"]
		}));

		// Create the actual button
		button = document.createElement('button');
		button.type = 'button';
		button.tabIndex = 0;
		button.value = 'Show Redirects';
		button.className = 'oo-ui-inputWidget-input oo-ui-buttonElement-button webfonts-changed';
		button.innerHTML = `
			<span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon oo-ui-image-invert"></span>
			<span class="oo-ui-labelElement-label">Show Redirects</span>
			<span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator oo-ui-image-invert"></span>
		`;

		labelSpan = button.querySelector('.oo-ui-labelElement-label');
		button.addEventListener('click', update);

		// Append button into wrapper
		wrapper.append(button);

		// Append wrapper into the form area
		var target = document.getElementsByClassName('mw-htmlform-submit-buttons')[0];
		if (target) {
			target.append(wrapper);
		}
	}

	mw.loader.using('mediawiki.util').then(init);
})(window.mediaWiki);
