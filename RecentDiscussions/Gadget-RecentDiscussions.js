/* Mã nguồn được phái sinh từ bản gốc của [[mh:User:CoolMikeHatsune22]] theo giấy phép BSD-3-Clause: https://github.com/ccxtwf/VocaloidLyricsWikiInterfaceCode/blob/main/src/gadgets/moderation/rc-discussion/rc-discussion.ts */
function getParamValue(param, url) {
  return new URL(url).searchParams.get(param);
}
function parseRcFeeds(parser2, rss) {
  const data = parser2.parseFromString(rss, "application/xml");
  const items = Array.from(data.querySelectorAll("item"));
  return items.map((item) => {
    var _a, _b, _c, _d;
    const xmlString = decodeXmlContents((_a = item.querySelector("description")) == null ? void 0 : _a.innerHTML);
    const pageTitle = (_b = item.querySelector("title")) == null ? void 0 : _b.innerHTML;
    const author = item.getElementsByTagName("dc:creator")[0].innerHTML;
    const rTimestamp = (_c = item.querySelector("pubDate")) == null ? void 0 : _c.innerHTML;
    const timestamp = !rTimestamp ? null : Date.parse(rTimestamp);
    const link = decodeXmlContents((_d = item.querySelector("link")) == null ? void 0 : _d.innerHTML);
    const doc = parser2.parseFromString(`<html>${xmlString}</html>`, "application/xml");
    const fromRev = +(getParamValue("oldid", link) || 0);
    const toRev = +(getParamValue("diff", link) || 0);
    const isNewPage = fromRev === 0;
    const hasMultipleRevs = doc.querySelector("td.diff-multi") !== null;
    const summaryNode = doc.querySelector("p:first-child");
    const commentHeadingNode = (summaryNode == null ? void 0 : summaryNode.querySelector("span.autocomment")) || null;
    let commentHeading = null;
    let commentType = null;
    let isReply = false;
    if (commentHeadingNode !== null) {
      commentHeading = commentHeadingNode.textContent.replace(/\s*:\s*$/, "");
      commentType = ((summaryNode == null ? void 0 : summaryNode.textContent) || "").replace(commentHeadingNode.textContent, "").trim();
      if (commentType === "Reply") {
        isReply = true;
      }
    }
    let textAdditions = null;
    if (isNewPage) {
      textAdditions = [];
      Array.from(doc.documentElement.children).slice(2).forEach((el) => {
        Array.from(el.childNodes).forEach((c) => {
          textAdditions.push(c.tagName === "br" ? "" : c.textContent.trim());
        });
      });
    } else if (!hasMultipleRevs) {
      textAdditions = parseNewAdditionDiffs(doc);
    }
    return {
      author,
      pageTitle,
      heading: commentHeading,
      textAdditions,
      timestamp,
      isReply,
      fromRev,
      toRev,
      isNewPage,
      hasMultipleRevs
    };
  });
}
function parseRcApiQuery(res) {
  const discussions = (res.query.recentchanges || []).map((curComment) => {
    let {
      title: pageTitle,
      pageid: pageId,
      "old_revid": fromRev,
      revid: toRev,
      comment: revSummary,
      user: username
    } = curComment;
    const isAnon = curComment.anon !== void 0;
    const isReply = (curComment.tags || []).indexOf("discussiontools-reply") > -1;
    const isNewTopic = (curComment.tags || []).indexOf("discussiontools-newtopic") > -1;
    const timestamp = (curComment.timestamp || "") === "" ? null : Date.parse(curComment.timestamp);
    let heading = null;
    if (fromRev === 0 && revSummary.startsWith("Created page with")) ;
    else if (isReply) {
      heading = revSummary.slice(3, revSummary.length - "Reply".length - 4);
    } else if (isNewTopic) {
      heading = revSummary.slice(3, revSummary.length - "new section".length - 4);
    }
    return {
      pageId,
      pageTitle,
      heading,
      username,
      isAnon,
      timestamp,
      isReply,
      isNewTopic,
      fromRev,
      toRev,
      contents: null
    };
  });
  return discussions;
}
function compareParsedRcs(parser2, parsedFeeds, parsedApiQuery) {
  let idxApiQuery = 0;
  let idxFeeds = 0;
  const atIndexes = [];
  const fetchMidRevs = [];
  while (idxApiQuery < parsedApiQuery.length) {
    if (idxFeeds >= parsedFeeds.length) {
      atIndexes.push(idxApiQuery);
      fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
      idxApiQuery++;
      continue;
    }
    if (parsedApiQuery[idxApiQuery].fromRev === parsedFeeds[idxFeeds].fromRev && parsedApiQuery[idxApiQuery].toRev === parsedFeeds[idxFeeds].toRev) {
      parsedApiQuery[idxApiQuery].contents = buildStringFromDiffs(
        parser2,
        parsedFeeds[idxFeeds].textAdditions || [],
        parsedFeeds[idxFeeds].heading,
        parsedFeeds[idxFeeds].isReply
      );
      idxApiQuery++;
      idxFeeds++;
    } else if (parsedFeeds[idxFeeds].hasMultipleRevs) {
      do {
        atIndexes.push(idxApiQuery);
        fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
        idxApiQuery++;
      } while (idxApiQuery < parsedApiQuery.length && parsedApiQuery[idxApiQuery - 1].fromRev !== parsedFeeds[idxFeeds].fromRev);
      idxFeeds++;
    } else {
      atIndexes.push(idxApiQuery);
      fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
      idxApiQuery++;
      idxFeeds++;
    }
  }
  const revToIdx = /* @__PURE__ */ new Map();
  for (let i = 0; i < fetchMidRevs.length; i++) {
    revToIdx.set(fetchMidRevs[i], atIndexes[i]);
  }
  return [parsedApiQuery, revToIdx];
}
function parseRvApiQuery(parser2, res, parsedApiRcs, revToIdx) {
  const objs = Object.values(res.query.pages || {});
  for (const obj of objs) {
    const revs = obj.revisions || [];
    revs.forEach((rev) => {
      const revid = rev.revid;
      let diffs = (rev.diff || {})["*"];
      if (diffs !== void 0) {
        const atIndex = revToIdx.get(revid);
        parsedApiRcs[atIndex].contents = ((diffs2, atIndex2) => {
          const d = parser2.parseFromString(`<html><table>${diffs2}</table></html>`, "application/xml");
          const arrd = parseNewAdditionDiffs(d);
          const comment = buildStringFromDiffs(
            parser2,
            arrd,
            parsedApiRcs[atIndex2].heading,
            parsedApiRcs[atIndex2].isReply
          );
          return comment;
        })(diffs, atIndex);
      }
    });
  }
}
function parseCompareApiQuery({ parser: parser2, res, heading, isReply }) {
  const diffs = res.compare["*"];
  const d = parser2.parseFromString(`<html><table>${diffs}</table></html>`, "application/xml");
  const arrd = parseNewAdditionDiffs(d);
  const comment = buildStringFromDiffs(
    parser2,
    arrd,
    heading,
    isReply
  );
  return comment;
}
function groupDiscussionsByDate(items) {
  const res = {};
  let prevDate = null;
  for (const item of items) {
    let curDate = "";
    if (item.timestamp !== null) {
      const d = new Date(item.timestamp);
      curDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    }
    if (prevDate !== curDate) {
      res[curDate] = [];
      prevDate = curDate;
    }
    res[curDate].push(item);
  }
  return res;
}
function decodeXmlContents(text) {
  if (!text) return "";
  return text.replace(/&(lt|gt|amp|#039|quot|apos);/g, (_, t) => {
    switch (t) {
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "amp":
        return "&";
      case "quot":
        return '"';
      case "#039":
      case "apos":
        return "'";
    }
    return "";
  });
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function stripLinks(text) {
  text = text.replace(/\[\[([^\|\]]+)\]\]/g, "$1");
  text = text.replace(/\[\[([^\|\]]+)\|([^\|\]]*)\]\]/g, "$2");
  text = text.replace(/\[(https?:\/\/[^ \]]+)\s*([^\]]*)\]/g, "$2");
  return text;
}
function stripTags(text) {
  text = text.replace(/<(nowiki|includeonly|noinclude|mobileonly|nomobile|code|blockquote)>(.*?)<\/\1>/g, "$2");
  return text;
}
function parseNewAdditionDiffs(doc) {
  const diffRows = Array.from(doc.querySelectorAll("table > tr:not(.diff-title)"));
  const diffs = diffRows.filter((tr) => {
    return tr.querySelector("td.diff-empty.diff-side-deleted") !== null;
  }).map((tr) => {
    return tr.querySelector("td:not(.diff-empty):not(.diff-side-deleted):not(.diff-marker)");
  }).map((td) => {
    return (td == null ? void 0 : td.textContent.trim()) || "";
  });
  return diffs;
}
function buildStringFromDiffs(parser2, diffs, filterHeading, isReply) {
  const rxTaggedSignature = /\s*(?:\[\[User:[^\]]+?\]\]\s+\(\[\[User[ _]talk:[^\]\|]+?\|talk\]\]\)|\[\[Special:Contributions\/[^\]]+?\]\])\s+\d{1,2}:\d{1,2},\s+\d{1,2}\s+[a-zA-Z]+\s+\d{4}\s+\(UTC\)\s*$/;
  const rxHeadingWikitext = new RegExp("(?<=^|\\n|<br\\s?\\/?>)={2}\\s*" + escapeRegExp(filterHeading || "").replace(/[ _]+/g, "[ _]+") + "\\s*={2}(?=\\n|<br\\s?/?>|$)");
  diffs = diffs.map((txt) => {
    var _a, _b;
    return ((_b = (_a = parser2.parseFromString(
      `<div>${stripTags(txt)}</div>`,
      "text/html"
    )) == null ? void 0 : _a.firstChild) == null ? void 0 : _b.textContent) || "";
  });
  diffs = diffs.map((txt) => filterHeading !== null ? txt.replace(rxHeadingWikitext, "") : txt).filter((txt) => txt.trim() !== "");
  if (isReply) {
    diffs = diffs.map((s) => s.replace(/^:+\s*/, ""));
  }
  diffs = diffs.map((s) => s.replace(rxTaggedSignature, ""));
  diffs = diffs.map((s) => stripLinks(s));
  while (diffs.length > 0 && diffs[0] === "") {
    diffs.shift();
  }
  while (diffs.length > 0 && diffs[diffs.length - 1] === "") {
    diffs.pop();
  }
  return diffs.join(" ");
}
const MENU_OPTIONS = [
  {
    label: "Tất cả (Không bao gồm Thảo luận Thành viên)",
    frc: "&namespace=3&invert=true",
    ns: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 106, 147, 401, 711, 828, 829, 861, 863, 1199, 2901, 2941, 3001, 3003, 5501, 2901]
  },
  {
    label: "Tất cả",
    frc: "",
    ns: null
  },
  {
    label: "Thảo luận",
    frc: "&namespace=1",
    ns: [1]
  },
  {
    label: "Thảo luận Trợ giúp",
    frc: "&namespace=13",
    ns: [13]
  },
  {
    label: "Thảo luận BKDatabase",
    frc: "&namespace=5",
    ns: [5]
  },
  {
    label: "Thảo luận Thành viên",
    frc: "&namespace=3",
    ns: [3]
  },
  {
    label: "Thảo luận Thể loại",
    frc: "&namespace=15",
    ns: [15]
  },
  {
    label: "Thảo luận Tập tin",
    frc: "&namespace=7",
    ns: [7]
  },
  {
    label: "Thảo luận MediaWiki",
    frc: "&namespace=9",
    ns: [9]
  },
  {
    label: "Thảo luận Bản mẫu",
    frc: "&namespace=11",
    ns: [11]
  },
  {
    label: "Thảo luận Mô đun",
    frc: "&namespace=829",
    ns: [829]
  },
  {
  	label: "Form talk",
  	frc: "&namespace=106",
  	ns: [106]
  },
  {
  	label: "Lexeme talk",
  	frc: "&namespace=147",
  	ns: [147]
  },
  {
  	label: "Video talk",
  	frc: "&namespace=401",
  	ns: [401]
  },
  {
  	label: "TimedText talk",
  	frc: "&namespace=711",
  	ns: [711]
  },
  {
  	label: "Item talk",
  	frc: "&namespace=861",
  	ns: [861]
  },
  {
  	label: "Property talk",
  	frc: "&namespace=863",
  	ns: [863]
  },
  {
  	label: "Translations talk",
  	frc: "&namespace=1199",
  	ns: [1199]
  },
  {
  	label: "Map talk",
  	frc: "&namespace=2901",
  	ns: [2901]
  },
  {
  	label: "Navigation talk",
  	frc: "&namespace=2941",
  	ns: [2941]
  },
  {
  	label: "Lore talk",
  	frc: "&namespace=3001",
  	ns: [3001]
  },
  {
  	label: "Timeline talk",
  	frc: "&namespace=3003",
  	ns: [3003]
  },
  {
  	label: "Newsletter talk",
  	frc: "&namespace=5501",
  	ns: [5501]
  }
];
const SHOW_ON_SPECIAL_PAGE = "recentdiscussions";
const NUMBER_OF_POSTS = 50;
const MAX_DURATION_IN_DAYS = 7;
const DEBUG_FOREIGN_WIKI = "";
const LOCAL_STORAGE_KEY = "vlw_rc_discussions_items";
const LOCAL_STORAGE_MAX_AGE = 5 * 60;
const DEBUGGING_ID = "gadget-recent-discussions";
const messages = {
  "rc-discussion--title": "Thảo luận gần đây – $1",
  "rc-discussion--menu-label": "Thảo luận gần đây",
  "rc-discussion--menu-tooltip": "Xem thảo luận gần đây về $1",
  "rc-discussion--app-overview": "Sử dụng trang này để xem các cuộc thảo luận gần đây trong suốt $1 (tối đa $2 bài đăng cho mỗi khoảng thời gian $3 ngày).",
  "rc-discussion--prompt-filter": "Bộ lọc thảo luận",
  "rc-discussion--prompt-refresh": "Làm mới",
  "rc-discussion--action-new-topic": "đã đăng một chủ đề mới",
  "rc-discussion--action-new-reply": "đã đăng một trả lời mới",
  "rc-discussion--loading": "Đang tải...",
  "rc-discussion--failed-to-load": "Bình luận không tải được. Nhấp vào văn bản này để công cụ thử tải lại bình luận.",
  "rc-discussion--unexpected-error": "Đã xảy ra lỗi không mong muốn. Vui lòng báo cáo lỗi này nếu nó vẫn tiếp diễn.",
  "rc-discussion--no-data": "Không tìm thấy cuộc thảo luận nào với tiêu chí đã chọn."
};
mw.messages.set(messages);
const parser = new window.DOMParser();
const config = mw.config.get([
  "wgPageName",
  "wgCanonicalSpecialPageName",
  "wgScriptPath",
  "wgSiteName"
]);
(function(mw2, $) {
  installPortletLink();
  if (config.wgCanonicalSpecialPageName !== SHOW_ON_SPECIAL_PAGE) {
    return;
  }
  const api = new mw2.Api();
  let store;
  function loadApp() {
    document.getElementsByTagName("title")[0].innerHTML = mw2.msg("rc-discussion--title", config.wgSiteName);
    document.getElementById("firstHeading").textContent = mw2.msg("rc-discussion--title", config.wgSiteName);
    mw2.loader.using(["vue", "@wikimedia/codex"]).then((require2) => {
      const Vue = require2("vue");
      const { CdxButton, CdxIcon, CdxSelect, CdxField, CdxProgressIndicator } = require2("@wikimedia/codex");
      store = Vue.reactive({
        option: 0,
        data: {},
        isLoading: false
      });
      loadDiscussions(store.option, false);
      const $app = Vue.createMwApp({
        template: `
					<div id="rc-discussion-feeds">
						<div>
							{{ $i18n( 'rc-discussion--app-overview', siteName, maxPosts, maxDuration ).text() }}
						</div>
						<div id="rc-discussion-dropdown">
							<cdx-field>
								<cdx-select 
									v-model:selected="store.option"
									v-model:modelValue="selectedLabel"
									:menu-items="dropdownMenuItems"
									:menu-config="dropdownMenuConfig"
									@update:selected="onChangeDropdown"
								/>
								<template #label>
									{{ $i18n( 'rc-discussion--prompt-filter' ).text() }}
								</template>
							</cdx-field>
						</div>
						<div id="rc-discussion-actions">
							<cdx-button @click="onClickedRefresh">
								{{ $i18n( 'rc-discussion--prompt-refresh' ).text() }}
							</cdx-button>
						</div>
						<div id="rc-discussion-feeds-articles-container">
							<div id="rc-discussion-feeds-articles">
								<cdx-progress-indicator show-label v-if="store.isLoading">
									{{ $i18n('rc-discussion--loading').text() }}
								</cdx-progress-indicator>
								<div class="rc-discussion-no-data" v-else-if="dateGroups.length === 0">
									{{ $i18n('rc-discussion--no-data').text() }}
								</div>
								<rc-discussion-cards-grouped-by-date 
									v-else
									v-for="(dateGroup, index) in dateGroups" 
									:key="dateGroup" 
									:date="dateGroup"
									:posts="store.data[dateGroup]"
								/>
							</div>
						</div>
					</div>
					`,
        components: { CdxButton, CdxIcon, CdxSelect, CdxField, CdxProgressIndicator },
        setup: () => {
          return {
            siteName: config.wgSiteName,
            maxPosts: NUMBER_OF_POSTS,
            maxDuration: MAX_DURATION_IN_DAYS,
            dropdownMenuItems: MENU_OPTIONS.map((option, idx) => ({
              label: option.label,
              value: idx
            })),
            dropdownMenuConfig: {
              visibleItemLimit: 5
            },
            store
          };
        },
        computed: {
          dateGroups() {
            return Object.keys(store.data);
          },
          selectedLabel() {
            return isNaN(store.option) ? "" : MENU_OPTIONS[+store.option].label || "";
          }
        },
        methods: {
          onClickedRefresh() {
            loadDiscussions(store.option, true);
          },
          onChangeDropdown() {
            loadDiscussions(store.option, true);
          }
        }
      });
      $app.component("rc-discussion-cards-grouped-by-date", {
        template: `
					<div class="rc-discussion-date-group">
						<div class="rc-discussion-date">
							{{ renderedDate }}
						</div>
						<rc-discussion-card 
							v-for="(post, index) in posts"
							:key="''+post.toRev+(post.contents === null ? '' : 't')"
							:post="post" 
							:date="date"
							:index="index"
						/>
					</div>
					`,
        props: ["date", "posts"],
        setup: ({ date, posts }) => ({ date, posts }),
        computed: {
          renderedDate() {
            return new Date(this.date).toLocaleString("en", {
              "year": "numeric",
              "month": "long",
              "day": "numeric"
            });
          }
        }
      });
      $app.component("rc-discussion-card", {
        template: `
					<article>
				
						<div class="rc-discussion-feed-comment-summary">
							<span class="rc-discussion-feed-post-author">
								{{ username }}
							</span>
							<span class="rc-discussion-feed-user-info">
								(<a v-bind:href="userTalkPage" rel="nofollow noindex">talk</a>
								|
								<a v-bind:href="userContribs" rel="nofollow noindex">contribs</a>)
							</span> {{ summaryAction }} on
							<a v-bind:href="pageUrl" rel="nofollow noindex" class="rc-discussion-feed-post-title">
								{{ pageTitle }}
							</a>
						</div>
						
						<div class="rc-discussion-feed-comment-heading">
							<a v-bind:href="postUrl" rel="nofollow noindex">
								{{ heading }}
							</a>
						</div>
				
						<div class="rc-discussion-feed-added-comment">
							<span v-if="contents === null" class="rc-discussion-error" @click="onClickedFailedToLoadCard">
								{{ $i18n( 'rc-discussion--failed-to-load' ).text() }}
							</span>
							<span v-else>
								{{ contents }}
							</span>
						</div>
				
						<div class="rc-discussion-feed-timestamp">
							{{ renderedDate }}
						</div>
				
					</article>
					`,
        props: ["post", "date", "index"],
        setup: ({ post, date, index }) => {
          const { username, heading, contents, timestamp, pageTitle, isNewTopic, isReply, isAnon, fromRev, toRev } = post;
          return { username, heading, contents, timestamp, pageTitle, isNewTopic, isReply, isAnon, fromRev, toRev, date, index, store };
        },
        computed: {
          userTalkPage() {
            return mw2.util.getUrl(`User talk:${this.username}`);
          },
          userContribs() {
            return mw2.util.getUrl(`Special:Contributions/${this.username}`);
          },
          summaryAction() {
            if (this.isNewTopic) {
              return mw2.msg("rc-discussion--action-new-topic");
            } else if (this.isReply) {
              return mw2.msg("rc-discussion--action-new-reply");
            }
            return "";
          },
          pageUrl() {
            return `${DEBUG_FOREIGN_WIKI}${mw2.util.getUrl(this.pageTitle)}`;
          },
          postUrl() {
            return `${this.pageUrl}#${this.heading.replace(/[\{\}]/g, "").replace(/\s+/g, "_")}`;
          },
          renderedDate() {
            const d = new Date(this.timestamp);
            const timestamp = d.toLocaleString(navigator.language || "en", {
              "year": "numeric",
              "month": "long",
              "day": "numeric"
            }) + ", " + d.toLocaleString(navigator.language || "en", {
              "hour": "numeric",
              "minute": "numeric",
              "timeZoneName": "shortOffset"
            });
            return timestamp;
          }
        },
        methods: {
          onClickedFailedToLoadCard() {
            const { fromRev, toRev, heading, isReply, date, index } = this;
            parseCommentFromCompareActionApi({ fromRev, toRev, heading, isReply, date, index }).then(function() {
            }).catch((err) => {
              mw2.notify(mw2.msg("rc-discussion--unexpected-error"), { type: "error" });
              console.error(err, DEBUGGING_ID);
            });
          }
        }
      });
      $app.mount("#mw-content-text");
    });
  }
  function loadDiscussions(idx, noCache) {
    idx = +idx;
    if (isNaN(idx)) {
      console.error("Read recent changes: Invalid Argument", DEBUGGING_ID);
      return;
    }
    store.isLoading = true;
    if (idx === 0 && !noCache) {
      const fetchedFromCache = fetchFromCache();
      if (fetchedFromCache !== null) {
        store.data = fetchedFromCache;
        store.isLoading = false;
        return;
      }
    }
    readRecentChangesFeed(idx).then(([a, b]) => {
      if (a.status !== "fulfilled") {
        throw new Error("Failed to fetch data." + a.reason);
      }
      if (b.status !== "fulfilled") {
        throw new Error("Failed to fetch data." + b.reason);
      }
      const parsedFeeds = parseRcFeeds(parser, a.value);
      const parsedApiRcs = parseRcApiQuery(b.value);
      const [comparedApiRcs, revToIdx] = compareParsedRcs(parser, parsedFeeds, parsedApiRcs);
      return fillIntermediaryRevs(comparedApiRcs, revToIdx);
    }).then(groupDiscussionsByDate).then((data) => {
      if (idx === 0) {
        saveToCache(data);
      }
      store.data = data;
    }).catch((err) => {
      mw2.notify(mw2.msg("rc-discussion--unexpected-error"), { type: "error" });
      console.error(err, DEBUGGING_ID);
    }).finally(function() {
      store.isLoading = false;
    });
  }
  function readRecentChangesFeed(idx) {
    return Promise.allSettled([
      new Promise((resolve, reject) => {
        fetch(
          `${DEBUG_FOREIGN_WIKI}${config.wgScriptPath}/api.php?action=feedrecentchanges&feedformat=rss&tagfilter=discussiontools&limit=${NUMBER_OF_POSTS}&days=${MAX_DURATION_IN_DAYS}${MENU_OPTIONS[idx].frc}&origin=*`
        ).then((res) => {
          resolve(res.text());
        }).catch(reject);
      }),
      api.get({
        action: "query",
        format: "json",
        list: "recentchanges",
        rctag: "discussiontools",
        rcprop: ["user", "comment", "flags", "timestamp", "title", "tags", "ids"],
        rcnamespace: MENU_OPTIONS[idx].ns,
        rclimit: NUMBER_OF_POSTS,
        rcslot: "main",
        rcgeneraterevisions: true,
        rcend: new Date(Date.now() - MAX_DURATION_IN_DAYS * 24 * 60 * 60 * 1e3).toISOString()
      })
    ]);
  }
  function fillIntermediaryRevs(parsedApiRcs, revToIdx) {
    return new Promise(function(resolve, reject) {
      if (revToIdx.size === 0) {
        resolve(parsedApiRcs);
        return;
      }
      const revids = Array.from(revToIdx.keys());
      api.get({
        action: "query",
        format: "json",
        revids,
        prop: "revisions",
        //! rvdiffto is a quote-on-quote deprecated method of prop=revisions 
        //! (https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions)
        //! If you're importing this code to use on another wiki, beware
        rvdiffto: "prev"
      }).done((data) => {
        parseRvApiQuery(parser, data, parsedApiRcs, revToIdx);
        resolve(parsedApiRcs);
      }).fail(reject);
    });
  }
  function parseCommentFromCompareActionApi({ fromRev, toRev, heading, isReply, date, index }) {
    return new Promise((resolve, reject) => {
      api.get({
        action: "compare",
        format: "json",
        fromrev: fromRev,
        torev: toRev,
        prop: "diff",
        difftype: "table"
      }).done((res) => {
        const comment = parseCompareApiQuery({ parser, res, heading, isReply });
        store.data[date][index].contents = comment;
        console.log(store.data);
        resolve();
      }).catch(reject);
    });
  }
  function fetchFromCache() {
    const o = mw2.storage.getObject(LOCAL_STORAGE_KEY) || null;
    return o;
  }
  function saveToCache(res) {
    mw2.storage.setObject(LOCAL_STORAGE_KEY, res, LOCAL_STORAGE_MAX_AGE);
  }
  function installPortletLink() {
    const label = mw2.msg("rc-discussion--menu-label");
    const tooltipText = mw2.msg("rc-discussion--menu-tooltip", config.wgSiteName);
    const { wgFormattedNamespaces: { "-1": specialNamespace } = { "-1": "Special" } } = mw2.config.get(["wgFormattedNamespaces"]);
    if (!$("#t-rc-discussion").length) {
      mw2.util.addPortletLink(
        "p-tb",
        mw2.util.getUrl(`${specialNamespace}:${SHOW_ON_SPECIAL_PAGE}`),
        label,
        "t-rc-discussion",
        tooltipText,
        void 0,
        "#t-specialpages"
      );
    }
    if (config.wgCanonicalSpecialPageName === "Recentchanges" && !$("#ca-nstab-rc-discussion").length) {
      mw2.util.addPortletLink(
        "p-namespaces",
        mw2.util.getUrl(`${specialNamespace}:${SHOW_ON_SPECIAL_PAGE}`),
        label,
        "ca-nstab-rc-discussion",
        tooltipText
      );
    }
  }
  loadApp();
})(mediaWiki, jQuery);
