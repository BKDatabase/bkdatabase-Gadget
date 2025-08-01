/**
 * Written and maintained by [[m:User:Mike.lifeguard]] at en.wikibooks.org and meta.wikimedia.org.
 */
$(function(){
	if (mw.config.get('wgAction') == "delete") {
		var wpReason = document.getElementById("wpReason");
		if (!wpReason) return;
		var regexp = /(content was|page was empty|content before blanking was)/i;
		if (regexp.test(wpReason.value)){
			wpReason.value = "";
		}
	}
});
