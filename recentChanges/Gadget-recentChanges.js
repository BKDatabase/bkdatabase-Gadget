/**
 *		Recent changes sidebar gadget for Citizen skin
 *		Originally created by @author JaydenKieran (RunescapeWiki), adapted to the Citizen skin by Forte (ProleWiki)
**/
"use strict";


(function($, mw) {
	function format_time(seconds) {
		var unit_str = '';
		var n = '';
		if (seconds < 60) {
			unit_str = 's';				// Shorthand for seconds
			n = seconds;
		} else if (seconds < 3600) {
			unit_str = 'm';				// Same for minutes
			n = Math.floor(seconds/60);
		} else if (seconds < 86400) {
			unit_str = 'h';				// Hours...
			n = Math.floor(seconds/3600);
		} else if (seconds >= 86400) {
			unit_str = 'd';				// You get the point
			n = Math.floor(seconds/86400);
		} else {
			unit_str = 'm';				// Defaults to minutes in case shit goes wrong
			n = 1 + Math.floor(Math.random() * 10);
		}
		return n + unit_str + ' ago';	// Produces e.g. for (n=3 | unit_str="h"): "3h ago". 
										// Change text and order to your language
	}
	// Text to be changed according to language
	var str_recentChanges = 'Recent changes';		
	var str_noRecentChanges = 'No recent changes.';
	var str_recentLink = '/wiki/Special:RecentChanges';
	var str_seeMore = 'See more...';
    var $prependTo;
    var $rcContainer;
    var recentChanges;
    var $recentChangesDOM;
    var $final;

    function init() {
        $prependTo = $('#p-navigation');
        var api = new mw.Api();
        
    	$final = $('<ul>').after($rcContainer);
		var $div = $('<div>').text(str_recentChanges)
    		.addClass('citizen-menu__heading');
        $rcContainer = $('<nav>')
			.addClass('citizen-menu mw-portlet mw-portlet-RecentChanges')
			.attr('id', 'p-RecentChanges')
			.append($div)
			.append($final);
        
        // Add the container to the sidebar
        $prependTo.after($rcContainer)

        api.get({
                action: "query",
                list: "recentchanges",
                rcprop: "title|timestamp|sizes|user",
                rcnamespace: "0|3000",
                rclimit: "5",
                rctype: "edit|new",
                rcshow: "!bot|!redirect",
                rctoponly: 1,
                format: "json"
            })
            .done(function(data) {
                if (data.query && data.query.recentchanges) {
                    recentChanges = data.query.recentchanges
                }

                if (recentChanges.length > 0) {
                    var Time = 1;
                    $recentChangesDOM = recentChanges.map(function(rc) {
                        const timeMatch = rc.timestamp.match(/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/);
                    	var editYear = timeMatch[1];
                    	var editMonth = timeMatch[2];
                    	var editDay = timeMatch[3];
                    	var editHour = timeMatch[4];
                    	var editMinute = timeMatch[5];
                    	var editSecond = timeMatch[6];
                    	
                    	var editDate = new Date(editYear, (editMonth-1), editDay, editHour, editMinute, editSecond);
						var currentDate = new Date();
						currentDate = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000)
						var diffDate = currentDate - editDate;
						var diffSeconds = Math.floor(diffDate/(1000));
						
						Time = format_time(diffSeconds) + ' – ';
						
						var $a = $('<a>')
                            .css('white-space', 'normal')
                            .addClass('rc-sidebar-page')
                            .css({
                            	'padding-top': '0.25em',
                            	'padding-bottom': '0.25em'
                            })
                            .text(' ' + rc.title)
                            .attr('href', new mw.Title(rc.title).getUrl());
                        var $p = $('<p>')
                            .css({
                            	'text-align': 'right',
                            	'margin-right': '2.5em'
                            	})
                            .addClass('rc-sidebar-user')
                            .text(Time)
                            .append(
                                $('<a>')
                                .css({
                            	'display' : 'contents',
                            	'padding' : '0px'
                                })
                                .text(rc.user)
                                .attr('href', new mw.Title(rc.user, 2).getUrl())
                            );
                        return $('<li>').addClass('mw-list-item').append($a,$p);
                    })
                } else {
                    $recentChangesDOM = $('<p>').text(str_noRecentChanges)
                }
                $final.append($recentChangesDOM)
                var $showMore
				$showMore = $('<div>')
                	.addClass('rc-sidebar-item rc-sidebar-more')
                	.append(
                		$('<a>')
                		.addClass('rc-sidebar-page')
                		.text(str_seeMore)
                		.attr('href', str_recentLink)
                )
                $final.append($showMore)
            })
            .fail(function(_, data) {
                alert(data.error.info)
            });
    }

    mw.loader.using(['mediawiki.util', 'mediawiki.api'], function() {
        $(init)
    })
}(jQuery, mediaWiki));
