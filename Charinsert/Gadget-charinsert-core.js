/**
 * Copied from [[mw:User:Alex Smotrov/edittools.js]], modified for use on the English Wikipedia.
 *
 * Configuration (to be set from [[Special:MyPage/common.js]]):
 *   window.charinsertCustom – Object. Merged into the default charinsert list. For example, setting
 *       this to { Symbols: '‽' } will add the interrobang to the end of the Symbols section.
 *   window.editToolsRecall – Boolean. Set true to create a recall switch.
 *   window.charinsertDontMove – Boolean. Set true to leave the box in its default position, rather
 *       than moving it above the edit summary.
 *   window.updateEditTools() – Function. Call after updating window.charinsertCustom to regenerate the
 *       EditTools window.
 */
/* global jQuery, mw, charinsertCustom */

window.updateEditTools = function () {
};

jQuery( document ).ready( function ( $ ) {
	var $currentFocused,
		editTools;

    function getSelectedSection() {
		var selectedSection = mw.storage.get( editTools.storageKey )
			|| mw.storage.session.get( editTools.storageKey );
		
		return selectedSection;
    }
    
    function saveSelectedSection( newIndex ) {
		mw.storage.set( editTools.storageKey, newIndex )
			|| mw.storage.session.set( editTools.storageKey, newIndex );
    }
    
    editTools = {
        // Entries prefixed with ␥ (U+2425 SYMBOL FOR DELETE FORM TWO) will not appear in the article namespace (namespace 0).
        // Please make any changes to [[MediaWiki:Edittools]] as well, however, instead of using the ␥ symbol, use {{#ifeq:{{NAMESPACE}}|{{ns:0}}| | }}.
        charinsert: {
            'Thông dụng': ' – — … ° ′ ″ ≈ ≠ ≤ ≥ ± − × ÷ ← → · §  ␥Ký_tên: ␥~~\~~  Chú_thích_nguồn_gốc: <ref>+</ref>',
            'Wiki': 'Thông_dụng:  – — … ° ′ ″ ≈ ≠ ≤ ≥ ± − × ÷ ← → · § ␥~~\~~ <ref>+</ref>  Cú_pháp_wiki:  {\{+}}  {\{\{+}}}  |  [+]  [\[+]]  [\[Thể.loại:+]]  #đổi.[\[+]]  &nbsp;  <s>+</s>  <sup>+</sup>  <sub>+</sub>  <code>+</code>  <pre>+</pre>  <blockquote>+</blockquote>  <ref.name="+"_/>  {\{#thẻ:ref|+|group="nb"|name=""}}  {\{Tham.khảo|cột=+}}  <references./>  <includeonly>+</includeonly>  <noinclude>+</noinclude>  {\{DEFAULTSORT:+}}  <nowiki>+</nowiki>  <!--.+_-->  <span.class="plainlinks">+</span>',
            'Ký hiệu': '~ | ¡¿†‡↔↑↓•¶#∞  ‘+’ “+” ‹+› «+» {\{Ngoặc.nhọn|+}}  ¤₳฿₵¢₡₢$₫₯€₠₣ƒ₴₭₤ℳ₥₦№₧₰£៛₨₪৳₮₩¥  ♠♣♥♦  ♭♯♮  ©®™ ◌ {\{Unicode|+}}',
            'Latinh': 'A a Á á À à Â â Ä ä Ǎ ǎ Ă ă Ā ā Ã ã Å å Ą ą Æ æ Ǣ ǣ  B b  C c Ć ć Ċ ċ Ĉ ĉ Č č Ç ç  D d Ď ď Đ đ Ḍ ḍ Ð ð  E e É é È è Ė ė Ê ê Ë ë Ě ě Ĕ ĕ Ē ē Ẽ ẽ Ę ę Ẹ ẹ Ɛ ɛ Ǝ ǝ Ə ə  F f  G g Ġ ġ Ĝ ĝ Ğ ğ Ģ ģ  H h Ĥ ĥ Ħ ħ Ḥ ḥ  I i İ ı Í í Ì ì Î î Ï ï Ǐ ǐ Ĭ ĭ Ī ī Ĩ ĩ Į į Ị ị  J j Ĵ ĵ  K k Ķ ķ  L l Ĺ ĺ Ŀ ŀ Ľ ľ Ļ ļ Ł ł Ḷ ḷ Ḹ ḹ  M m Ṃ ṃ  N n Ń ń Ň ň Ñ ñ Ņ ņ Ṇ ṇ Ŋ ŋ  O o Ó ó Ò ò Ô ô Ö ö Ǒ ǒ Ŏ ŏ Ō ō Õ õ Ǫ ǫ Ọ ọ Ő ő Ø ø Œ œ  Ɔ ɔ  P p  Q q  R r Ŕ ŕ Ř ř Ŗ ŗ Ṛ ṛ Ṝ ṝ  S s Ś ś Ŝ ŝ Š š Ş ş Ș ș Ṣ ṣ ß  T t Ť ť Ţ ţ Ț ț Ṭ ṭ Þ þ  U u Ú ú Ù ù Û û Ü ü Ǔ ǔ Ŭ ŭ Ū ū Ũ ũ Ů ů Ų ų Ụ ụ Ű ű Ǘ ǘ Ǜ ǜ Ǚ ǚ Ǖ ǖ  V v  W w Ŵ ŵ  X x  Y y Ý ý Ŷ ŷ Ÿ ÿ Ỹ ỹ Ȳ ȳ  Z z Ź ź Ż ż Ž ž  ß Ð ð Þ þ Ŋ ŋ Ə ə {\{Unicode|+}}',
            'Hy Lạp': 'ΆάΈέΉήΊίΌόΎύΏώ  ΑαΒβΓγΔδ  ΕεΖζΗηΘθ  ΙιΚκΛλΜμ  ΝνΞξΟοΠπ  ΡρΣσςΤτΥυ  ΦφΧχΨψΩω Ϝϝυ̯ι̯  ᾼᾳᾴᾺὰᾲᾶᾷἈἀᾈᾀἉἁᾉᾁἌἄᾌᾄἊἂᾊᾂἎἆᾎᾆἍἅᾍᾅἋἃᾋᾃἏἇᾏᾇ  ῈὲἘἐἙἑἜἔἚἒἝἕἛἓ  ῌῃῄῊὴῂῆῇἨἠᾘᾐἩἡᾙᾑἬἤᾜᾔἪἢᾚᾒἮἦᾞᾖἭἥᾝᾕἫἣᾛᾓἯἧᾟᾗ  ῚὶῖἸἰἹἱἼἴἺἲἾἶἽἵἻἳἿἷΪϊΐῒῗ  ῸὸὈὀὉὁὌὄὊὂὍὅὋὃ  ῤῬῥ  ῪὺῦὐὙὑὔὒὖὝὕὛὓὟὗΫϋΰῢῧ  ῼῳῴῺὼῲῶῷὨὠᾨᾠὩὡᾩᾡὬὤᾬᾤὪὢᾪᾢὮὦᾮᾦὭὥᾭᾥὫὣᾫᾣὯὧᾯᾧ ᾹᾱᾸᾰῙῑῘῐῩῡῨῠ {{lang|el|+}} {{lang|grc|+}} {\{Polytonic|+}}',
            'Kirin': 'АаБбВвГг  ҐґЃѓДдЂђ  ЕеЁёЄєЖж  ЗзЅѕИиІі  ЇїЙйЈјКк  ЌќЛлЉљМм  НнЊњОоПп  РрСсТтЋћ  УуЎўФфХх  ЦцЧчЏџШш  ЩщЪъЫыЬь  ЭэЮюЯя ӘәӨөҒғҖҗ ҚқҜҝҢңҮү ҰұҲҳҸҹҺһ  ҔҕӢӣӮӯҘҙ  ҠҡҤҥҪҫӐӑ  ӒӓӔӕӖӗӰӱ  ӲӳӸӹӀ  ҞҟҦҧҨҩҬҭ  ҴҵҶҷҼҽҾҿ  ӁӂӃӄӇӈӋӌ  ӚӛӜӝӞӟӠӡ  ӤӥӦӧӪӫӴӵ  ́',
            'Hê-brơ': 'אבגדהוזחטיכךלמםנןסעפףצץקרשת  ׳ ״  װױײ',
            'Ả Rập': '  Chuyển_tự: ʾ  ā ī ū ṯ ḥ ḫ ẖ ḏ š ṣ ḍ ṭ ẓ ʿ ġ ẗ á ا ﺁ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه ة و ي ى ء أ إ ؤ ئ',
            'IPA (tiếng Anh)': 'ˈ ˌ  ŋ ɡ tʃ dʒ ʃ ʒ θ ð ʔ  ɑː ɒ æ aɪ aʊ ɛ eɪ ɪ iː ɔː ɔɪ oʊ ʊ uː ʌ ɜr  ə ər ᵻ ᵿ ɒ̃ æ̃  {\{IPAc-en|+}} {\{IPA-en|+}} {\{IPA|+}}  {\{Ngoặc.nhọn|+}}',
            'IPA': 'Phụ_âm: ɱɳɲŋɴ : t̪ d̪ ʈɖɟɡɢʡʔ : ɸβθð  ʃʒʂʐɕʑ  çʝɣχʁ  ħʕʜʢɦɧ : ʋɹɻɥɰʍ : ʙⱱɾɽʀ  ɺ  ɫɬɮɭʎʟ : ɓɗᶑʄɠʛ  ʘǀǃǂǁ  Nguyên_âm: ɪʏɨʉɯʊ : øɘɵɤ  ə ɚ  ɛœɜɝɞʌɔ : æɶɐɑɒ  Ký_tự_phân_cách: ˈˌːˑʼˀˤᵝᵊᶢˠʰʱʲˡⁿᵑʷᶣ˞‿˕˔  Ký_tự_tổ_hợp: ̚ ̪ ̺ ̻ ̼ ̬  ̊ ̥ ̞ ̝ ̘ ̙ ̽ ̟ ̠  ̈ ̤ ̹ ̜ ̍ ̩  ̆ ̯  ̃ ̰ ͡ ͜  Thanh:  ̋  ́  ̄  ̀  ̏  ̌  ̂ ᷄ ᷅ ᷇ ᷆ ᷈ ᷉  ˥˦˧˨˩ꜛꜜ : ↗↘‖  extIPA: ͈ ͉ ͎ ̣ ̫ ͊ ᷽ ͇ : ˭ᵻᵿ  {\{Ngoặc.nhọn|+}} {\{IPA|+}} {\{IPA.link|+}}',
            'Toán học': '− × ÷ ⋅ ° ∗ ∘ ± ∓ ≤ ≥ ≠ ≡ ≅ ≜ ≝ ≐ ≃ ≈ ⊕ ⊗ ⇐ ⇔ ⇒ ∞ ← ↔ → ≪ ≫ ∝ √ ∤ ≀ ◅ ▻ ⋉ ⋊ ⋈ ∴ ∵ ↦ ¬ ∧ ∨ ⊻ ∀ ∃ ∈ ∉ ∋ ⊆ ⊈ ⊊ ⊂ ⊄ ⊇ ⊉ ⊋ ⊃ ⊅ ∪ ∩ ∑ ∏ ∐ ′ ∫ ∬ ∭ ∮ ∇ ∂ ∆ ∅ ℂ ℍ ℕ ℙ ℚ ℝ ℤ ℵ ⌊ ⌋ ⌈ ⌉ ⊤ ⊥ ⊢ ⊣ ⊧ □ ∠ ⟨ ⟩ {\{Ngoặc.nhọn|+}} <math>+</math> {\{math|+}} {\{mvar|+}} {\{Phân.số|+|}} {\{sfrac|+|}}',
            'Bản mẫu chú thích': '{\{Chú.thích.web|+}} {\{Chú.thích.báo|+}} {\{Chú.thích.sách|+}} {\{Chú.thích.tạp.chí|+}} {\{Chú.thích.tài.liệu|+}} {\{Chú.thích.bách.khoa.toàn.thư|+}} {\{Chú.thích.phỏng.vấn|+}} {\{Chú.thích.tập.san.học.thuật|+}} {\{Chú.thích.video|+}} {\{Chú.thích.thông.cáo.báo.chí|+}}',
            'Catalan': 'À à Ç ç É é È è Í í Ï ï Ò ò Ó ó Ú ú Ü ü Ŀ ŀ',
            'Czech': 'Á á Č č Ď ď É é Ě ě Í í Ň ň Ó ó Ř ř Š š Ť ť Ú ú Ů ů Ý ý Ž ž',
            'Devanāgarī': ' ं ः अ आ इ ई उ ऊ ऋ ऌ ऍ ऎ ए ऐ ऑ ऒ ओ औ क क़ ख ख़ ग ग़ घ ङ च छ ज ज़ झ ञ ट ठ ड ड़ द ढ ढ़ ण त थ ध न ऩ प फ फ़ ब भ म य य़ र ऱ ल ळ ऴ व श ष स ह ़ ऽ ा ि ॊ ो ौ ् ी ु ू ृ ॄ ॅ ॆ े ै ॉ ॐ ॑ ॒ ॓ ॔ ॠ ॡ ॢ ॣ । ॥ ॰',
            'Quốc tế ngữ': 'Ĉ ĉ Ĝ ĝ Ĥ ĥ Ĵ ĵ Ŝ ŝ Ŭ ŭ',
            'Estonian': 'Č č Š š Ž ž Õ õ Ä ä Ö ö Ü ü',
            'Pháp': 'À à Â â Ç ç É é È è Ê ê Ë ë Î î Ï ï Ô ô Œ œ Ù ù Û û Ü ü Ÿ ÿ',
            'Georgian': 'ა ბ გ დ ე ვ ზ თ ი კ ლ მ ნ ო პ ჟ რ ს ტ უ ფ ქ ღ ყ შ ჩ ც ძ წ ჭ ხ ჯ ჰ ჱ ჲ ჳ ჴ ჵ ჶ ჷ ჸ ჹ  ჺ ჻ ჼ Ⴀ Ⴁ Ⴂ Ⴃ Ⴄ Ⴅ Ⴆ Ⴡ Ⴇ Ⴈ Ⴉ Ⴊ Ⴋ Ⴌ Ⴢ Ⴍ Ⴎ Ⴏ Ⴐ Ⴑ Ⴒ Ⴣ Ⴓ Ⴔ Ⴕ Ⴖ Ⴗ Ⴘ Ⴙ Ⴚ Ⴛ Ⴜ Ⴝ Ⴞ Ⴤ Ⴟ Ⴠ Ⴥ',
            'Đức': 'Ä ä Ö ö Ü ü ß',
            'Hawaii': 'Ā ā Ē ē Ī ī Ō ō Ū ū ʻ',
            'Serbia': 'А а Б б В в Г г Д д Ђ ђ Е е Ж ж З з И и Ј ј К к Л л Љ љ М м Н н Њ њ О о П п Р р С с Т т Ћ ћ У у Ф ф Х х Ц ц Ч ч Џ џ Ш ш',
            'Tây Ban Nha': 'Á á É é Í í Ñ ñ Ó ó Ú ú Ü ü ¡ ¿',
            'Thổ Nhĩ Kỳ': 'Ç ç Ğ ğ İ ı Ö ö Ş ş Ü ü Â â Î î Û û',
            'Việt Nam': 'À à Ả ả Á á Ạ ạ Ã ã Ă ă Ằ ằ Ẳ ẳ Ẵ ẵ Ắ ắ Ặ ặ Â â Ầ ầ Ẩ ẩ Ẫ ẫ Ấ ấ Ậ ậ Đ đ È è Ẻ ẻ Ẽ ẽ É é Ẹ ẹ Ê ê Ề ề Ể ể Ễ ễ Ế ế Ệ ệ Ỉ ỉ Ĩ ĩ Í í Ị ị Ì ì Ỏ ỏ Ó ó Ọ ọ Ò ò Õ õ Ô ô Ồ ồ Ổ ổ Ỗ ỗ Ố ố Ộ ộ Ơ ơ Ờ ờ Ở ở Ỡ ỡ Ớ ớ Ợ ợ Ù ù Ủ ủ Ũ ũ Ú ú Ụ ụ Ư ư Ừ ừ Ử ử Ữ ữ Ứ ứ Ự ự Ỳ ỳ Ỷ ỷ Ỹ ỹ Ỵ ỵ Ý ý',
            'Welsh': 'Á á À à Â â Ä ä É é È è Ê ê Ë ë Ì ì Î î Ï ï Ó ó Ò ò Ô ô Ö ö Ù ù Û û Ẁ ẁ Ŵ ŵ Ẅ ẅ Ý ý Ỳ ỳ Ŷ ŷ Ÿ ÿ',
            'Yiddish': 'א אַ אָ ב בֿ ג ד ה ו וּ װ ױ ז זש ח ט י יִ ײ ײַ כ ך כּ ל ל+ מ ם נ ן ס ע ע+ פ פּ פֿ ף צ ץ ק ר ש שׂ תּ ת ׳ ״ ־'
        },

        charinsertDivider: "\240",

        storageKey: 'edittoolscharsubset',

        createEditTools: function ( placeholder ) {
            var sel, id;
            var box = document.createElement( 'div' );
            var prevSubset = 0, curSubset = 0;
            box.id = 'editpage-specialchars';
            box.title = 'Nhấn chuột vào ký tự hoặc thẻ để chèn nó vào hộp sửa đổi';

            // append user-defined sets
            if ( window.charinsertCustom ) {
                for ( id in charinsertCustom ) {
                    if ( !editTools.charinsert[id] ) {
                        editTools.charinsert[id] = '';
                    }
                }
            }

            // create drop-down select
            sel = document.createElement( 'select' );
            for ( id in editTools.charinsert ) {
                sel.options[sel.options.length] = new Option( id, id );
            }
            sel.selectedIndex = 0;
            sel.style.marginRight = '.3em';
            sel.title = 'Chọn bộ ký tự';
            sel.onchange = sel.onkeyup = selectSubset;
            box.appendChild( sel );

            // create "recall" switch
            if ( window.editToolsRecall ) {
                var recall = document.createElement( 'span' );
                recall.appendChild( document.createTextNode( '↕' ) ); // ↔
                recall.onclick = function() {
                    sel.selectedIndex = prevSubset;
                    selectSubset();
                };
                recall.style.cssFloat = 'left';
                recall.style.marginRight = '5px';
                recall.style.cursor = 'pointer';
                box.appendChild( recall );
            }

			if ( getSelectedSection() ) {
				sel.selectedIndex = getSelectedSection();
			}

            placeholder.parentNode.replaceChild( box, placeholder );
            selectSubset();
            return;

            function selectSubset() {
                // remember previous (for "recall" button)
                prevSubset = curSubset;
                curSubset = sel.selectedIndex;
                //save into web storage for persistence
                saveSelectedSection( curSubset );
                
                //hide other subsets
                var pp = box.getElementsByTagName( 'p' ) ;
                for ( var i = 0; i < pp.length; i++ ) {
                    pp[i].style.display = 'none';
                }
                //show/create current subset
                var id = sel.options[curSubset].value;
                var p = document.getElementById( id );
                if ( !p ) {
                    p = document.createElement( 'p' );
                    p.className = 'nowraplinks';
                    p.id = id;
                    if ( id == 'Ả Rập' || id == 'Hebrew' ) {
                        p.style.fontSize = '120%';
                        p.dir = 'rtl';
                    }
                    var tokens = editTools.charinsert[id];
                    if ( window.charinsertCustom && charinsertCustom[id] ) {
                        if ( tokens.length > 0 ) {
                            tokens += ' ';
                        }
                        tokens += charinsertCustom[id];
                    }
                    editTools.createTokens( p, tokens );
                    box.appendChild( p );
                }
                p.style.display = 'inline';
            }
        },

        createTokens: function ( paragraph, str ) {
            var tokens = str.split( ' ' ), token, i, n;
            for ( i = 0; i < tokens.length; i++ ) {
                token = tokens[i];
                n = token.indexOf( '+' );
                if ( token.charAt( 0 ) === '␥' ) {
                    if ( token.length > 1 && mw.config.get( 'wgNamespaceNumber' ) === 0 ) {
                        continue;
                    } else {
                        token = token.substring( 1 );
                    }
                }
                if ( token === '' || token === '_' ) {
                    addText( editTools.charinsertDivider + ' ' );
                } else if ( token === '\n' ) {
                    paragraph.appendChild( document.createElement( 'br' ) );
                } else if ( token === '___' ) {
                    paragraph.appendChild( document.createElement( 'hr' ) );
                } else if ( token.charAt( token.length-1 ) === ':' ) { // : at the end means just text
                    addBold( token );
                } else if ( n === 0 ) { // +<tag>  ->   <tag>+</tag>
                    addLink( token.substring( 1 ), '</' + token.substring( 2 ), token.substring( 1 ) );
                } else if ( n > 0 ) { // <tag>+</tag>
                    addLink( token.substring( 0, n ), token.substring( n+1 ) );
                } else if ( token.length > 2 && token.charCodeAt( 0 ) > 127 ) { // a string of insertable characters
                    for ( var j = 0; j < token.length; j++ ) {
                        addLink( token.charAt( j ), '' );
                    }
                } else {
                    addLink( token, '' );
                }
            }
            return;

            function addLink( tagOpen, tagClose, name ) {
                var handler;
                var dle = tagOpen.indexOf( '\x10' );
                var a = document.createElement( 'a' );
                
                if ( dle > 0 ) {
                    var path = tagOpen.substring( dle + 1 ).split( '.' );
                    tagOpen = tagOpen.substring( 0, dle );
                    handler = window;
                    for ( var i = 0; i < path.length; i++ ) {
                        handler = handler[path[i]];
                    }
	                $( a ).on( 'click', handler );
                } else {
                    tagOpen = tagOpen.replace( /\./g,' ' );
                    tagClose = tagClose ? tagClose.replace( /_/g,' ' ) : '';
                    $( a ).on( 'click', {
                    	tagOpen: tagOpen,
                    	sampleText: '',
                    	tagClose: tagClose
                    }, insertTags );
                }

                name = name || tagOpen + tagClose;
                name = name.replace( /\\n/g,'' );
                a.appendChild( document.createTextNode( name ) );
                a.href = '';
                paragraph.appendChild( a );
                addText( ' ' );
            }

            function addBold( text ) {
                var b = document.createElement( 'b' );
                b.appendChild( document.createTextNode( text.replace( /_/g,' ' ) ) );
                paragraph.appendChild( b );
                addText( ' ' );
            }
            function addText( txt ) {
                paragraph.appendChild( document.createTextNode( txt ) );
            }
            function insertTags( e ) {
            	e.preventDefault();
            	if ( $currentFocused && $currentFocused.length && !$currentFocused.prop( 'readonly' ) ) {
					$currentFocused.textSelection(
						'encapsulateSelection', {
							pre: e.data.tagOpen,
							peri: e.data.sampleText,
							post: e.data.tagClose
						}
					);
				}
            }
        },

        setup: function () {
            var placeholder;
            if ( $( '#editpage-specialchars' ).length ) {
                placeholder = $( '#editpage-specialchars' )[0];
            } else {
                placeholder = $( '<div id="editpage-specialchars"> </div>' ).prependTo( '.mw-editTools' )[0];
            }
            if ( !placeholder ) {
                return;
            }
            if ( !window.charinsertDontMove ) {
                $( '.editOptions' ).before( placeholder );
            }
            // Find the element that is focused
            $currentFocused = $( '#wpTextbox1' );
            // Apply to dynamically created textboxes as well as normal ones
			$( document ).on( 'focus', 'textarea, input:text', function () {
				$currentFocused = $( this );
			} );

			// Used to determine where to insert tags
            editTools.createEditTools( placeholder );
            window.updateEditTools = function () {
                editTools.createEditTools( $( '#editpage-specialchars' )[0] );
            };
        }

    }; // end editTools

    editTools.setup();
} );
