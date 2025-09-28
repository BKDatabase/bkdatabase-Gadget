$.when($.ready, mw.loader.using(['mediawiki.util', 'mediawiki.api'])).then(function() {
    var inDarkMode = !!mw.user.options.get('gadget-dark-mode');

    mw.util.addPortletLink('p-personal', '#', 'Chế độ tối', 'pt-darkmode', inDarkMode ? 'Tắt chế độ tối' : 'Bật chế độ tối', '', '#pt-watchlist');

    $('#pt-darkmode').on('click', function(e) {
        e.preventDefault();
        mw.notify(inDarkMode ? 'Đang tắt chế độ tối ...' : 'Đang bật chế độ tối ...');
        new mw.Api().saveOption('gadget-dark-mode', inDarkMode ? '0' : '1').then(function() {
            location.reload();
        });
    });
});
