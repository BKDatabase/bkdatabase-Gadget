/**
 * Tin nhắn theo giờ địa phương
 * 
 * Sửa lại các dấu thời gian trong chữ ký trong các trang thảo luận để sử dụng
 * giờ địa phương tương đối dễ hiểu hơn giờ UTC tuyệt đối.
 * 
 * Phỏng theo [[:w:Wikipedia:Comments in Local Time]].
 */
// [[w:en:User:Mxn/CommentsInLocalTime]]
mw.loader.load("//en.wikipedia.org/w/index.php?title=User:Mxn/CommentsInLocalTime.js&action=raw&ctype=text/javascript");
window.LocalComments = $.extend(window.LocalComments, {
	excludeNamespaces: [-1, 0, 8, 100],
	formatOptions: {
		// https://doc.wikimedia.org/mediawiki-core/1.34.0/php/MessagesVi_8php.html#a2fc93ea5327f655d3ed306e221ee33f0
		"vi normal": "HH:mm, [ngày] D [tháng] M [năm] YYYY", // H:i, "ngày" j "tháng" n "năm" Y
		"vi spelloutmonth": "HH:mm, [ngày] D MMMM [năm] YYYY", // H:i, "ngày" j xg "năm" Y
		"vi shortcolon": "HH:mm, D/M/YYYY", // H:i, j/n/Y
		"vi shorth": "HH[h]mm, D/M/YYYY", // H"h"i, j/n/Y
		"ISO 8601": "YYYY-MM-DDTHH:mm:ss", // xnY-xnm-xnd"T"xnH:xni:xns
	},
	parseFormat: [
		"HH:mm, [ngày] D [tháng] M [năm] YYYY",
		"H:m, D MMM YYYY"
	],
	parseRegExp: /\d\d:\d\d, (?:ngày )?\d\d? (?:tháng \d\d?(?: năm)?|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \(UTC\)/
});
