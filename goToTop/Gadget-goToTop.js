/* [[Category:BKDatabase scripts]]
This script was created by Majr of the Minecraft Wiki.
The original script is available here:
http://minecraftwiki.net/wiki/User:Majr/goToTop.js/ */
$(function(){
'use strict';
// i18n
const i18nSource = {
    vi: {
        toTop: "▲ Lên đầu trang"
    },
    en: {
        toTop: "▲ Back to top"
    },
    es: {
    	toTop: "▲ Volver arriba"
    },
    de: {
    	toTop: "▲ Zurück zum Seitenanfang"
    },
    fr: {
    	toTop: "▲ Retour en haut"
    },
    ru: {
    	toTop: "▲ Вверх страницы"
    },
    zh: {
    	toTop: "▲ 返回顶部"
    },
    "zh-tw": {
    	toTop: "▲ 回到頂部"
    },
    yue: {
    	toTop: "▲ 回到頂部"
    },
    ja: {
        toTop: "▲ ページの上へ"
    }
};
var i18n = {
	'en': i18nSource['en'],
	'vi': i18nSource['vi'],
	'es': i18nSource['es'],
	'de': i18nSource['de'],
	'fr': i18nSource['fr'],
	'ru': i18nSource['ru'],
	'zh': i18nSource['zh'],
	'zh-tw': i18nSource['zh-tw'],
	'yue': i18nSource['yue'],
	'ja': i18nSource['ja']
};
var lang = mw.config.get('wgUserLanguage');
	var displayInfo = Object.assign(
		{},
		i18nSource['en'], // default language
		i18n[lang.split('-')[0]], // language without region
		i18n[lang] // exact language
	);

$('body').append(`<span id="to-top">${displayInfo.toTop}</span>`);
var $topButton = $('#to-top');

$topButton.css({
	'color': '#000',
	'position': 'fixed',
	'bottom': '-30px',
	'left': '4px',
	'cursor': 'pointer',
	'transition': 'bottom 0.5s',
	'-webkit-transition': 'bottom 0.5s',
	'user-select': 'none',
	'-webkit-user-select': 'none',
	'-moz-user-select': 'none',
	'-ms-user-select': 'none',
	'z-index': 1
}).click(function(){
	$('html, body').animate({scrollTop: 0},'slow');
});

$(window).scroll(function(){
	if ($(window).scrollTop() > 100 ) {
		$topButton.css('bottom', '4px');
	}else{
		$topButton.css('bottom', '-30px');
	}
});
});
