/*
		dynamic categories
		
		last updated: 28 september 2024

		refer to [[dev:Dynamic Categories]] on dev.miraheze.org
*/


defaultCategoryView = 'Dynamic'; // Choose from 'Classic' , 'Dynamic' or 'Gallery' --- First letter capital, with single quotes

galleryCatStyle = 'Compacter'; // 'Normal' , 'Compact' or 'Compacter'

catlistAlphabets = false; // true or false. Whether you want the menu of navigation alphabets above the category list

//---------------------------------------------------------------------------------------------------

const labels = { 
	
	// Change the text labels here. For localization purposes.
	
	classic: "Mặc định",
	dynamic: "Thể loại kèm hình",
	gallery: "Hình ảnh",
	prev: "Trang trước",
	next: "Trang sau"
};

const i18n = {
	
	// !!!! IF YOUR WIKI IS NOT IN ENGLISH: Change "previous page" to what it is in your language
    // How to check this: Go to a category page, add "?pagefrom=A" to the end of the url
    
    previouspage: "previous page"
};

//--------------------------------------------------------------------------

$(function () {
    if ($('body').is('.ns-14')) {
        mw.util.addCSS(`
#mw-pages .mw-category, .dynamic-catlist, .gallery-catlist {
    display:none;
}
#mw-pages.catview-Classic .mw-category, .catview-Dynamic .dynamic-catlist, .catview-Gallery .gallery-catlist {
    display:block;
}

/*----------- dynamic ---------*/

.dynamic-catlist {
    column-count:3;
    column-width:24em;
    column-gap:2em;
}

.dynamic-catlist ul{
    list-style:none;
    margin-left:0;
}

.dynamic-catlist h3 {
    border-bottom: 1px solid #ccc;
}

.dynamic-catlist li {
    display:flex;
    align-items:center;
    gap:1em;
    margin:5px 0;
    break-inside:avoid;
}

.dynamic-catlist .catlink-thumb {
    width:4em;
    aspect-ratio: 1;
}
img.catlink-thumb {
    object-fit:cover;
    object-position:center top;
    border:1px solid #ccc;
}
div.catlink-thumb {
    display:flex;
    align-items:center;
    justify-content: center;
}
  
.catlink-thumb svg {
    width:40%;
    height:auto;
    fill:currentcolor;
}

/*----------- gallery ---------*/

.gallery-catlist ul {
    list-style:none;
    margin-left:0;
    margin-top:1em;
    display:grid;
    gap:1.5em;
    row-gap:2.5em;
    grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
    grid-template-rows: auto;
    justify-content:center;
    line-height:1.2em;
}

.gallery-catlist li {
    display:contents;
}

.gallery-catlist li a {
    position:relative;
    transition:opacity 0.2s;
}
.gallery-catlist li a:hover {
    opacity:0.8;
}

.gallery-catlist .catgallery-thumb {
    width:100%;
    aspect-ratio:1;
    border:1px solid #ccc;
    object-fit:cover;
    object-position:center top;
    box-sizing:border-box;
}

.catgallery-noimg .catgallery-thumb {
    background-color:rgba(150,150,150,0.4);
    display:flex;
    justify-content:center;
    align-items:center;
}

.catgallery-noimg svg {
    width:30%;
    height:fit-content;
    fill:#888;
}

.catgallery-text {
    margin-top:0.5em;
}

/*----------- compact gallery ---------*/

div.gallery-compact ul {
    gap:1em;
}
div.gallery-compacter ul {
    gap:2px;
    grid-template-columns: repeat(auto-fill, minmax(8em,1fr));
}

.gallery-compact .catgallery-text, .gallery-compacter .catgallery-text {
    position:absolute;
    color:#fff;
    width:100%;
    height:100%;
    box-sizing:border-box;
    padding:5px 10px;
    bottom:0;
    left:0;
    display:flex;
    align-items:flex-end;
    background-image: linear-gradient(7deg, rgba(0,0,0,0.7), transparent 50%);
    text-shadow: 0 0 10px black;
    word-break:break-word;
}

.gallery-compact .catgallery-noimg .catgallery-text, .gallery-compacter .catgallery-noimg .catgallery-text {
    background-image:unset;
    background-color:rgba(0,0,0,0.4);
}

.gallery-compacter .catgallery-thumb, .gallery-compacter .catgallery-blank {
    border:unset;
}

/*----------- menu buttons ---------*/

.catlist-menu {
    display:flex;
    gap:10px;
    justify-content:right;
    flex-flow:row wrap;
    margin:10px 0;
}

.catlist-selector, .catlist-nav, .catlist-alphabet {
    display:flex;
    gap:10px;
}

.catlist-nav {
    flex: 1 0 500px;
    justify-content:space-between;
    max-width:100%;
}
.catlist-alphabet {
    overflow:scroll;
    gap:5px;
}

#mw-pages > .catlist-nav {
    margin-top:10px;
}

.catbtn {
    border: 1px solid #ccc;
    padding:8px;
    user-select:none;
    cursor:pointer;
    border-radius:6px;
    transition:background-color 0.2s;
    position:relative;
    display:flex;
    justify-content:center;
    align-items:center;
}

.catlist-selector .catbtn {
    line-height:0;
}

.catbtn.active, .catbtn:hover {
    background-color: rgba(200,200,200,0.6);
}

.catlist-selector .catbtn::before {
    content: attr(data-label);
    position:absolute;
    bottom:100%;
    margin-bottom:10px;
    left:50%;
    transform:translateX(-50%);
    border: inherit;
    display:none;
    line-height:1.2em;
    padding:5px 8px;
    background-color:white;
    color:black;
    z-index:1;
    white-space:nowrap;
}
.catlist-selector .catbtn:hover::before {
    display:block;
}

.catbtn svg {
    width:1.5em;
    height:1.5em;
    fill:currentcolor;
}

.catlist-nav span.catbtn {
    background-color:rgba(200,200,200,0.6);
    opacity: 0.5;
    cursor:unset;
}

.redirect-in-category {
    display:contents;
}

@media screen and (max-width:500px) {
    .gallery-catlist ul {
        grid-template-columns: repeat(3, 1fr) !important;
        gap:0.5em;
    }
}

#mw-pages img {
    filter:unset;
}
`);

        $('#mw-pages > :not(a)').appendTo($('#mw-pages').clone().empty().insertBefore('#mw-pages'));
        $('[id=mw-pages]').eq(1).attr('id', 'mw-pages-extra');

        const mwPages = $('#mw-pages');

        if (!localStorage.categoryView) {
            localStorage.categoryView = defaultCategoryView;
        }

        // Apply class to #mw-pages based on localStorage

        mwPages.attr('class', 'catview-' + localStorage.categoryView);

        // Check for magic word in page content, apply class if present

        catMagicWords('__CLASSICCAT__', 'catview-Classic');
        catMagicWords('__DYNAMICCAT__', 'catview-Dynamic');
        catMagicWords('__GALLERYCAT__', 'catview-Gallery');

        const
            iconClassic = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>',
            iconDynamic = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"/></svg>',
            iconGallery = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 96l0 128-128 0 0-128 128 0zm0 192l0 128-128 0 0-128 128 0zM192 224L64 224 64 96l128 0 0 128zM64 288l128 0 0 128L64 416l0-128zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"/></svg>',
            iconEmpty = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/></svg>';

        // Make menu buttons

        $('#mw-pages > p:first-of-type').after(`<div class="catlist-menu"><div class="catlist-selector"><span class="catbtn" data-label="${labels.classic}" title="Classic">${iconClassic}</span><span class="catbtn" data-label="${labels.dynamic}" title="Dynamic">${iconDynamic}</span><span class="catbtn" data-label="${labels.gallery}" title="Gallery">${iconGallery}</span></div></div>`);

        $('.catlist-menu').prepend('<div class="catlist-nav"></div>');

        if (catlistAlphabets) {

            $('.catlist-nav').prepend('<div class="catlist-alphabet"></div>');

            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                alphabetlist = $('.catlist-alphabet');

            for (var x in alphabet) {
                alphabetlist.append(`<a class="catbtn" href="?pagefrom=${alphabet[x]}">${alphabet[x]}</a>`);
            }

            alphabetlist.prepend(`<a class="catbtn" href="?">#</a>`);

        }

        if ($('#mw-pages-extra > a').length > 0) {
            $('.catlist-nav').prepend(`<span class="catbtn catlist-prev">${labels.prev}</span>`).append(`<span class="catbtn catlist-next">${labels.next}</span>`);
            $('#mw-pages').append(`<div class="catlist-nav"><span class="catbtn catlist-prev">${labels.prev}</span><span class="catbtn catlist-next">${labels.next}</span></div>`);

            if ($('#mw-pages-extra > a').eq(0).text().toLowerCase() == i18n.previouspage.toLowerCase()) {
                $('.catlist-prev').replaceWith(`<a class="catbtn catlist-prev" href="${$('#mw-pages-extra > a').eq(0).attr('href')}">${labels.prev}</a>`);
            } else {
                $('.catlist-next').replaceWith(`<a class="catbtn catlist-next" href="${$('#mw-pages-extra > a').eq(0).attr('href')}">${labels.next}</a>`);
            }

            if ($('#mw-pages-extra > a').eq(1).text() != $('#mw-pages-extra > a').eq(0).text()) {
                $('.catlist-next').replaceWith(`<a class="catbtn catlist-next" href="${$('#mw-pages-extra > a').eq(1).attr('href')}">${labels.next}</a>`);
            }
        }

        const iconPrev = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>',
            iconNext = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>';

        $('.catlist-prev').prepend(iconPrev);
        $('.catlist-next').append(iconNext);
        $('#mw-pages-extra').remove();

        // Make button active based on category view

        $('.catlist-selector .catbtn[title="' + mwPages.attr('class').slice(8) + '"]').addClass('active');

        $('.catlist-selector .catbtn').click($.proxy(catSelect, null));

        // Make Dynamic and Gallery view wrappers

        $('#mw-pages .mw-category').after('<div class="gallery-catlist"><ul></ul></div>');
        $('#mw-pages .mw-category li').clone().appendTo('.gallery-catlist ul');
        $('#mw-pages .mw-category').clone().removeClass().addClass('dynamic-catlist').insertAfter('#mw-pages .mw-category');

        switch (galleryCatStyle) {
            case 'Compact':
                $('.gallery-catlist').addClass('gallery-compact');
                break;
            case 'Compacter':
                $('.gallery-catlist').addClass('gallery-compacter');
        }

        api = new mw.Api(),
            pages = [],
            pageslice = [];

        // pages is array of all category pages on current page, in order

        $('#mw-pages .mw-category li a').each(function () {
            pages.push($(this).attr('title'));
        });

        // slice array into chunks of 50 (page limit by default is 200, and pageimages api max query is 50)

        for (i = 0; pages.length > i * 50; i++) {
            pageslice[i] = pages.slice(i * 50, (i + 1) * 50);
        }

        // get pageimages

        Promise.all(pageslice.map(function (value) {
            const pageimagesparams = {
                action: 'query',
                format: 'json',
                prop: 'pageimages',
                pithumbsize: '200',
                titles: value
            };

            return new Promise((resolve, reject) => {
                api.get(pageimagesparams).done(function (data) {
                    resolve(Object.values(data.query.pages));
                });
            });

        }))
            .then(function (values) {
                // combine all api results into one array and sort based on the 'pages' array
                imageslist = values.flatMap(a => a);
                imageslist.sort((a, b) => pages.indexOf(a.title) - pages.indexOf(b.title));

                // Add images to Gallery and Dynamic

                $('.gallery-catlist li a').each(function (index) {
                    $(this).wrapInner('<div class="catgallery-text"><span></span></div>');
                    $(this).find('span').html($(this).find('span').text().replaceAll(/(:|\/)/g, "$1<wbr>"));
                    try { $(this).prepend(`<img class="catgallery-thumb catgallery-img" src="${imageslist[index].thumbnail.source}">`) }
                    catch (err) { $(this).addClass('catgallery-noimg').prepend(`<div class="catgallery-thumb">${iconEmpty}</div>`) }
                });

                $('.dynamic-catlist li a').each(function (index) {
                    try { $(this).before(`<a title="${$(this).attr('title')}" href="${$(this).attr('href')}"><img class="catlink-thumb" src="${imageslist[index].thumbnail.source}"></a>`) }
                    catch (err) { $(this).before(`<div class="catlink-thumb">${iconEmpty}</div>`) }
                });

            });

        if ($('.ext-darkmode-link').length > 0) {
            $('#mw-pages > div').addClass('mw-no-invert');
        }
    }
});

function catSelect() {
    $(this).addClass('active').siblings().removeClass('active');
    localStorage.categoryView = $(this).attr('title');
    $('#mw-pages').attr('class', 'catview-' + $(this).attr('title'));
}

function catMagicWords(magicword, addclass) {
    if ($('.mw-parser-output').html().search(magicword) > -1) {
        $('.mw-parser-output').html($('.mw-parser-output').html().replace(magicword, ''));
        $('#mw-pages').attr('class', addclass);
    }
}
// [[Category:Scripts]]
