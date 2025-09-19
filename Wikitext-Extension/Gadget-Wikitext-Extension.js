/**
 * Wikitext-Extension-Gadget
 * Based on The Apple Wiki https://theapplewiki.com/wiki/MediaWiki:Gadget-Wikitext-Extension.js
 *
 * Adapted from https://github.com/Frederisk/Wikitext-Extension-Gadget/blob/d5a1537/src/index.ts
 * Modified by The Apple Wiki to support all editor options via gadget checkboxes
 *
 * @copyright Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 * @license [https://github.com/Frederisk/Wikitext-Extension-Gadget/blob/main/LICENSE.txt MIT License]
 */
// <nowiki>

(function(mw, $) {
	'use strict';

	// Check if it is a touch device
	if(window.matchMedia('(hover: none)').matches) {
		// Device is likely not on VSCode supported OS
		return;
	}

	// check is editable or its source can be viewed
	if (!mw.config.get('wgIsProbablyEditable') && $('#ca-viewsource').length === 0) {
		// if not, do nothing
		return;
	}

	var configs = {
		VSCode: {
			shortName: 'Code',
			fullName: 'Visual Studio Code',
			scheme: 'vscode'
		},
		VSCodeInsiders: {
			shortName: 'Code',
			fullName: 'Visual Studio Code - Insiders',
			scheme: 'vscode-insiders'
		},
		VSCodium: {
			shortName: 'VSCodium',
			fullName: 'VSCodium',
			scheme: 'vscodium'
		}
	};

	// Load the config for the option the user selected.
	var config = {};
	var configNames = ['VSCode', 'VSCodeInsiders', 'VSCodium'];
	for (var i = 0; i < configNames.length; i++) {
		var name = configNames[i];
		if (mw.user.options.get('gadget-Wikitext-Extension-' + name) === '1') {
			config = configs[name];
			break;
		}
	}

	// i18n
	var i18nSource = {
		english: {
			text: 'Open in $1',
			tooltip: 'Open this page in $1',
		},
		russian: {
			text: 'Открыть в $1',
			tooltip: 'Открыть эту страницу в $1',
		},
		japanese: {
			text: '$1 で開く',
			tooltip: 'このページを $1 で開く',
		},
		cantonese: {
			text: '開啟於 $1',
			tooltip: '喺 $1 開呢個頁面',
		},
		simplified_chinese: {
			text: '在 $1 中打开',
			tooltip: '在 $1 中打开此页面',
		},
		traditional_chinese: {
			text: '使用 $1 開啟',
			tooltip: '以 $1 開啟此頁面',
		},
		korean: {
			text: '$1 에서 열기',
			tooltip: '이 페이지를 $1 에서 열기',
		},
		thai: {
			text: 'เปิดใน $1',
			tooltip: 'เปิดหน้านี้ใน $1',
		},
		vietnamese: {
			text: 'Mở trong $1',
			tooltip: 'Mở trang này trong $1',
		},
		indonesian: {
			text: 'Buka di $1',
			tooltip: 'Buka halaman ini di $1',
		},
		polish: {
			text: 'Otwórz w $1',
			tooltip: 'Otwórz tę stronę w $1',
		},
		dutch: {
			text: 'Open in $1',
			tooltip: 'Open deze pagina in $1',
		},
		french: {
			text: 'Ouvrir dans $1',
			tooltip: 'Ouvrir cette page dans $1',
		},
		german: {
			text: 'Öffnen in $1',
			tooltip: 'Öffne diese Seite in $1',
		},
	};
	var i18n = {
		'en': i18nSource['english'],
		'ru': i18nSource['russian'],
		'ja': i18nSource['japanese'],
		'ko': i18nSource['korean'],
		'yue': i18nSource['cantonese'],
		'zh-yue': i18nSource['cantonese'],
		'zh': i18nSource['simplified_chinese'],
		'zh-hans': i18nSource['simplified_chinese'],
		'zh-cn': i18nSource['simplified_chinese'],
		'zh-sg': i18nSource['simplified_chinese'],
		'zh-my': i18nSource['simplified_chinese'],
		'zh-hant': i18nSource['traditional_chinese'],
		'zh-tw': i18nSource['traditional_chinese'],
		'zh-hk': i18nSource['traditional_chinese'],
		'zh-mo': i18nSource['traditional_chinese'],
		'th': i18nSource['thai'],
		'vi': i18nSource['vietnamese'],
		'id': i18nSource['indonesian'],
		'pl': i18nSource['polish'],
		'nl': i18nSource['dutch'],
		'fr': i18nSource['french'],
		'de': i18nSource['german'],
	};
	var lang = mw.config.get('wgUserLanguage');
	var displayInfo = Object.assign(
		{},
		i18nSource['english'], // default language
		i18n[lang.split('-')[0]], // language without region
		i18n[lang] // exact language
	);

	var shortName = config.shortName;
	var fullName = config.fullName;
	var scheme = config.scheme;

	var extensionID = 'rowewilsonfrederiskholme.wikitext';
	var actionPath = '/PullPage';
	var args = {
		RemoteBot: 'true',
		TransferProtocol: window.location.protocol,
		// 'https://host' => '//host': https://www.mediawiki.org/wiki/Manual:$wgServer
		SiteHost: mw.config.get('wgServer').replace(/^[\w-]*?:(?=\/\/)/, ''),
		APIPath: mw.util.wikiScript('api'),
		Title: mw.config.get('wgPageName')
	};

	mw.util.addPortletLink(
		'p-views',
		scheme + '://' + extensionID + actionPath + '?' + new URLSearchParams(args).toString(),
		displayInfo['text'].replace('$1', shortName),
		'wikitext-extension-gadget-' + scheme,
		displayInfo['tooltip'].replace('$1', fullName),
		undefined,
		'#ca-history'
	);

	// @ts-expect-error - mediaWiki and jQuery are available in the global scope
})(mediaWiki, jQuery);
