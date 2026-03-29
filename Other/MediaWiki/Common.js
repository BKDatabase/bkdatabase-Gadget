/* Bất kỳ mã JavaScript ở đây sẽ được tải cho tất cả các thành viên khi tải một trang nào đó lên. */


/* Import Script */
importScript("MediaWiki:DiscordCompact.js");
importScript("MediaWiki:Photoslider.js");
/* Background Gadget */
importScript("MediaWiki:BackgroundImage.js")
/*Biểu tượng ổ khóa nhằm thay thế cho [[Bản mẫu:Khóa]] và [[Module:Protection banner]]*/
importScript('MediaWiki:Indicator.js');

/* Discord script hoạt động cùng cho [[MediaWiki:DiscordCompact.js]], chỉ sử dụng được cho tối đa một server duy nhất (Experimental!) */
// Discord Widget //

$('#discord-widget').html(`
  <iframe 
    src="https://discord.com/widget?id=876285517459755118&theme=dark"
    style="width: 100%; max-width: 840px; height: 500px; border: none;"
    allowtransparency="true"
    frameborder="0"
    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
    title="Discord Integrator"
  ></iframe>
`);
/* InputUserName script */
;(function ($, mw) {
    'use strict';
    var username = mw.config.get('wgUserName');
    if (
        window.disableUsernameReplace ||
        !username
    ) {
        return;
    }
    window.disableUsernameReplace = true;
    var $rail = $('#BKDatabaseRail'),
        customSelector = window.UsernameReplaceSelector
            ? ', ' + window.UsernameReplaceSelector
            : '';
    function inputUsername($content) {
        $content.find('.InputUsername, .insertusername' + customSelector).text(username);
    }
    mw.hook('wikipage.content').add(inputUsername);
    if ($rail.hasClass('loaded')) {
        inputUsername($rail);
    } else if ($rail.length) {
        $rail.on('afterLoad.rail',
            inputUsername.bind(null, $rail)
        );
    }
})(window.jQuery, window.mediaWiki);
/* ImageAnnotator */
// Not on Special pages, and only if viewing the page
if (mw.config.get( 'wgNamespaceNumber' ) !== -1 && ['view', 'submit'].indexOf(mw.config.get('wgAction') ) !== -1 ) {
 if (typeof ImageAnnotator_disable === 'undefined' || !ImageAnnotator_disable) {
  // Don't even import it if it's disabled.
  mw.loader.load( '/w/index.php?title=MediaWiki:Gadget-ImageAnnotator.js&action=raw&ctype=text/javascript' ); // Backlink: [[MediaWiki:Gadget-ImageAnnotator.js]]
  mw.loader.load( '/w/index.php?title=MediaWiki:Gadget-ImageAnnotator.css&action=raw&ctype=text/css', 'text/css' ); // Backlink: [[MediaWiki:Gadget-ImageAnnotator.css]]
 }
}
