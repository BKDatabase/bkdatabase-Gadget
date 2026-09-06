$( function () {
    var tab, tablink, skin;

    tab = document.getElementById('ca-addsection');
    if ( !tab ) {
        return;
    }

    skin = mw.config.get( 'skin' );
    tablink = tab.getElementsByTagName( skin === 'vector' ? 'span' : 'a' )[0];
    if ( !tablink ) {
        return;
    }

    tablink.firstChild.nodeValue = '+';
    if ( skin === 'monobook' ) {
      tablink.style.paddingLeft = ".4em";
      tablink.style.paddingRight = ".4em";
    }
});