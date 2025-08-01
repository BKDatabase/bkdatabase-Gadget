/*
   PrettyLog - reformat log pages. If the log contains file uploads, add small thumbnails of the
   files. If the GalleryDetails gadget is also activated, make sure that it adds its sidebar link.

   Authors: [[User:Lupo]], January 2009; [[User:Ilmari Karonen]], April 2010
   License: Quadruple licensed GFDL, GPL, LGPL and Creative Commons Attribution 3.0 (CC-BY-3.0)
*/
/*global mediaWiki, jQuery, GalleryDetailsLoader, stylepath*/
/*jshint laxbreak:true, curly:false*/
if (mediaWiki.config.get('wgCanonicalSpecialPageName') === "Log") 
jQuery(document).ready(function () {
'use strict';
    var mw = mediaWiki;
    var $ = jQuery;
    var wgServer = mw.config.get('wgServer');
	
    var maxThumbWidth = 70;
    var maxThumbHeight = 70;

    var apiBatchSize = 50;

    var content = mw.util.$content[0];
    if (!content) return;

    var list = content.getElementsByTagName("ul")[0];
    if (!list) return;
    list.className = 'mw-search-results';

    // That's all that's needed for the pretty layout!  All code below is for the image thumbnails.

    // Get list of upload log entries, abort early if there are none.
    var uploads = $(list).children('li.mw-logline-upload');
    
    if (!uploads || uploads.length === 0) return;

    // Find image links within each upload entry.  For simplicity, we assume that all links are in
    // canonical prefixed text form, and that all file links thus begin with ns6prefix.  Otherwise
    // we'd have to extract and normalize the namespace prefix and look for it in wgNamespaceIds.
    var ns6prefix = mw.config.get('wgFormattedNamespaces')[6] + ":";
    var imageLocations = {};
	var links, title;
    for (var i = 0; i < uploads.length; i++) {
        links = uploads[i].getElementsByTagName("a");
        for (var j = 0; j < links.length; j++) {
            title = links[j].title;
            if (!title || title.substring(0, ns6prefix.length) !== ns6prefix) continue;
            // Skip any redlinks, links in log summaries and links to uploaders' user/talk/contribs/etc. pages
            for (var e = links[j]; title && e && e !== uploads[i]; e = e.parentNode) {
                if ( /(^|\s)(new|comment|mw-userlink|mw-usertoollinks|mw-revdelundel-link|searchResultImage)(\s|$)/.test(e.className) ) title = null;
            }
            if (title) {
                if (!imageLocations[title]) imageLocations[title] = [];
                imageLocations[title].push(uploads[i]);
            }                 
        }
    }
    uploads = links = null;  // we don't need these NodeLists anymore

    // Callback function to show the thumbnails:
    var prettyLogAddThumbnails = function (result) {
        var i;
        if (result.error || !result.query || !result.query.pages)
            throw new Error("PrettyLog: kết quả API ngoài dự tính:\n" + result.toSource());
 
        // hopefully we don't get any normalization, but just in case...
        if (result.query.normalized) {
            var norm = result.query.normalized;
            for (i = 0; i < norm.length; i++) {
                imageLocations[norm[i].to] = imageLocations[norm[i].from].concat( imageLocations[norm[i].to] || [] );
            }
        }

        // now loop over the result and insert thumbs
        var pages = result.query.pages;
        for (var id in pages) {
        if (pages.hasOwnProperty(id)) {
            var title = pages[id].title;
            if (!title) continue;  // should not happen

            if (pages[id].imagerepository && pages[id].imagerepository === "shared")
                continue;  // don't show thumbnails for remote images (could happen if an image shadowing a Commons image is uploaded locally and deleted)
 
            var info = pages[id].imageinfo;
            if (!info || !info.length) continue;  // can happen if the image has been deleted, or if it wasn't an image at all
            info = info[0];
			
            if (!info.thumburl) {
                // KLUGE: for some reason, audio files sometimes get no thumburl; fix it here
                // TODO(?): there are more file type icons we could match to MIME types if needed
                if (/^(audio\/|application\/ogg$)/.test(info.mime)) {
                    info.thumburl = stylepath + "/common/images/icons/fileicon-ogg.png";
                } else {
                    info.thumburl = stylepath + "/common/images/icons/fileicon.png";  // generic fallback icon
                }
                info.thumbwidth = info.thumbheight = 120;  // all icons are currently 120x120
            }
 
            if (!info.thumbwidth || !info.thumbheight) continue;  // can't happen?

            // if the returned thumb is too large for some reason, scale it proportionately so it fits
            if (info.thumbheight > maxThumbHeight) {
                info.thumbwidth *= maxThumbHeight / info.thumbheight;
                info.thumbheight = maxThumbHeight;
            }
            if (info.thumbwidth > maxThumbWidth) {
                info.thumbheight *= maxThumbWidth / info.thumbwidth;
                info.thumbwidth = maxThumbWidth;
            }
            
            // if the URL is local, strip the hostname prefix (avoids needless external link icons on some browsers)
            if (info.descriptionurl.indexOf(wgServer + "/") === 0)
                info.descriptionurl = info.descriptionurl.substring(wgServer.length);

            var loglines = imageLocations[title];
            if (!loglines) continue;  // should not happen

            for (i = 0; i < loglines.length; i++) {
                // safety check: don't process the same line twice
                if (/^table$/i.test(loglines[i].firstChild.tagName)) continue;

                // create image and link elements for the thumbnail
                var img = document.createElement("img");
                img.src = info.thumburl;
                img.width = Math.round(info.thumbwidth);
                img.height = Math.round(info.thumbheight);

                var link = document.createElement("a");
                link.href = info.descriptionurl;
                link.title = title;
                link.className = "image";
                link.appendChild(img);

                // transform the contents of this logline into a table
                var tbl = document.createElement("table");
                tbl.className = "searchResultImage";
                var tr = tbl.insertRow(-1);
                tr.setAttribute("valign", "top");

                var td = document.createElement("td");
                td.width = maxThumbWidth + 10;
                td.setAttribute("align", "center");
                td.appendChild(link);
                tr.appendChild(td);

                td = document.createElement("td");
                while (loglines[i].firstChild) td.appendChild(loglines[i].firstChild);
                tr.appendChild(td);

                loglines[i].appendChild (tbl);
            }
        }
        }

        // if [[MediaWiki:Gadget-GalleryDetails.js]] is enabled but inactive, rerun it now that we have some images
        if (typeof (GalleryDetailsLoader) !== 'undefined' && !document.getElementById('t-gallerydetails') && GalleryDetailsLoader.initialized) {
            GalleryDetailsLoader.initialize();        
        }
    };

    // Build array of unique image titles and URL-encode them.
    var images = [];
    for (title in imageLocations) {
        if (imageLocations.hasOwnProperty(title) && typeof title === 'string') images.push( title );
    }

    // Make the queries in batches, to avoid tripping API and prevent freezing the browser or a 500 server error due to a overlong query.
	var n, imageslength = images.length;
    for (n = 0; n < imageslength; n+=50) {
		$.post(mw.util.wikiScript('api')
		, { format: 'json'
			,action: 'query'
			,maxage: 3600
			,smaxage: 3600
			,prop: 'imageinfo'
			,iiprop: 'url|mime'
			,iiurlwidth: maxThumbWidth
			,iiurlheight: maxThumbHeight
			,titles: images.slice(n, n+50).join('|')
		} ,prettyLogAddThumbnails);
    }
});
