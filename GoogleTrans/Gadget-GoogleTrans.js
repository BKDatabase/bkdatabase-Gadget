/**
 * GoogleTrans - Author [[Wikipedia:User:Endo999]]
 *
 * Does translation (like Google Toolbar does) of words and selected text.
 * Works on MSIE, Firefox, Epiphany, Safari, Chrome, and Opera (still has bugs
 * on Konqueror, where this gadget is disabled).
 *
 *
 * Documentation of the API:
 * - https://developers.google.com/translate/
 *
 * Relevant policies and terms:
 * - https://developers.google.com/translate/v2/terms
 * - https://developers.google.com/terms/
 * - https://www.google.com/policies/privacy/
 *
 *   yandex translation is supported as well as google translation
 *
 * - https://yandex.com/legal/translate_termsofuse/
 * - https://translate.yandex.com/developers
 */

/*
Disclaimer

The author of this code is not responsible for any 
use of it, but will endeavor to fix any problems that is
reported to him. (Messages to Wikipedia user: Endo999)
*/



//
//  author: Endo999
// 
//  this code is open source
//
// this code is a gadget on en.wikipedia.org
// and several other wikipedias.


GT = new Object();

GT.Version = 2.21;

GT.SCbIsProxy=false; // we are not running as a proxy for another script
GT.SCbIsProxy1=false;

// put in the domain name of where dictafy25.cgi is
GT.SCDomainName="";
// put in the domain name of where saystuff1.cgi and wordtimes1.cgi is
GT.SCSpeechDomainName = "";
//GT.SCGoogleAPIKeyV2 = "AIzaSyCiO2o0J3CvQ-BNTMnDB5KRsHXZ2byriFk";
GT.SCGoogleAPIKeyV2 = "AIzaSyBUpyYOT_9D8lzlKXRWqeVKN8tFshTZXps";

GT.SCstrTranslationPopups = "GoogleTrans -";
GT.SCstrOn = "ON";
GT.SCstrOff = "OFF";
GT.SCstrLoading = "LOADING";

GT.SCbYandexTranslation=false;  // default is google translation engine
GT.SCYandexAPIKey = 'trnsl.1.1.20151111T202316Z.d8caaf472751e092.dee1a92df178e209e32db578c6c7e5150d685c3f';


// GoogleTrans -- Translation Popups
// does google toolbar like translation of words and selected text
// works on ie and firefox, epiphany, safari, and Opera but still has bugs on Konqueror
// Use:
//
//  1) position cursor over word in webpage
//  2) hold down SHIFT key
//  result: popup appears with translation of 
//  word under cursor.

//
//  OR
//  1) select text (less than 500 characters)
//  2) position cursor within selected text
//  3) hold down SHIFT key
//  result: popup appears with translation of
//  selected text

//
// OR
// 1) Double click on first word in sentence that is not in a link
// 2) all text until next period ('.') will be selected and a popup will hold the translation
// You must turn on this option in the Settings Menu (see MORE at top right of webpage).  This option is normally off


// Wikipedia Lookup
// you can get a wikipedia article on any term
// within the website by

// 1) position cursor over first word in webpage
// 2) hold down SHIFT key
// 3) click on 'Wikipedia?' link in popup
// 4) a menu of cascading terms appears in popup
// 5) click on link in popup that is a sensible
//    wikipedia request
// 6) Wikipedia article popups in another window or tab
//
// The dictionarylookup and Wikipedialookup alternate.  If you do a Wikipedialookup, the next
// time you position cursor and hold shift key down
// the wikipedia menu pops up instead of the 
// dictionarylookup popup (click on 'Dictionary?' link
// to return to dictionarylookup)
//




//
// currently runs in two modes
//
// 1) proxy mode where the dictafy20.cgi perl script
// reads a webpage, converts all links in that webpage to dictafy20.cgi links with a data item holding the original URL
// dictafy20.cgi presents the foreign website to
// the user and injects dictionarylookup20.js along
// with some other stuff into the webstuff.
//
// you can surf the web this way and inject dictionarylookup/wikipedialookup behavior into most
// webpages.

// 2) standalone mode.  runs as part of the webpage
// because you have done the following in your html/javascript code
//
// Place in your navigation bar code etc
//
//<a href="javascript:SCdoTranslationPopups()"
// id="SCTranslationPopups">Translation Popups</a>
//<script
// src="http://www.securecottage.com/dictionarylookup20.js">
// </script>
//
// change the securecottage.com stuff to your domain name
// and have the client turn on the behavior by clicking on the link

//
// dictionarylookup20.js (10k) dynamically invokes 
// dictionarylookup20a.js (80k) if the 
// GoogleTrans option is turned on
//

// You need to fill in certain default strings
// at the top of dictionarylookup20.js 
// and dictafy20.cgi (if using proxy option)
// if you are hosting this code
GT.greasemonkeygoogletrans=false;
GT.greasemonkeyweblookup= "";


GT.SCweblookup = "";
// GT.SCweblookup = "Wikipedia"; // if Wikipedialookups to be the default action!

GT.SCGoogleTrans=false;


GT.SCSettingsUponStartup = false;

//GT.SCProxyUrl = "http://cheffers.net/cottage";
//GT.SCtheURL = "http://cheffers.net/cottage";
GT.SCProxyUrl = "http://"+GT.SCDomainName;
GT.SCtheURL = "http://"+GT.SCDomainName;
GT.SCtheself = "dictionarylookuptts25a.js";
GT.SCProxySelf = "/cgi-bin/dictafy25.cgi";
GT.SCreframe="http:\\/\\/"+GT.SCDomainName+"\\/iframe\\.html";
GT.SCstrframe = 
    "http://"+GT.SCDomainName+"/iframe.html";

GT.SCbIsIE=false;
GT.SCbIsIE8=false;
GT.SCbIsIE11 = false;
GT.SCbIsEdge = false;

GT.SCthewordspeed=125;

GT.SCpersistlangFrom = "";

GT.SCpersistlangTo = "";
GT.SCwikilang = "";
GT.SCbIsInTextArea=false;



GT.SCappendCSS = function(text) {
	var s = document.createElement('style');
	s.type = 'text/css';
	s.rel = 'stylesheet';
	if (s.styleSheet) s.styleSheet.cssText = text; //IE
	else s.appendChild(document.createTextNode(text + '')); //Safari sometimes borks on null
	document.getElementsByTagName('head')[0].appendChild(s);
	return s;
};





GT.SCloadedScripts = {}; // included-scripts tracker
GT.SCimportScriptURI = function(url) {

/*
	if (this.SCloadedScripts[url]) {
	//	return null;
	}
	this.SCloadedScripts[url] = true;
	var s = document.createElement('script');
	s.setAttribute('src',url);
	s.setAttribute('type','text/javascript');
        s.setAttribute("charset","utf-8");
       // s.setAttribute("charset","utf-8");
	document.getElementsByTagName('head')[0].appendChild(s);
//	return s;
*/
mw.loader.load( url +'&action=raw&ctype=text/javascript' );
        return;
};

GT.SChookEvent = function(hookName, hookFunct) {
	if (window.addEventListener) {
		window.addEventListener(hookName, hookFunct, false);
	} else if (window.attachEvent) {
		window.attachEvent("on" + hookName, hookFunct);
	}
};


 

GT.SCImportScripts = function()
{
 var hl = "";
  
//  this.SCimportScriptURI(this.SCtheURL + "/" + this.SCtheself);
//  this.SCimportScriptURI("http://www.securecottage.com/dictionarylookup20a.js");

};
 GT.SCCreateSCitem = function()
{
 var span1 = document.createElement('DIV');
        span1.setAttribute('id','SCitem');
        span1.onMouseover=new Function("return GT.SCdonthide=true;");
        span1.setAttribute("style","background-color:blue;");
        
        var thebody = document.getElementsByTagName('BODY');
        thebody[0].appendChild(span1);
};
 GT.SConloadscitem = function() {
      
      this.SCImportScripts();

     if(typeof this.SCbDictionarylookup12Loaded != "undefined" &&
        this.SCbDictionarylookup12Loaded)
      {
	this.SCTextSettings();
        this.SCsetLanguages();
      }
     else setTimeout(GT.SCTimeoutsetLanguages,1000);

};

GT.SCTimeoutsetLanguages = function()
{
    
    if(typeof this.SCbDictionarylookup12Loaded != "undefined" &&
        this.SCbDictionarylookup12Loaded)
    {
        
	this.SCTextSettings();
        this.SCsetLanguages();
    }
    else setTimeout(GT.SCTimeoutsetLanguages,1000);
};

GT.SCaddOnloadHook = function(func)
{
  this.SChookEvent("load",func);
};

// for proxy use
//  ie - use cookies
//  firefox - use globalstorage

// for direct javascript use
// use cookies

GT.SCPersistantSave = function(key,value)
{

   this.SCsetcookieVal(key,value);
};
GT.SCPersistantLoad= function(key)
{
    return this.SCgetcookieVal(key);
};


GT.SCsetcookieVal = function(cookieKey,cookieValue)
{
   var ExpireDate = new Date();
   var days=180;
   var ifsecure = "";

   if(document.location.href.match(/^https/i))
   {
      ifsecure = " secure; ";
   }
//   ExpireDate.setTime(ExpireDate.getTime()+(days*24*60*60*1000));
ExpireDate.setYear(ExpireDate.getUTCFullYear()+1);

   document.cookie =  cookieKey + '=' + cookieValue + 
          "; path=/; " +
          
          "; expires=" + ExpireDate.toGMTString() + ifsecure;
};

GT.SCgetcookieVal = function(cookieName)
{
  
  var aCookie = "";
  var thisCookie;

  
  
  aCookie = document.cookie;
  
  thisCookie = aCookie.split(/; /);
  
  var i;
  var retCookie = "";
  for(i=0;i<thisCookie.length;i++)
  {
     if(cookieName == thisCookie[i].split("=")[0].substring(0,cookieName.length))
     {
           retCookie = thisCookie[i].split("=")[1];
           break;
     }
  }
  if(retCookie === null || retCookie == "undefined")
    retCookie = "";
  
  return retCookie;

};


GT.SCdoTranslationPopups = function()
{
   var bIsOn = this.SCPersistantLoad('GoogleTrans');
   if(typeof this.SCbDictionarylookup12Loaded == "undefined"
      && (bIsOn == "0" || bIsOn === ""))
   {
      this.SCSettingsUponStartup = true;
      this.SCGoogleTrans = true;
      this.SConloadscitem();
      this.SCTextSettings();
     
   }
   else if(typeof this.SCbDictionarylookup12Loaded != "undefined")
   {
     this.SCSettings();
     this.SCTextSettings();
   }
   
  // SCTextSettings();
};
GT.SCTextSettings = function()
{
 
  
  this.SCPersistantSave('GoogleTrans',(this.SCGoogleTrans)?"1":"0");
  var popsid = document.getElementById("SCTranslationPopups");
  if(!popsid)
  {
      setTimeout("GT.SCTextSettings()",1000);
      return;
  }
  var anchor1 = popsid;

  if(!popsid.nodeName.match(/^a$/i))
    anchor1 = popsid.getElementsByTagName( "a" )[0];
  if(!anchor1)
     return;

   var text1; 
  
  if(this.SCGoogleTrans && 
     typeof this.SCbDictionarylookup12Loaded == "undefined")
  {
   text1 = document.createTextNode(this.SCstrTranslationPopups + this.SCstrLoading);
  }
 
  else 
  if(this.SCGoogleTrans &&
     typeof this.SCbDictionarylookup12Loaded != "undefined")
    text1 = document.createTextNode(this.SCstrTranslationPopups + this.SCstrOn);
  else 
    text1 = document.createTextNode(this.SCstrTranslationPopups + this.SCstrOff);
  

 // delete text from anchor in tab
 while(anchor1.childNodes.length>0)
 {
   anchor1.removeChild(anchor1.childNodes[0]);
 }
 // replace text in anchor in tab
 anchor1.appendChild(text1);
   
if(typeof this.SCbGoogleLanguageLoaded != "undefined" &&
   this.SCbGoogleLanguageLoaded)
{

//google.language.getBranding('SCTranslationPopups');
}

};





// does google toolbar like translation of words and selected text
// works on ie and firefox, epiphany, safari, chrome, and opera but still has bugs on
// Konqueror (in fact the code is disabled on Konqueror)
// selected text translation (up to 500 characters) only on IE, Firefox, and Epiphany, and chrome

// this has only been tested on the monobook skin

/*
DisClaimer

The author of this code is not responsible for any 
use of it, but will endeavor to fix any problems that are
reported to him.  (see email address below) 

*/


// default from and to languagef
// the languages must be the same as in google.language.Languages array.
// these are normally the international defaults but note:
//  portuguese: pt-PT
//  traditional chinese: zh-TW
//  simplified chinese: zh-CN
//
// must be set in this routine for dictionarylookup.js
/*
GT.SCLanguageDefaultTo = 'en';
GT.SCLanguageDefaultFrom='en';
*/
GT.greasemonkeylanguageto = "";
GT.greasemonkeyweblookup1="";


// controls whether text to speech happens on 
// selected text (see below)
GT.SCIsTextToSpeechOn = true;

// this is the url to go to for speech to text 
// of selected words (cursor within selected text
// and then ESC key hit
//GT.SCspeechtotexturl1 =
//"http://192.168.1.41/";
//GT.SCspeechtotexturl = //"http://192.168.1.41/cgi-bin/saystuff.cgi";

GT.SCspeechtotexturl1 =
"http://"+GT.SCSpeechDomainName+"/";
GT.SCspeechtotexturl = "http://"+GT.SCSpeechDomainName+"/cgi-bin/saystuff1a.cgi";
GT.SCSpeechTimesUrl =
"http://"+GT.SCSpeechDomainName+"/cgi-bin/wordtimes1a.cgi?words=";
GT.SCSpeechTimesUrlCHINESE =
"http://"+GT.SCSpeechDomainName+"/cgi-bin/wordtimes1a.cgi?words=";

GT.SCniftysaystuff= 'http://'+GT.SCSpeechDomainName+'/cgi-bin/saystuff1a.cgi';

GT.SCSpeechtotexturlGoogle =
"http://translate.google.com/translate_tts?tl=en&amp;q=";
// tl=en

// this api v2 key is necessary, since the Language API
// is now a paid commercial service.
//
// api v1 key is discontinued dec 1st 2011
//

// romanisation code    
GT.SCRomanisationUrl = "https://www.securecottage.com/cgi-bin/pinyin.cgi";
GT.SCdoRomanisation=false;
if(document.location.protocol.match(/http:/i))
   GT.SCRomanisationUrl = "http://www.securecottage.com/cgi-bin/pinyin.cgi"; // jive with the http/https scheme of the url

GT.SCbIsIE11 = false;
GT.SCGoogleTransPersistString = 'GoogleTrans';
 



GT.SCttstoolong = 4000;


GT.SCLanguageTo='en';
GT.SCalttranslateFrom="";
GT.SCLanguageDefaultTo = GT.SCLanguageTo;
GT.SCLanguageDefaultFrom='en';
GT.SCbNotWikipedia = true;
GT.SCbIsFirefox35 = false;
GT.SCbIsFirefox35Like = false;
GT.SCbIsIE6=false;
GT.SCbIsOpera11=false;
GT.SCbIsIE9=false;



GT.SCShiftKeyNeeded = true;


// default literals for system
// must be set in this routine for dictionarylookup.js
// the gadget manager can change these to the language he wishes
GT.SCstrLanguage = "Language";
GT.SCstrSource = "Source";
GT.SCstrGoogle = "Google";
GT.SCstrCloseWindow = "Close window";
GT.SCstrSelectLanguage = "Select language (to)";
GT.SCstrWikipedialanguage = "Wikipedia language";
GT.SCstrDictionary = "Dictionary";
GT.SCstrWikipedia = "Wikipedia";
GT.SCstrWikipedia = "";
GT.SCstrPopupHelp = "GoogleTrans help?";
GT.SCstrTurnOffPopups = "Turn GoogleTrans off?";
GT.SCstrTurnOnPopups = "Turn GoogleTrans on?";
GT.SCstrGoogleTrans ="GoogleTrans";
GT.SCstrOff = " (off)";
GT.SCstrOn = " (on)";
GT.SCstrChangeOptions = "Change options for GoogleTrans";
GT.SCstrTranslatePage = "Google: translate page?";
GT.SCstrHelpUrl = 
"http://en.wikipedia.org/w/index.php?title=User:Endo999/dictionarylookuphelp.html&ctype=text/html";

GT.SCstrSingleWord = "Translation of single words";
GT.SCstrSelectedText = "Translation of selected text (> 500 characters)";
GT.SCstrKonqueror = "This feature is not supported on Konqueror";
GT.SCstrTextTooLarge =  "Text element too large to parse!";
GT.SCstrGuessLanguage = "Any language";
GT.SCstrShiftKeyNeeded = "Shift key down to bring up Popup? Turn Option ";
GT.SCstrInputFields = "Translation of words in input fields ";
GT.SCstrNextSentence = "Translate Next Sentence?";
GT.SCstrNextParagraph = "Next Paragraph?";
GT.SCstrNextSentence1 = "Next Sentence?";
GT.SCstrSlower = "Slower!";
GT.SCstrFaster = "Faster!";

GT.SCstrYandex = "Yandex";
GT.SCstrYandexCredit="Powered by Yandex.Translator";
GT.SCstrYandexTrans = "YandexTrans";






GT.SCbNoShiftKeyBrowser = false;

GT.SCPopupBackgroundColor = "beige";  // you can set the popup background color here

GT.SCbInTranslationFeaturePage = true;

GT.SCbIsSafari = false;
GT.SCbIsPre4Safari = false;


//GT.SCGoogleLanguageCodes = new Array();
//GT.SCGoogleLanguageNames = new Array();

GT.SCGoogleLanguageLoaded = function(response) {
  
  
  if(response.data && response.data.languages)
  {
     var i;
     for(i=0;i<response.data.languages.length;i++)
     {
       this.SCGoogleLanguageCodes[i] = 
          response.data.languages[i].language;
       this.SCGoogleLanguageNames[i] = 
          response.data.languages[i].name;
     }
   
     
  }
  


  this.SCbGoogleLanguageLoaded = true;
  
 // SCMakeGoogleLanguages();
  
};
GT.SCbGoogleLanguageLoaded = false;

GT.SCloadGoogleLanguage = function() {
  
      var source = 'https://www.googleapis.com/language/translate/v2/languages?target=en&key=' +
       this.SCGoogleAPIKeyV2 +
       '&callback=GT.SCGoogleLanguageLoaded';

  //     SCimportScriptURI(source);
      

};




GT.SCselectionleft = 0;
GT.SCselectionright = 0;
GT.SCselectiontop = 0;
GT.SCselectionbottom = 0;

 



GT.SCaddOnloadHook = function() {
        GT.span1 = document.createElement('DIV');
        span1.setAttribute('id','SCitem');
        GT.thebody = document.getElementsByTagName('BODY');
        thebody[0].appendChild(span1);

        GT.span2 = document.createElement('SPAN');
        span2.setAttribute('id','SCPersistElement');
        span2.setAttribute('class','SCuserData');
        thebody[0].appendChild(span2);

    };



// 90 percent of Google requests are for the language list
// better to hardcode it in this case
// list made 8/10/2011
// may have to remake list if Indian regional languages become supported.

// 90 percent of Google requests are for the language list
// better to hardcode it in this case
// list made 21/12/2012
// Indian Regional Languages now supported

GT.SCGoogleLanguageNames = [
'Abkhaz',

'Acehnese',

'Acholi',

'Afrikaans',

'Albanian',

'Alur',

'Amharic',

'Arabic',

'Armenian',

'Assamese',

'Awadhi',

'Aymara',

'Azerbaijani',

'Balinese',

'Bambara',

'Bashkir',

'Basque',

'Batak Karo',

'Batak Simalungun',

'Batak Toba',

'Belarusian',

'Bemba',

'Bengali',

'Betawi',

'Bhojpuri',

'Bikol',

'Bosnian',

'Breton',

'Bulgarian',

'Buryat',

'Cantonese',

'Catalan',

'Cebuano',

'Chichewa (Nyanja)',

'Chinese (Simplified)',

'Chinese (Traditional)',

'Chuvash',

'Corsican',

'Crimean Tatar',

'Croatian',

'Czech',

'Danish',

'Dinka',

'Divehi',

'Dogri',

'Dombe',

'Dutch',

'Dzongkha',

'English',

'Esperanto',

'Estonian',

'Ewe',

'Fijian',

'Filipino (Tagalog)',

'Finnish',

'French',

'French (French)',

'French (Canadian)',

'Frisian',

'Fulani',

'Ga',

'Galician',

'Ganda (Luganda)',

'Georgian',

'German',

'Greek',

'Guarani',

'Gujarati',

'Haitian Creole',

'Hakha Chin',

'Hausa',

'Hawaiian',

'Hebrew',

'Hiligaynon',

'Hindi',

'Hmong',

'Hungarian',

'Hunsrik',

'Icelandic',

'Igbo',

'Iloko',

'Indonesian',

'Irish',

'Italian',

'Japanese',

'Javanese',

'Kannada',

'Kapampangan',

'Kazakh',

'Khmer',

'Kiga',

'Kinyarwanda',

'Kituba',

'Konkani',

'Korean',

'Krio',

'Kurdish (Kurmanji)',

'Kurdish (Sorani)' ,

'Kyrgyz',

'Lao',

'Latgalian',

'Latin',

'Latvian',

'Ligurian',

'Limburgan',

'Lingala',

'Lithuanian',

'Lombard',

'Luo',

'Luxembourgish',

'Macedonian',

'Maithili',

'Makassar',

'Malagasy',

'Malay',

'Malay Jawi',

'Malayalam',

'Maltese',

'Maori',

'Marathi',

'Meadow Mari',

'Meiteilon (Manipuri)',

'Minang',

'Mizo',

'Mongolian',

'Myanmar(Burmese)',

'Ndebele (South)',

'Nepalbhasa (Newari)',

'Nepali',

'Northern Sotho',

'Norwegian',

'Nuer',

'Occitan',

'Odia(Oriya)',

'Oromo',

'Pangasinan',

'Papiamento',

'Pashto',

'Persian',

'Polish',

'Portuguese',

'Portuguese(Portugal)',

'Portuguese(Brazil)',

'Punjabi',

'Punjabi(Shahmukhi)',

'Quechua',

'Romani',

'Romanian',

'Rundi',

'Russian',

'Samoan',

'Sango',

'Sanskrit',

'Scots(Gaelic)' ,

'Serbian',

'Sesotho',

'Seychellois Creole',

'Shan',

'Shona',

'Sicilian',

'Silesian',

'Sindhi',

'Sinhala',

'Slovak',

'Slovenian',

'Somali',

'Spanish',

'Sundanese',

'Swahili',

'Swati',

'Swedish',

'Tajik',

'Tamil',

'Tatar',

'Telugu',

'Tetum',

'Thai',

'Tigrinya',

'Tsonga',

'Tswana',

'Turkish',

'Turkmen',

'Twi(Akan)',

'Ukrainian',

'Urdu',

'Uyghur',

'Uzbek',

'Vietnamese',

'Welsh',

'Xhosa',

'Yiddish',

'Yoruba',

'Yucatec Maya',

'Zulu'

];
GT.SCGoogleLanguageCodes = [
'ab',
'ace',
'ach',
'af',
'sq',
'alz',
'am',
'ar',
'hy',
'as',
'awa',
'ay',
'az',
'ban',
'bm',
'ba',
'eu',
'btx',
'bts',
'bbc',
'be',
'bem',
'bn',
'bew',
'bho',
'bik',
'bs',
'br',
'bg',
'bua',
'yue',
'ca',
'ceb',
'ny',
'zh-CN',
'zh-TW',
'cv',
'co',
'crh',
'hr',
'cs',
'da',
'din',
'dv',
'doi',
'dov',
'nl',
'dz',
'en',
'eo',
'et',
'ee',
'fj',
'tl',
'fi',
'fr',
'fr-FR',
'fr-CA',
'fy',
'ff',
'gaa',
'gl',
'lg',
'ka',
'de',
'el',
'gn',
'gu',
'ht',
'cnh',
'ha',
'haw',
'iw ',
'hil',
'hi',
'hmn',
'hu',
'hrx',
'is',
'ig',
'ilo',
'id',
'ga',
'it',
'ja',
'jv',
'kn',
'pam',
'kk',
'km',
'cgg',
'rw',
'ktu',
'gom',
'ko',
'kri',
'ku',
'ckb',
'ky',
'lo',
'ltg',
'la',
'lv',
'lij',
'li',
'ln',
'lt',
'lmo',
'luo',
'lb',
'mk',
'mai',
'mak',
'mg',
'ms',
'ms-Arab',
'ml',
'mt',
'mi',
'mr',
'chm',
'mni-Mtei',
'min',
'lus',
'mn',
'my',
'nr',
'new',
'ne',
'nso',
'no',
'nus',
'oc',
'or',
'om',
'pag',
'pap',
'ps',
'fa',
'pl',
'pt',
'pt-PT',
'pt-BR',
'pa',
'pa-Arab',
'qu',
'rom',
'ro',
'rn',
'ru',
'sm',
'sg',
'sa',
'gd',
'sr',
'st',
'crs',
'shn',
'sn',
'scn',
'szl',
'sd',
'si',
'sk',
'sl',
'so',
'es',
'su',
'sw',
'ss',
'sv',
'tg',
'ta',
'tt',
'te',
'tet',
'th',
'ti',
'ts',
'tn',
'tr',
'tk',
'ak',
'uk',
'ur',
'ug',
'uz',
'vi',
'cy',
'xh',
'yi',
'yo',
'yua',
'zu'

];
GT.SCnewoptions = 
'<option value="ab">Abkhaz</options>'+
'<option value="ace">Acehnese</options>'+
'<option value="ach">Acholi</options>'+
'<option value="af">Afrikaans</options>'+
'<option value="sq">Albanian</options>'+
'<option value="alz">Alur</options>'+
'<option value="am">Amharic</options>'+
'<option value="ar">Arabic</options>'+
'<option value="hy">Armenian</options>'+
'<option value="as">Assamese</options>'+
'<option value="awa">Awadhi</options>'+
'<option value="ay">Aymara</options>'+
'<option value="az">Azerbaijani</options>'+
'<option value="ban">Balinese</options>'+
'<option value="bm">Bambara</options>'+
'<option value="ba">Bashkir</options>'+
'<option value="eu">Basque</options>'+
'<option value="btx">Batak Karo</options>'+
'<option value="bts">Batak Simalungun</options>'+
'<option value="bbc">Batak Toba</options>'+
'<option value="be">Belarusian</options>'+
'<option value="bem">Bemba</options>'+
'<option value="bn">Bengali</options>'+
'<option value="bew">Betawi</options>'+
'<option value="bho">Bhojpuri</options>'+
'<option value="bik">Bikol</options>'+
'<option value="bs">Bosnian</options>'+
'<option value="br">Breton</options>'+
'<option value="bg">Bulgarian</options>'+
'<option value="bua">Buryat</options>'+
'<option value="yue">Cantonese</options>'+
'<option value="ca">Catalan</options>'+
'<option value="ceb">Cebuano</options>'+
'<option value="ny">Chichewa (Nyanja)</options>'+
'<option value="zh-CN">Chinese (Simplified)</options>'+
'<option value="zh-TW">Chinese (Traditional)</options>'+
'<option value="cv">Chuvash</options>'+
'<option value="co">Corsican</options>'+
'<option value="crh">Crimean Tatar</options>'+
'<option value="hr">Croatian</options>'+
'<option value="cs">Czech</options>'+
'<option value="da">Danish</options>'+
'<option value="din">Dinka</options>'+
'<option value="dv">Divehi</options>'+
'<option value="doi">Dogri</options>'+
'<option value="dov">Dombe</options>'+
'<option value="nl">Dutch</options>'+
'<option value="dz">Dzongkha</options>'+
'<option value="en">English</options>'+
'<option value="eo">Esperanto</options>'+
'<option value="et">Estonian</options>'+
'<option value="ee">Ewe</options>'+
'<option value="fj">Fijian</options>'+
'<option value="tl">Filipino (Tagalog)</options>'+
'<option value="fi">Finnish</options>'+
'<option value="fr">French</options>'+
'<option value="fr-FR">French (French)</options>'+
'<option value="fr-CA">French (Canadian)</options>'+
'<option value="fy">Frisian</options>'+
'<option value="ff">Fulani</options>'+
'<option value="gaa">Ga</options>'+
'<option value="gl">Galician</options>'+
'<option value="lg">Ganda (Luganda)</options>'+
'<option value="ka">Georgian</options>'+
'<option value="de">German</options>'+
'<option value="el">Greek</options>'+
'<option value="gn">Guarani</options>'+
'<option value="gu">Gujarati</options>'+
'<option value="ht">Haitian Creole</options>'+
'<option value="cnh">Hakha Chin</options>'+
'<option value="ha">Hausa</options>'+
'<option value="haw">Hawaiian</options>'+
'<option value="iw ">Hebrew</options>'+
'<option value="hil">Hiligaynon</options>'+
'<option value="hi">Hindi</options>'+
'<option value="hmn">Hmong</options>'+
'<option value="hu">Hungarian</options>'+
'<option value="hrx">Hunsrik</options>'+
'<option value="is">Icelandic</options>'+
'<option value="ig">Igbo</options>'+
'<option value="ilo">Iloko</options>'+
'<option value="id">Indonesian</options>'+
'<option value="ga">Irish</options>'+
'<option value="it">Italian</options>'+
'<option value="ja">Japanese</options>'+
'<option value="jv">Javanese</options>'+
'<option value="kn">Kannada</options>'+
'<option value="pam">Kapampangan</options>'+
'<option value="kk">Kazakh</options>'+
'<option value="km">Khmer</options>'+
'<option value="cgg">Kiga</options>'+
'<option value="rw">Kinyarwanda</options>'+
'<option value="ktu">Kituba</options>'+
'<option value="gom">Konkani</options>'+
'<option value="ko">Korean</options>'+
'<option value="kri">Krio</options>'+
'<option value="ku">Kurdish (Kurmanji)</options>'+
'<option value="ckb">Kurdish (Sorani)</options>'+

'<option value="ky">Kyrgyz</options>'+
'<option value="lo">Lao</options>'+
'<option value="ltg">Latgalian</options>'+
'<option value="la">Latin</options>'+
'<option value="lv">Latvian</options>'+
'<option value="lij">Ligurian</options>'+
'<option value="li">Limburgan</options>'+
'<option value="ln">Lingala</options>'+
'<option value="lt">Lithuanian</options>'+
'<option value="lmo">Lombard</options>'+
'<option value="luo">Luo</options>'+
'<option value="lb">Luxembourgish</options>'+
'<option value="mk">Macedonian</options>'+
'<option value="mai">Maithili</options>'+
'<option value="mak">Makassar</options>'+
'<option value="mg">Malagasy</options>'+
'<option value="ms">Malay</options>'+
'<option value="ms-Arab">Malay Jawi</options>'+
'<option value="ml">Malayalam</options>'+
'<option value="mt">Maltese</options>'+
'<option value="mi">Maori</options>'+
'<option value="mr">Marathi</options>'+
'<option value="chm">Meadow Mari</options>'+
'<option value="mni-Mtei">Meiteilon (Manipuri)</options>'+
'<option value="min">Minang</options>'+
'<option value="lus">Mizo</options>'+
'<option value="mn">Mongolian</options>'+
'<option value="my">Myanmar(Burmese)</options>'+
'<option value="nr">Ndebele (South)</options>'+
'<option value="new">Nepalbhasa (Newari)</options>'+
'<option value="ne">Nepali</options>'+
'<option value="nso">Northern Sotho</options>'+
'<option value="no">Norwegian</options>'+
'<option value="nus">Nuer</options>'+
'<option value="oc">Occitan</options>'+
'<option value="or">Odia(Oriya)</options>'+
'<option value="om">Oromo</options>'+
'<option value="pag">Pangasinan</options>'+
'<option value="pap">Papiamento</options>'+
'<option value="ps">Pashto</options>'+
'<option value="fa">Persian</options>'+
'<option value="pl">Polish</options>'+
'<option value="pt">Portuguese</options>'+
'<option value="pt-PT">Portuguese(Portugal)</options>'+
'<option value="pt-BR">Portuguese(Brazil)</options>'+
'<option value="pa">Punjabi</options>'+
'<option value="pa-Arab">Punjabi(Shahmukhi)</options>'+
'<option value="qu">Quechua</options>'+
'<option value="rom">Romani</options>'+
'<option value="ro">Romanian</options>'+
'<option value="rn">Rundi</options>'+
'<option value="ru">Russian</options>'+
'<option value="sm">Samoan</options>'+
'<option value="sg">Sango</options>'+
'<option value="sa">Sanskrit</options>'+
'<option value="gd">Scots(Gaelic)</options>'+

'<option value="sr">Serbian</options>'+
'<option value="st">Sesotho</options>'+
'<option value="crs">Seychellois Creole</options>'+
'<option value="shn">Shan</options>'+
'<option value="sn">Shona</options>'+
'<option value="scn">Sicilian</options>'+
'<option value="szl">Silesian</options>'+
'<option value="sd">Sindhi</options>'+
'<option value="si">Sinhala</options>'+
'<option value="sk">Slovak</options>'+
'<option value="sl">Slovenian</options>'+
'<option value="so">Somali</options>'+
'<option value="es">Spanish</options>'+
'<option value="su">Sundanese</options>'+
'<option value="sw">Swahili</options>'+
'<option value="ss">Swati</options>'+
'<option value="sv">Swedish</options>'+
'<option value="tg">Tajik</options>'+
'<option value="ta">Tamil</options>'+
'<option value="tt">Tatar</options>'+
'<option value="te">Telugu</options>'+
'<option value="tet">Tetum</options>'+
'<option value="th">Thai</options>'+
'<option value="ti">Tigrinya</options>'+
'<option value="ts">Tsonga</options>'+
'<option value="tn">Tswana</options>'+
'<option value="tr">Turkish</options>'+
'<option value="tk">Turkmen</options>'+
'<option value="ak">Twi(Akan)</options>'+
'<option value="uk">Ukrainian</options>'+
'<option value="ur">Urdu</options>'+
'<option value="ug">Uyghur</options>'+
'<option value="uz">Uzbek</options>'+
'<option value="vi">Vietnamese</options>'+
'<option value="cy">Welsh</options>'+
'<option value="xh">Xhosa</options>'+
'<option value="yi">Yiddish</options>'+
'<option value="yo">Yoruba</options>'+
'<option value="yua">Yucatec Maya</options>'+
'<option value="zu">Zulu</options>'

;
 
GT.SCTranslateableLanguages = [
'ab',
'ace',
'ach',
'af',
'sq',
'alz',
'am',
'ar',
'hy',
'as',
'awa',
'ay',
'az',
'ban',
'bm',
'ba',
'eu',
'btx',
'bts',
'bbc',
'be',
'bem',
'bn',
'bew',
'bho',
'bik',
'bs',
'br',
'bg',
'bua',
'yue',
'ca',
'ceb',
'ny',
'zh-CN',
'zh-TW',
'cv',
'co',
'crh',
'hr',
'cs',
'da',
'din',
'dv',
'doi',
'dov',
'nl',
'dz',
'en',
'eo',
'et',
'ee',
'fj',
'tl',
'fi',
'fr',
'fr-FR',
'fr-CA',
'fy',
'ff',
'gaa',
'gl',
'lg',
'ka',
'de',
'el',
'gn',
'gu',
'ht',
'cnh',
'ha',
'haw',
'iw ',
'hil',
'hi',
'hmn',
'hu',
'hrx',
'is',
'ig',
'ilo',
'id',
'ga',
'it',
'ja',
'jv',
'kn',
'pam',
'kk',
'km',
'cgg',
'rw',
'ktu',
'gom',
'ko',
'kri',
'ku',
'ckb',
'ky',
'lo',
'ltg',
'la',
'lv',
'lij',
'li',
'ln',
'lt',
'lmo',
'luo',
'lb',
'mk',
'mai',
'mak',
'mg',
'ms',
'ms-Arab',
'ml',
'mt',
'mi',
'mr',
'chm',
'mni-Mtei',
'min',
'lus',
'mn',
'my',
'nr',
'new',
'ne',
'nso',
'no',
'nus',
'oc',
'or',
'om',
'pag',
'pap',
'ps',
'fa',
'pl',
'pt',
'pt-PT',
'pt-BR',
'pa',
'pa-Arab',
'qu',
'rom',
'ro',
'rn',
'ru',
'sm',
'sg',
'sa',
'gd',
'sr',
'st',
'crs',
'shn',
'sn',
'scn',
'szl',
'sd',
'si',
'sk',
'sl',
'so',
'es',
'su',
'sw',
'ss',
'sv',
'tg',
'ta',
'tt',
'te',
'tet',
'th',
'ti',
'ts',
'tn',
'tr',
'tk',
'ak',
'uk',
'ur',
'ug',
'uz',
'vi',
'cy',
'xh',
'yi',
'yo',
'yua',
'zu'


];

// if romanisation is on this array is consulted to see whether the language is of the roman alphabet.  if so, romansation is not performed.
GT.SCRomanAlphabetLanguages = [
'en',
'af',
'sq',
'bg',
'bs',
'ca',
'ceb',
'ha',
'hr',
'cs',
'da',
'nl',
'eo',
'et',
'tl',
'fi',
'fr',
'gl',
'ka',
'de',
'ht',
'ha',
'hmn',
'hu',
'is',
'ig',
'id',
'ga',
'it',
'jv',
'la',
'lv',
'lt',
'mk',
'ms',
'mt',
'mi',
'no',
'pl',
'pt',
'ro',
'sk',
'sl',
'so',
'es',
'sw',
'sv',
'tr',
'vi',
'cy',
'yo',
'zu',

'ny',
'mg',
'st',
'su',
'uz',
'bs',
'my',
'ceb',
'ny',
'co',
'fy',
'haw',
'hmv',
'ig',
'jv',
'lb',
'mi',
'sm',
'gd',
'st',
'sn',
'su',
'xh',
'yo',
'zu',
'rw',
'kri',
'ay',
'bm',
'bho',
'yua',
'ff'







];

 
GT.SCIsRomanAlphabetLanguage = function(lang)
{
var i;
for(i=0;i<this.SCRomanAlphabetLanguages.length;i++)
{
  if(lang == this.SCRomanAlphabetLanguages[i])
     return true;
}
  return false;
};

GT.SCMakeGoogleLanguages = function()
{
 var l;
 var lcode;
 var newoptions = "";
 var bLangNotSupported = true;
 var b2digitsLangNotSupported = true;
 var language2digits = "";
// alert("scmakegooglelanguages");


 var i;
 var j;
 for (i=0;i<this.SCGoogleLanguageCodes.length;i++)
 {
     l = this.SCGoogleLanguageNames[i];
     lcode = this.SCGoogleLanguageCodes[i];
     GT.bTranslateable=false;
     for(j=0;j<this.SCTranslateableLanguages.length;j++)
     {
       if(this.SCTranslateableLanguages[j].toLowerCase() == lcode.toLowerCase() )
         bTranslateable = true;
     }
     if(!bTranslateable)
       continue;

     if(!l.match(/UNKNOWN/i)) 
      newoptions += 
   '<option value="' + lcode + '">' + (l.substring(0,1).toUpperCase() + l.substring(1).toLowerCase()) + '</option>'+"\n";
 }
 
 this.SCnewoptions = newoptions; 
 


};

// contents of dictionarylookup1.js follow
// this javascript isolates the text word under the 
//cursor when it rests on a word for 1.5 seconds
// works in Firefox 1,2.0,3 and IE 6.0,7,8, chrome
// works in Windows Safari, and Opera
// does not work in Konqueror(that I know of, code is disabled for Konqueror)
// with the Google language javascript api this does dictionary lookup
// in several languages.
// the word isolated  is translated
// and the translation is placed back in the new window
// on IE, Firefox, chrome, and Epiphany a cursor place over
// selected text (up to 500 characters) will use
// that text

// author: endo999
// author: Paul Cheffers
// email: paul@securecottage.com
// 2008
// 
// this webpage is placed in the public domain by the author


// the default languages(the from language is redundant as Google guesses 
// the language) but SCLanguageDefaultTo is important is you are porting
// to another Wikipedia Language



// set this in main gadget file
// restrictive environments don't like wikipedia.org to set cookies with
//document.domain = "wikipedia.org"



GT.SCSourcestrlength = GT.SCstrSource.length + GT.SCstrGoogle + 2;
GT.SCMinLength = 22;

GT.SCgooglereference1 = 
//'<span onMouseover="javascript:GT.SCdonthide=true;">' +
'<small class="SCyWindow">'+ GT.SCstrSource +': <a href="#" ' +
'onMouseover="javascript:GT.SCdonthide=true;" ' +
'onclick="javascript:window.open(\'';

GT.SCgooglereference1a =
'\')">' +((this.SCbYandexTranslation)?this.SCstrYandexCredit: this.SCstrGoogle) + '</a></small> ';

GT.SCgooglereference2 = 
'<a class="SCxWindow" href="javascript:GT.SCdonthide=false;GT.SChidespan(\'';

GT.SCgooglereference3 = '\')">X</a>';

GT.SCgooglereference4 =
'<a class="SCyWikipedia"  onMouseover="javascript:GT.SCdonthide=true;"  href="javascript:GT.SCwikichange(this)">' +
GT.SCstrWikipedia + '</a>';

//SCgooglereference4 = "";


GT.SClanguageprompt1 = 
'<small class="SCxTranslation"><a ' + 'href="javascript:GT.SCmakevisiblelanguagechange()" ' +
'onMouseover="javascript:GT.SCdonthide=true;" ' +
'>';

GT.SCstrSelect = "Select?";

GT.SCstrTurnOffDoubleclicktranslation = "Turn off Double Click Translation";
GT.SCstrTurnOnDoubleclicktranslation = "Turn on Double Click Translation";

GT.SCbDoubleClickTranslation = false;  // default for double click sentence translation is OFF

if(GT.SCbIsIE11)
{
GT.SClanguageprompt1 = 
'<small class="SCxTranslation"><a ' + 'href="javascript:GT.SCSettings();" ' +
'onMouseover="javascript:GT.SCdonthide=true;" ' +
'onMousedown="javascript:GT.SCdonthide=true;" ' +
'onMouseout="javascript:GT.SCdonthide=true;" ' +
'>';
}

GT.SClanguageprompt2 =
'</a></small>&nbsp;';

GT.SCreplacestuff = 
'<small><a href="javascript:GT.SCreplacerangetext()">Replace Text?</a></small>';

GT.SCnextsentencestr =
'\&nbsp;\&nbsp;<a class="SCyWikipedia"  href="javascript:GT.SCnextsentence(\'translate\')">' + GT.SCstrNextSentence +'</a>';

GT.SCSelectstr =
'\&nbsp;\&nbsp;<small><a class="SCyWikipedia"  href="javascript:GT.SCSelectTranslation()">' + GT.SCstrSelect +'</a></small>';

GT.SCRightToLeft=new Array('IW','AR');


GT.SClabel="";
GT.SCtext="";


GT.SCtranslate="FrenchToEnglish";
GT.SCtranslateFrom = GT.SCLanguageDefaultFrom;

GT.SCgreasemonkeytranslateto="";


GT.SCtranslateTo = GT.SCLanguageDefaultTo;


GT.SCTooManyTextElements=450;

GT.SCdonthide = false; // for change of language
GT.SCdonthide1 = false;
GT.SCdontposition=false; // automatic next sentence
GT.SCwindows = 0; // number of yellow windows
GT.SCMaxwindows = 1; // max number of yellow windows

GT.SCscreenWidth = 0;GT.SCscreenHeight = 0;
GT.SCwrheight=250;GT.SCwrwidth=300;
GT.SCscrOfX = 0;GT.SCscrOfY = 0;
GT.SCWikihtml="";GT.SCDicthtml="";
GT.SCbInsertSpan=false;
GT.SCalttranslate="";
GT.SCWikipedialanguage="en";
GT.SCshowwrad = false;
//GT.SCbIsIE = false;
//GT.SCbIsIE8 = false;
GT.SCbIsKonqueror = false;
GT.SCbIsOpera = false;
GT.SCbIsMozilla = false;
GT.SCdebug = false;
GT.SCclientX=0;
GT.SCclientY=0;
GT.SCposx = 0;  // position of cursor
GT.SCposy = 0;
GT.SCPosYAdjust = 42; // if over link with title drop popup window a little
GT.SCpposx = -1; // previous position of cursor
GT.SCpposy = -1;
GT.SCsrcElement=null;
GT.SCbIsKonquerorEvent=false;
GT.SCbMouseClicked=false;
GT.SChInterval = null;
//GT.SCMaxWordLength = 50;
GT.SCselectedText = "";
GT.SCrangeCurx = 0;
GT.SCrangeCury = 0;
GT.SCrangeCurx1 = 0;
GT.SCrangeCury1 = 0;
GT.SCselectionarray = new Array();
GT.SCselectionstart = new Array();
GT.SCselectionend = new Array();
GT.SCselectionarrayposition = new Array();
GT.SCselection = new Array();
GT.SCMaxWordLength=495;

GT.SCrangeParent=null;
GT.SCrangeOffset=0;
GT.SCtextareatext = "";
GT.SCtextarearange = null;
GT.SCtextareaelement = null;
GT.SCtextareareplacetext = "";
GT.SCtextareaWikipediaWordList=null;
GT.SCnumwords=5;

GT.SCbJustEnglish=false;

GT.SCIeRange=null;
GT.SCSelectionType="";
GT.SCbIsWordInSelection=false;
//GT.SCGoogleTrans=true;
GT.SCbIsChrome=false;
GT.SCShiftKey=false;
GT.SCALTKey= false;

// shift arrow selection stuff
GT.SCarrowstart = 37;
GT.SCarrowstop = 40;
GT.SCsetshiftkeyfunc = null;




GT.SCnn=(document.layers)?true:false;
GT.SCie=(document.all)?true:false;

GT.SCCtrlKey = false;

GT.SCkeyUp = function(e) 
{ 
var evt=(e)?e:(window.event)?window.event:null;
var key; 
if(evt)
{ 
  key=(evt.charCode)?evt.charCode: ((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
}
if(!evt)
  return;

var esckey = 27;
var f2key =  113;


try {

 if(key == esckey || key == f2key)
 {
   GT.SCALTKey = false;
  // alert("Keyup: "+SCALTKey);
 }
 else
 {
   GT.SCALTKey = false;
 }
 if (evt.shiftKey==1 && !navigator.appVersion.match(/X11/i))
    GT.SCShiftKey = true;
 else 
   {
    
    GT.SCShiftKey = false;
   }
if (evt.ctrlKey==1 && !navigator.appVersion.match(/X11/i))
    GT.SCCtrlKey = true;
 else 
   {    
    GT.SCCtrlKey = false;
   }
} 
catch(e)
{
  GT.SCShiftKey = false;
// alert("SCKEYUP:" +evt.shiftKey);
  GT.SCShiftKeyNeeded = false;
  GT.SCCtrlKey = false;
  GT.SCALTKey = false;
}
//alert("sckeyup: key"+":"+SCALTKey+":"+SCShiftKey); 
};
GT.SCkeyDown = function(e)
{ 
var debug = false;
if(debug)console.log("SCKeyDown:1");
var evt=(e)?e:(window.event)?window.event:null; 
var key=0;
if(evt)
{ 
key=(evt.charCode)?evt.charCode: ((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
}


if(!evt)
  return;

var esckey = 27;
var f2key =  113;

try {

 if(window.location.href.match(/veaction=|action=edit/i))
    return;  // no GoogleTrans in visual editor

 if(key == esckey || key == f2key)
 {
   GT.SCALTKey = true;
  // alert("Keydown: "+SCALTKey);
 }
 else
 {
   GT.SCALTKey = false;
 }

if (evt.altKey==1||evt.altKey===true)
    GT.SCAltKey = true;
 else GT.SCAltKey = false;

if(evt.ctrlKey ===true && GT.SCAltKey===true && GT.SCbInTranslationFeaturePage && window.getSelection && window.getSelection().toString() !== "")
	  {
     GT.SCCtrlKey = true;
	 var ffrange = window.getSelection().getRangeAt(0);
	 
	
	GT.SCseloffsetend1 = ffrange.endOffset;
	GT.SCselnodeend1 = ffrange.endContainer;
       
    try {
    window.getSelection().collapseToStart();
    } catch(err) { }
     
	 
	 GT.SCFFnextsentence('ttspara1');
        
	 GT.SCGoogleLookup2();
	 
	 GT.SCCtrlKey = false;
	 GT.SCAltKey = false;
	 GT.SCShiftKey = false;
     GT.SCbMouseClicked = false;
	  }
   else GT.SCCtrlKey = false;
 if(debug)console.log("SCKeyDown:2");
if ((evt.shiftKey==1||evt.shiftKey===true) ||
    (navigator.appVersion.match(/X11/i) && key == 16)
    )
    {
	  if(debug)console.log("SCKeyDown:3");
      GT.SCShiftKey = true; 
	  if(debug)console.log("SCKeyDown:3a");
	  GT.SCFindElementUnderMouseOver(GT.SCsrcElement);
	  if(debug)console.log("SCKeyDown:4");
	  
    }
 else 
    {
      if(key >= GT.SCarrowstart && key <= GT.SCarrowstop && GT.SCShiftKey)
      {   
          if(GT.SCbIsIE9)
            GT.SChidespan(GT.SCcurrentLink);
 
          GT.SCbMouseClicked = false;
      }
 
      GT.SCShiftKey = false;
    }


}
catch(e)
{
  GT.SCShiftKey = false;
//  alert("SCKEYDOWN:" +evt.shiftKey);
  GT.SCShiftKeyNeeded = false;
} 
//alert("sckeydown: key"+":"+SCALTKey+":"+SCShiftKey);


if(key == 27 && this.SCdebug === false) // escape key
{
 // SCdebug = true; 
 
}
else if(key == 27 && this.SCdebug === true)
{
//  SCdebug = false;
//  SCcreateEvents();
}
} ;
 

GT.SCeventhook = function(hook,func)
{
/*
if(document.addEventListener)
	document.addEventListener(hook, func, false);
else
	document.attachEvent("on" + hook, func);
*/
$("body").on(hook,func);

};


GT.SCcreateEvents = function()
{

this.SCeventhook("keyup",this.SCkeyUp);
this.SCeventhook("keydown",this.SCkeyDown);
//this.SCeventhook("mousedown",this.SCcaptureMousedown);
this.SCeventhook("mousemove",this.SCcaptureMousemove);
this.SCeventhook("mouseout",this.SCcaptureMouseout);
this.SCeventhook("dblclick",this.SCcaptureDblClick);

};







GT.SCbIsOutsideClientArea = false;

GT.SCcaptureMouseout = function(evt)
{
    GT.SCbIsOutsideClientArea = true;
    GT.SCbMouseClicked = false;
};

GT.SClastposx=0;
GT.SClastposy=0;
GT.SCbInSCInterval = false;
GT.SCintervalsession=0;


GT.SCinterval = function()
{
   var debug = false;
   var SCbMouseMoved = false;
   var posx = this.SCposx - this.SCpposx;
   var posy = this.SCposy - this.SCpposy;
   posx = Math.abs(posx);
   posy = Math.abs(posy);
 
   var threshold = 25;
   var ob = null;
   if(this.SCcurrentLink!= null && this.SCcurrentLink!= "") 
      ob = document.getElementById(this.SCcurrentLink);
   
   if(posx < threshold && posy < threshold)
     SCbMouseMoved = false;
   else  
     SCbMouseMoved = true;

   var bIsInPopup = false;
   if(ob)
   {   
      bIsInPopup = this.SCIsInElement(ob);
   }   
   var bIsOutsideBody = false;
//   bIsOutsideBody = !this.SCIsInElement(document.body);
 if(debug && ob)
     console.log(this.SCcurrentLink+":"+posx+":"+posy+":"+bIsInPopup+":"+bIsOutsideBody+":"+SCbMouseMoved);
   if(ob && !bIsInPopup && !bIsOutsideBody && SCbMouseMoved)
   {  
      this.SChidespan(this.SCcurrentLink);
   }
  
   this.SCpposx = this.SCposx;
   this.SCpposy = this.SCposy;
  
};

GT.SCcaptureDblClick = function(evt)
{
  if(!GT.SCGoogleTrans)
          return;

 if(! GT.SCbDoubleClickTranslation )
     return;
 if(window.location.href.match(/veaction=|action=edit/i))
    return;  // no GoogleTrans in visual editor

 if(!(GT.SCbIsFirefox35Like||GT.SCbIsIE9))
    return;

    GT.SCbDoubleClick = true;
	GT.SCbMouseClicked = false;
	GT.SCALTKey = true;
	
 //   setTimeout("GT.SCTTSSubroutine()",100);  
 
    GT.SCnextsentence('translatefirst');
	
	GT.SCShiftKey = false;
	GT.SCbDoubleClick = false;
   
	
};

GT.SCbMousedMoved = false;
GT.SCcaptureMousemove = function(evt)
{

// SCcurrentLink
// SCsrcElement
   GT.SCbIsOutsideClientArea = false;
   var debug = false;

   if(this.SCbIsMozilla)
   {
     if(debug)
       alert(evt.rangeParent+":"+evt.rangeOffset);
     GT.SCrangeParent = evt.rangeParent;
     GTSCrangeOffset = evt.rangeOffset;
   }


   GT.SCFindPositionOfMouseClick(evt);
 
};

// capture right mouse click

GT.SCcaptureMousedown = function(evt)
{
var mouseClick;


if(evt) mouseClick = evt.which;
else mouseClick = window.event.button;

if(/*mouseClick == 1 &&*/ this.SCbIsOutsideClientArea===false)
{
  GT.SCbMouseClicked = true;
  if(GT.SCShiftKey && (!GT.SCbIsIE||GT.SCbIsIE9))
    GT.SChidespan(GT.SCcurrentLink);
  GT.SCShiftKey = false;
}

};
//http://www.quirksmode.org/js/events_properties.html
GT.SCFindPositionOfMouseClick = function(e) {

    var debug = false;
	this.SCposx = 0;
	this.SCposy = 0;
 
	if (!e) e = window.event;
	if (e.pageX || e.pageY) {
 
 
		this.SCposx = e.pageX;
		this.SCposy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
             if(1==1)
             {
 
 
                this.SCclientX=e.clientX;
                this.SCclientY=e.clientY;
 
		this.SCposx = e.clientX +  document.body.scrollLeft + document.documentElement.scrollLeft;
		this.SCposy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
              }
              else
              {
                this.SCposx = window.event.x+document.body.scrollLeft;
                this.SCposy = window.event.y+document.body.scrollTop;
              }      
	}
	// SCposx and SCposy contain the mouse position relative to the document
 
 
	if (e.target) 
        {
         this.SCsrcElement = e.target;
        }
	else if (e.srcElement) 
        {
         this.SCsrcElement = e.srcElement;
        }
   if(debug)console.log(this.SCposx+":"+this.SCposy+":"+this.SCsrcElement);
};


// find the element under the mouse click
// see http://www.quirksmode.org/js/events_properties.html
         // only scan through text elements
         GT.SelectionNode=null;
         GT.SelectionOffset=null;
         GT.SelectionAnchorNode = null;
         GT.SelectionAnchorOffset=null;
         GT.SCSelectionRange=null;
         GT.SCCommonAncestor=null;
         

GT.SCFindElementUnderMouseOver = function(targ) {

        var debug = false;
        if(debug) console.log("FE: 00");
  
        if(!targ)
          return;
		if(debug) console.log("FE: 01");
  
        if(!this.SCGoogleTrans)
          return;
     
        if(targ.tagName && targ.tagName.toLowerCase() == "textarea") return;  // dont test if element holding cursor is a textarea or input
        if(targ.tagName && targ.tagName.toLowerCase() == "input" && targ.type.toLowerCase() == "text") return;
		  
        if(debug) console.log("FE: 1");
  
 //      if(!SCALTKey && SCShiftKeyNeeded && SCShiftKey == false)
 //         return;
 //       If(!SCShiftKey) return;
        
        if(this.SCwindows >= this.SCMaxwindows)
          return;
		if(debug) console.log("FE: 2");

        // stop dictionary lookup in Content Translation Middle Translation column
        // first, are we in the Content Translation page?
        var bContentTranslationMiddleColumn = $('.cx-column--translation').attr('lang');
        if(GT.SCShiftKey && bContentTranslationMiddleColumn)
        {
        // next, are we in the middle translation column
        var targ1 = targ;
      
        var bNotInMiddleTranslationColumn = true;
        while(targ1.parentNode != null)
        {
             targ1 = targ1.parentNode;
             var objclass = targ1.getAttribute("class");
        
             
             if(objclass && objclass.match(/ cx-column--translation/))
             {
                bNotInMiddleTranslationColumn = false;
                break;
             }
              if(objclass && objclass.match(/cx-widget__columns/))
             {
                bNotInMiddleTranslationColumn = true;
                break;
             }
        }
        if(bNotInMiddleTranslationColumn == false)
          return;
        }

        
	if (targ.nodeType == 3) // defeat Safari bug
        {
		targ = targ.parentNode;
        }      
         
         var children = targ.childNodes;
		 var parent = targ;
         var ntextchildren = 0;
		 var bElementHoldingCursorFound = false;
		 var oElementHoldingCursor = null;
		 
		   var sel = window.getSelection();
           if(sel === null ||sel.toString() === "" )
               this.SCSavedSelectionRange = null;
		   else if(sel.toString() !== "")
		   {
		   this.SCSavedSelectionRange = sel.getRangeAt(0);
		   this.SCStartContainer = this.SCSavedSelectionRange.startContainer;
		   this.SCStartOffset = this.SCSavedSelectionRange.startOffset;
		   this.SCEndContainer = this.SCSavedSelectionRange.endContainer;
		   this.SCEndOffset = this.SCSavedSelectionRange.endOffset;
		   this.SCSelectionText = sel.toString();
          
    	   }	
              if(debug) console.log("FE: 3");
         for(i=0;i<children.length;i++)
         {
		    if(children[i].nodeType == 3)
			{
            
            var left = document.createElement('SPAN');
			
           // left.setAttribute("id","SCDimensions");  
			
            var lefttext = document.createTextNode(children[i].nodeValue);
			
            
            left.appendChild(lefttext);

            var savetextelement = children[i];
            
	        parent.replaceChild(left,savetextelement);		
		    if(debug) console.log("FE: 4");
            
            if(left.getClientRects)
            {
			   
               if(this.SCIsInElement(left))
			   {
                 bElementHoldingCursorFound = true;
				 oElementHoldingCursor = savetextelement;
			   }
		    }
			
	    	parent.replaceChild(savetextelement,left);

            if(bElementHoldingCursorFound) break;
			}
             
         }
		 if(debug) console.log("FE: 5");
         if(bElementHoldingCursorFound)
		 {
		      if(debug) console.log("FE: 6");
              //alert("bingo: " +oElementHoldingCursor.nodeValue);		 
			  this.FindIndividualWordInTextElement(parent,oElementHoldingCursor);
			  if(debug) console.log("FE: 7");
			  
			 
			  //parent.replaceChild(savetextelement,left);
		 }
		 
         this.SCSavedSelectionRange = null;

};
GT.SCCursorOverElement = null;
GT.SCCursorOverElementX1=0;
GT.SCCursorOverElementX1length=0; 

GT.SCStartContainer=null;
GT.SCStartOffset = 0;
GT.SCEndContainer = null;
GT.SCEndOffset = 0;


GT.FindIndividualWordInTextElement = function(parent,textobj)
{
  var debug = false;
  if(debug)console.log("FI: 1");
  if(!textobj)
    return;
  if(!parent)
    return;
  if(debug)console.log("FI: 2");
  var objlength = textobj.nodeValue.length;
  var low = 0;
  var high = objlength;
  var middle = Math.floor((objlength+low)/2);
  var str1 = textobj.nodeValue.substr(low,middle);
  var str2 = textobj.nodeValue.substr(middle);
  var oFound = textobj;
  var oParent = parent;
  var loopcounter = 0;
  var maxloop = 50;
  var highesto3 = null;
  if(debug)console.log("FI: 3");
  while(high-1 > low)
  {
       if(loopcounter++>=maxloop) break;
	   if(debug)console.log("FI: 4");
	   
       var o1 = document.createElement("SPAN");
	   var t1 = document.createTextNode(str1);
	   o1.appendChild(t1);
       var o2 = document.createElement("SPAN");
	   var t2 = document.createTextNode(str2);
	   o2.appendChild(t2);
	   var o3 = document.createElement("SPAN");
	   o3.appendChild(o1);
	   o3.appendChild(o2);
	   if(debug)console.log("FI: 4a");
	   if(loopcounter ==1) highesto3 = o3;
	   
	     oParent.replaceChild(o3,oFound);
		 if(debug)console.log("FI: 4b");
	     var bLeftElementHoldsCursor = false;
		 var bRightElementHoldsCursor = false;
	  
       if(o1.getClientRects)
	   {
	     if(this.SCIsInElement(o1))
	     {
		   bLeftElementHoldsCursor = true;
	     }
		 else if(this.SCIsInElement(o2))
	     {
		   bRightElementHoldsCursor = true;
	     }
		 if(debug)console.log("FI: 4c");

	   }
	    
       if(bLeftElementHoldsCursor)
	   {
	   if(debug)console.log("FI: 44a");
	      high = Math.floor(middle);
		  middle = Math.floor((low+high)/2);
		  var mid = Math.floor(o1.innerText.length/2);
		  str1 = o1.innerText.substr(0,mid);
		  str2 = o1.innerText.substr(mid);
		  oFound = o1;
		  oParent = o3;
		  if(debug)console.log("FI: 44b");
	   }
       else if(bRightElementHoldsCursor)
	   {
	   if(debug)console.log("FI: 44c");
	      low = middle;
		  if(debug)console.log("FI: 44c1");
		  middle = Math.floor((low+high)/2);
		  if(debug)console.log("FI: 44c2");
		  mid = Math.floor(o2.innerText.length/2);
		  
		  str1 = o2.innerText.substr(0,mid);
		  str2 = o2.innerText.substr(mid);
		  oFound = o2;
		  oParent = o3;
		  if(debug)console.log("FI: 44d");
	   }
	   
	   
	   
	 
  }
 // alert(low+":"+high+":"+textobj.nodeValue.substr(low,objlength-high));
  if(debug)console.log("FI: 5");
  parent.replaceChild(textobj,highesto3);
  if(debug)console.log("FI: 5a");
  this.SCCursorOverElement = textobj;
  this.SCCursorOverElementX1=low;
  this.SCCursorOverElementX1length=objlength-high; 
  if(debug)console.log("FI: 6");
  this.SCbIsCursorWithinSelection = this.IsCursorWithinSelection(this.SCCursorOverElement,this.SCCursorOverElementX1,this.SCCursorOverElementX1length);
  
  // get the word over cursor, not just the character
  var beginword = low;
  var endword = low;
  var i;
  for(i=low;i>0;i--)
    if(textobj.nodeValue.substr(i,1).match(/[\sã€ã€‚ï¼Œ]/))
	    break;
  if(textobj.nodeValue.substr(i,1).match(/[\sã€ã€‚ï¼Œ]/))
      beginword = i+1;
  else beginword = i;
  if(debug)console.log("FI: 7");
  endword = 0;
  for(i=0;beginword+i<=textobj.nodeValue.length;i++)
    if(textobj.nodeValue.substr(beginword+i,1).match(/[\sã€ã€‚ï¼Œ]/))
	{   endword = i;
	    break;
	}
	else endword = i;
 

  
 // alert(low+":"+high+":"+textobj.nodeValue.substr(beginword,endword)+":"+SCbIsCursorWithinSelection);
  var words = textobj.nodeValue.substr(beginword+endword).split(/\s/);
  this.SCbIsWordInSelection = this.SCbIsCursorWithinSelection;
  if(debug)console.log("FI: 8");
 
  if(this.SCbIsCursorWithinSelection)
     this.SCSetInLink(this.SCSelectionText,parent,textobj,0," ",words,true);
  else 
  {
     if(debug)console.log("FI: 9");
     this.SCSetInLink(textobj.nodeValue.substr(beginword,endword),parent,textobj,0," ",words,true);
  }
  if(debug)console.log("FI: 10");

};

  GT.SCCursorOverElement = null;
  GT.SCCursorOverElementX1=0;
  GT.SCCursorOverElementX1length=0;
  GT.SCbIsCursorWithinSelection=false; 
  GT.SCSelectionText="";

    GT.SCseloffsetbeg1=0;
	GT.SCselnodebeg1 = null;  

 GT.IsCursorWithinSelection = function(oElement,X1,X1length)
 {
   
   if(this.SCSavedSelectionRange)  // restore selection after playing with spans and text elements
   {
   try {
     var selection = window.getSelection();
     selection.removeAllRanges();
	 var range = document.createRange();

       range.setStart(this.SCStartContainer, this.SCStartOffset);
       range.setEnd(this.SCEndContainer, this.SCEndOffset);
     selection.addRange(range);  
	 }catch(err){ alert("unbingo");}
   }
   
    var ffrange = null;
	try{
	  if(window.getSelection().toString() === null || window.getSelection().toString()==="")
	     return false;
	  ffrange=window.getSelection().getRangeAt(0);
	} catch(err){ return false;}
	
	this.SCseloffsetbeg1=ffrange.startOffset;
	this.SCselnodebeg1 = ffrange.startContainer;  

	 
	this.SCseloffsetend1 = ffrange.endOffset;
	this.SCselnodeend1 = ffrange.endContainer;
	        
       
    try {
      window.getSelection().collapseToStart();
    } catch(err) { }
	
    this.SCSelectionInPopup = false; 
	this.SCFFnextsentence('ttspara1');
	
	
	if(this.SCSavedSelectionRange)  // restore selection after playing with spans and text elements
   {
   try {
     selection = window.getSelection();
     selection.removeAllRanges();
	 range = document.createRange();

       range.setStart(this.SCStartContainer, this.SCStartOffset);
       range.setEnd(this.SCEndContainer, this.SCEndOffset);
     selection.addRange(range);  
	 }catch(err){ alert("unbingo");}
   }

	
	  if(this.SCCursorOverElement == this.SCTextElementArray[0] && this.SCCursorOverElementX1 < this.SCseloffsetbeg1)
	     return false;

	  if(this.SCCursorOverElement == this.SCTextElementArray[this.SCTextElementArrayIndex-1] && this.SCCursorOverElementX1 > this.SCseloffsetend1 )
	     return false;
        
	  for(i=0;i<this.SCTextElementArrayIndex;i++)
	   {
	      if(this.SCTextElementArray[i] == oElement)
		     return true;
	   }
   return false;
 };

GT.SCindex = 0;  // for ids of translation windows
// put the translation window near the cursor point
GT.SCcurrentLink = "";
GT.SClinkword = "";
GT.SCSetInLink = function(word,parent,child,wordindex,delimiter,words,bIsSearchDone)
{
  var debug = false;
  if(debug)console.log("Set: 1");
if(debug)console.log("Set: 2");
  if(this.SCShiftKeyNeeded && !this.SCShiftKey)
     return;
if(debug)console.log("Set: 2a");
  if(this.SCwindows >= this.SCMaxwindows)
     return;
	 if(debug)console.log("Set: 2b");
  this.SCwindows++;
  if(debug)console.log("Set: 3");
  
  var linkname = "SC" + (++this.SCindex);
  this.SCcurrentLink = linkname;

  // take out punctuation if single word 
  if(word.split(/\s/).length==1)
     word = word.replace(/[.;:?!,]/g,"");

  this.SClinkword = word;

  if(word.length > this.SCMaxWordLength)
  {
    word = word.substring(0,this.SCMaxWordLength);
    word += "...";
  }

   if(debug)console.log("Set: 4");
  //GT.str1 = document.createElement("SPAN");
  str1 = document.createTextNode(word);

  var a1 = document.createElement("DIV");

  a1.setAttribute("id",linkname); 
 
  if(this.SCbIsIE9) 
       {
          a1.setAttribute("class","SCPopupIE");
          a1.className = "SCPopupIE";
       }
  else a1.className = "SCPopupIE";

  if(!this.SCbIsIE) 
  {
    a1.setAttribute("onMousedown",'GT.SChidespan("' + linkname + '")');
  }
  a1.setAttribute("onMouseover","GT.SCdonthide=true;");
  a1.setAttribute("onMouseout","GT.SCdonthide=false;");

 
  this.SCbInsertSpan = false;
  if(debug)console.log("Set: 5"); 
  if(this.SCweblookup != "Wikipedia")
  {
     if(debug)console.log("Set: 6");
     a1.appendChild(str1);
     this.SCWikihtml = this.SCWikipediaLink(wordindex,delimiter,words).innerHTML;
     this.SCDicthtml = "";
       if(debug)console.log("Set: 7");
     
     
  }
  else
  { 
  if(debug)console.log("Set: 8");
 a1.appendChild(this.SCWikipediaLink(wordindex,delimiter,words));
if(debug)console.log("Set: 9");
    this.SCWikihtml="";
    this.SCDicthtml=word;
  
  }

  
  var thebody = document.getElementsByTagName("BODY");
//  GT.html = document.getElementsByTagName("HTML");
   
    
      var item = document.getElementById("SCitem");
      if(item)
        item.appendChild(a1);
      
      
    
if(debug)console.log("Set: 10");
    if(this.SCweblookup == "Wikipedia")
    {
	if(debug)console.log("Set: 11");
       this.SCsetLanguageDefault("wikipedialanguageoptions",
                       "Wikipedialanguage");
    if(debug)console.log("Set: 12");
    }
 
  // cursorposition is absolute, positioning of 
  // webpage elements may upset translation window 
  // positioning, so append this window to body.
 
  // position window
  if(debug)console.log("Set: 13");
  this.SCPositionPopup(linkname,true);
  if(debug)console.log("Set: 14");
  if(this.SCweblookup != "Wikipedia")
  {
    
    var theworda = word;
    theworda = theworda.replace(/\'/g,"\u0026#39;");
    theworda = theworda.replace(/\"/g,"\u0026quot;");
    if(debug)console.log("Set: 15");
    this.SCasyncGet(linkname, theworda);
  }
  
};

// is the current element in a link and does this link have a title?
GT.SCIsSrcElementInALink = function()
{
   if(!this.SCsrcElement)
      return false;
   

   if(this.SCsrcElement.nodeName.match(/^a$/i)
      && ((this.SCsrcElement.getAttribute("title") !== null &&
          this.SCsrcElement.getAttribute("title") !== "")
          || typeof popupVersion != "undefined") )
      return true;

   var Elem = this.SCsrcElement;

   while(Elem.parentNode)
   {
      if(Elem.nodeName.match(/^a$/i)
      && ((Elem.getAttribute("title") !== null &&
          Elem.getAttribute("title") !== "")
          || typeof popupVersion != "undefined")
         )
      return true;

      Elem = Elem.parentNode;
   }
   return false;
   
};

GT.SCPositionPopup = function(linkname,bAdjust)
{

  if(this.SCdontposition)
     return;

  var a2 = document.getElementById(linkname);
  var thebody = document.getElementsByTagName("BODY");

  var posyadjust = 0;
  var posxadjust = 0;
  var xadjust = 5;
  var yadjust = 5;

  var bAdjustPosition = this.SCIsSrcElementInALink();

  if(bAdjustPosition && typeof popupVersion != "undefined" && bAdjust)
      posyadjust = -this.SCPosYAdjust;
  else if(bAdjustPosition)
      posyadjust = this.SCPosYAdjust;
 
  if(a2 && a2.style)
  {
    
    {
        // a2 element returns 0 for following function
        var doclength = this.SCfinddoclength(thebody[0]);
        
	var a2overflow = (this.SCposx+a2.scrollWidth+1) - doclength;
	if(a2overflow > 0)
	{
	  var newposx =  this.SCposx - a2overflow;
//	  a2.style.position="absolute";
	  a2.style.left = (newposx+xadjust) + "px";
	  a2.style.top=(this.SCposy + posyadjust+yadjust) + "px";
//    
	}
      else
      {
          a2.style.left = (this.SCposx+xadjust) + "px";
          a2.style.top = (this.SCposy + posyadjust+yadjust) + "px";
      }
     

    }
//    a2.style.display="block";
      
  }

};

// after translation window has been left clicked
// remove it
GT.SChidespan = function(id)
{
  
 
  if(this.SCdonthide)
    return; // so change of language can be done
  if(this.SCdonthide1)
    return;
  
  try
  {
  
  this.SCwindows--;
  if(this.SCwindows < 0) this.SCwindows = 0;
  
  var ob = document.getElementById(id);
  //alert(ob.innerHTML)
  if(/*SCbIsOpera &&*/ !ob)
 {} //   alert("ob not found");
  else
  if(this.SCbIsIE || this.SCbIsOpera)
  {
     ob = document.getElementById("SCitem");
	// delete all children
	while(ob.childNodes.length>0)
	{
	ob.removeChild(ob.childNodes[0]);
	}
  //   ob.style.position="absolute";
  //   ob.style.left=0;
  //   ob.style.top=0;
   //    ob.style.zIndex = "9999";//
  }
  else
  {
    var styl = ob.style;
    styl.display = "none";
  
  if(ob && ob.parentNode)
     ob.parentNode.removeChild(ob);
  else
     if(this.SCbIsOpera) alert("maybe no parentnode");
  }
  }
  catch(err)
  {
    if(this.SCbIsOpera)
      alert("unable to hide " + id);
  }
  
  // clear the html
  this.SCWikihtml = "";
  this.SCDicthtml = "";
  

};
GT.SCfinddoclength = function(obj)
{
        var ScrollBarOffset = 0;
       

	if(this.SCbIsOpera)
          return window.innerWidth;
        else
          return document.body.clientWidth-ScrollBarOffset; // minus the scroll bar if IE

	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			
			obj = obj.offsetParent;
		}
        
	}
       
        return obj.offsetWidth;

};
// code from http://www.quirksmode.org/js/findpos.html
GT.SCfindPosX = function(obj)
{
	var curleft = 0;
        if(!obj)
           return 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
{
		curleft += obj.x;
}
	return curleft;
};
// code from http://www.quirksmode.org/js/findpos.html
GT.SCfindPosY = function(obj)
{
	var curtop = 0;
        if(!obj)
           return 0;
        
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
        {
		curtop += obj.y;
        }
	return curtop;
};

// place meaning within translation window
GT.SCInsertTranslation = function(label,text1,translatedword)
{
	// GT.translatedword = SCrequest.responseText;
        var xadjust = 5;
        var yadjust = 5;
        
       
//	 GT.translation = translatedword.split("|");
	// translation[0] id of window
	// translation[1] word
	// translation[2] translated word
		  
//          GT.meaning = translation[2];

          var meaning = translatedword;
          
	  if(meaning == '\n')
	     meaning = "NOT FOUND!!";

          meaning = meaning.replace(/\\u0026#39;/gi,"'");
          meaning = meaning.replace(/\\u0026quot;/gi,'"');

          
          if(this.SCweblookup == "Wikipedia" && !this.SCbInsertSpan)
          {
            this.SCDicthtml = meaning;
            return;
          }
          this.SCbInsertSpan = true;
          // SCbInsertSpan = false;

          var ob = document.getElementById(label);
	  if(ob)
	  {
			
		try{
                          
                     var span1 = document.createElement("SPAN");
                     var newid = "x" + label;
                     span1.setAttribute("id",newid);
                          
                     span1.innerHTML = 
                             meaning;
                          
		     ob.replaceChild(span1,ob.firstChild);

                     var span2 = document.getElementById(newid);
 		     var bIsInLink = this.SCIsSrcElementInALink();
                     var pixelstring = "px";
                     if(this.SCbIsIE && !this.SCbIsIE9)
                         pixelstring = "";

                     // the following code handles the IE 
                     // case where the yellow window goes
                     // to the right of the body
                    if(!this.SCbIsSafari)
                     {
                     var doclength = this.SCfinddoclength(span2.parentNode);
                     var span2overflow = (this.SCposx+span2.scrollWidth+1) - doclength;
                  
                     if(span2overflow > 0 && !this.SCdontposition)
                     {
                       
                       var newposx =  this.SCposx - span2overflow;
                       span2.parentNode.style.position="absolute";
                       span2.parentNode.style.left =( newposx+xadjust)+pixelstring;
                       span2.parentNode.style.top=(this.SCposy+yadjust)+pixelstring;
		       if(bIsInLink && typeof popupVersion == "undefined")
                          span2.parentNode.style.top = (this.SCposy + this.SCPosYAdjust+xadjust) + pixelstring;
                     }
                    }
                   
                    if(bIsInLink && typeof popupVersion != "undefined" && !this.SCdontposition)
                    {
                       span2.parentNode.style.top = (this.SCposy - span2.parentNode.offsetHeight+yadjust) + pixelstring;
                    }

		   }
		catch(err)
		{
		  alert("unable to set innerHTML");
		}
	}
        //else alert("no id:" + translatedword);
        this.SCdontposition = false;

};


// issue Google Ajax request

GT.SCasyncGet = function(id,word)
{
   
   var languagepath = "en|fr";
   // consult SCtranslate for language translation
   if(typeof this.SCtranslateFrom != "undefined"
      && typeof this.SCtranslateTo != "undefined"
     )
   {
       languagepath = this.SCtranslateFrom + "|" + 
                      this.SCtranslateTo;
   }
   
   var persistantlanguagepathFrom = this.SCPersistantLoad('languageFrom');
   var persistantlanguagepathTo = this.SCPersistantLoad('languageTo');

   

   if(persistantlanguagepathFrom !== "" &&
      persistantlanguagepathTo !== "")
        languagepath = persistantlanguagepathFrom + 
             "|" + persistantlanguagepathTo;
   if(languagepath=="Wikipedia")
        languagepath = "en|fr";

//   if(languagepath == "Wikipedia")
//   {
//   }
//   else
   {
     // google limits to 500 characters of translation
     if(word.length > this.SCMaxWordLength)
        word = word.substring(0,this.SCMaxWordLength);
     var bIsSelectedText = "NO";
     if(this.SCbIsWordInSelection)
         bIsSelectedText = "YES";

     word = word.replace(/\'/g,"\u0026#39;");
     word = word.replace(/\"/g,"\u0026quot;");
     
     if(this.SCbIsInTextArea)
       this.SCgoogleDetect(word,id);
     else
       this.SCgoogleLookup(word,id);
   }
};
GT.SCreplaceHtml = function(obj,newhtml)
{
 while(obj.childNodes.length>0)
 {
   obj.removeChild(obj.childNodes[0]);
 }
 var newspan = document.createElement("SPAN");
 newspan.innerHTML = newhtml;
 obj.appendChild(newspan);
};
GT.SClanguageChange = function(obj,id)
{
 var langoptions = 
 obj.options[
     obj.selectedIndex
     ].value;
 if(id.match(/From/))
 {
   this.SCtranslateFrom = langoptions;
   this.SCPersistantSave('languageFrom',this.SCtranslateFrom);
 }
 else if(id.match(/To/))
 {
   this.SCtranslateTo = langoptions;
   this.SCPersistantSave('languageTo',this.SCtranslateTo);
 }
// SCtranslate = langoptions;

 //SCdonthide = false;
 //SChidespan(SCcurrentLink);
};
GT.SCwikipedialanguageChange = function(obj)
{
 var langoptions = 
 obj.options[
     obj.selectedIndex
     ].value;
 this.SCWikipedialanguage = langoptions;
 this.SCPersistantSave('Wikipedialanguage',this.SCWikipedialanguage);
 var objWiki = document.getElementById(this.SCcurrentLink);
 if(!objWiki)
 {
   alert("objWiki failed: " + this.SCcurrentLink);
   
 }
 
 var arrLinks = objWiki.getElementsByTagName("A");
 var i;
 for(i=0;i<arrLinks.length;i++)
 {
   var theonclick = arrLinks[i].getAttribute("onclick");
  
   if(!theonclick)
      continue;

   if(theonclick.toString().match(/^(.*)..\.wikipedia\.org\?(.*)$/mi))
   {
     
      var newonclick =
       RegExp.$1 +
          this.SCWikipedialanguage +".wikipedia.org" + '?' + RegExp.$2;
 
         arrLinks[i].setAttribute("onclick",newonclick);
   }
 } 
};
GT.SCSettings = function()
{
  var linkname = "SC" + (++this.SCindex);
  this.SCcurrentLink = linkname;

  var str1 = document.createTextNode("");
  var a1 = document.createElement("DIV");
  a1.setAttribute("id",linkname); 
  if(!this.SCbIsIE) // firefox accepts these attributes
                    // ie does not
  {
    a1.setAttribute("onMousedown",'GT.SChidespan("' + linkname + '")');
    a1.setAttribute("class","SCPopup");
    /*
    a1.setAttribute("style","text-decoration:none;background-color:" + this.SCPopupBackgroundColor + ";border: 1px solid blue;position:absolute;font-size:14pt;z-index:9999;overflow:visible;display:none;line-height:normal;");
  */
  }
  
 
  a1.setAttribute("onMouseover","GT.SCdonthide=true;");
  if(!this.SCbIsIE11)
    a1.setAttribute("onMouseout","GT.SCdonthide=false;");

  a1.appendChild(str1); 
   if(!this.SCbIsIE) 
   {
            a1.setAttribute("onMousedown","");
           // a1.firstChild.setAttribute("onMousedown","");
   }
  var thebody = document.getElementsByTagName("BODY");
//  GT.html = document.getElementsByTagName("HTML");
   
      var item = document.getElementById("SCitem");
      if(item)
        item.appendChild(a1);
      this.SCPositionPopup(linkname,false);

      this.SCmakevisiblelanguagechange();    
};
GT.SCHideSettings = function()
{
  this.SCdonthide=false;
  this.SCPersistantSave(this.SCGoogleTransPersistString,(this.SCGoogleTrans)?"1":"0");

  this.SCPersistantSave("DoubleClickTranslation",(this.SCbDoubleClickTranslation)?"1":"0");

  var popsid = document.getElementById("ca-TransPopsId");
  this.SCPersistantSave('GoogleTrans',(this.SCGoogleTrans)?"1":"0");
  
  if(!popsid)
      return;

  var anchor1 = popsid;
  
  if(!popsid.nodeName.match(/^a$/i))
  anchor1 = popsid.getElementsByTagName( "a" )[0];
  if(!anchor1)
     return;

  var text1; 
  
  if(this.SCGoogleTrans)
    text1 = document.createTextNode(this.SCstrGoogleTrans  + this.SCstrOn);
  else 
    text1 = document.createTextNode(this.SCstrGoogleTrans + this.SCstrOff);
  

 // delete text from anchor in tab
 while(anchor1.childNodes.length>0)
 {
   anchor1.removeChild(anchor1.childNodes[0]);
 }
 // replace text in anchor in tab
 anchor1.appendChild(text1);
   
  this.SCdonthide1 = false;
  this.SChidespan(this.SCcurrentLink);
};
GT.SCSaveShiftKeyNeeded = function()
{
   if(this.SCbNoShiftKeyBrowser)
   {
//     alert("SCSAVESHIFTKEYNEEDED");
     this.SCShiftKeyNeeded = false;
     return;
   }
   this.SCsetInterval();

   this.SCPersistantSave("shiftkeyneeded",this.SCShiftKeyNeeded?"1":"0");
};
GT.SCnewhtml = "";
GT.SCmakevisiblelanguagechange = function()
{

var obj = document.getElementById(this.SCcurrentLink);
if(!obj)
{
  alert("unable to get object: SCmakevisiblelanguagechange " + this.SCcurrentLink);
  return;
}
this.SCdonthide = true;



var persistantlanguageFrom = this.SCPersistantLoad('languageFrom');
if(persistantlanguageFrom === "")
   persistantlanguageFrom = this.SCLanguageDefaultFrom;
var persistantlanguageTo = this.SCPersistantLoad('languageTo');
if(persistantlanguageTo === "")
   persistantlanguageTo = this.SCLanguageDefaultTo;

var newhtml = 

'<a class="SCxWindow" href="javascript:GT.SCdonthide=false;GT.SChidespan(\'' +
GT.SCcurrentLink +
'\')">X</a>' +

'<small><a href="javascript:;"' +
' style="text-decoration:underline;" ' +
' onclick="javascript:GT.SCGoogleTrans=' +
((this.SCGoogleTrans)?"false":"true") + 
';GT.SCHideSettings();">' +
((this.SCGoogleTrans)?this.SCstrTurnOffPopups:
this.SCstrTurnOnPopups) +
'</a>' + 
'&nbsp;&nbsp;<a style="text-decoration:underline" href="javascript:;"  onclick="javascript:window.open(\''+this.SCstrHelpUrl+'\');">' + this.SCstrPopupHelp+'</a>'+

'<br><a href="javascript:;"' +
' style="text-decoration:underline;" ' +
' onclick="javascript:GT.SCbDoubleClickTranslation=' +
((this.SCbDoubleClickTranslation)?"false":"true") + 
';GT.SCHideSettings();">' +
((this.SCbDoubleClickTranslation)?this.SCstrTurnOffDoubleclicktranslation:
this.SCstrTurnOnDoubleclicktranslation) +
'</a>' +
'</small>' +
'<br>&nbsp;&nbsp;' + 
'<small>' + this.SCstrSelectLanguage + '</small><br>' +
'<SELECT name="languageoptionsFrom" id="languageoptionsFrom"' +
 'onchange="GT.SClanguageChange(this,\'languageFrom\')"' +
' onMouseover="javascript:GT.SCdonthide=true;" class="SChidestuff">' +
//' onMouseout="javascript:GT.SCdonthide=false;">' +
 this.SCnewoptions + 
'</select>' +
'<SELECT name="languageoptionsTo" id="languageoptionsTo"' +
 'onchange="GT.SClanguageChange(this,\'languageTo\')">' +
' onMouseover="javascript:GT.SCdonthide=true;">' +
//' onMouseout="javascript:GT.SCdonthide=false;">' +
 this.SCnewoptions + 
'</select>&nbsp;&nbsp;<br><small>' +
this.SCstrSingleWord + this.SCstrOn + '<br>' +
this.SCstrSelectedText + ((this.SCbIsIE || (this.SCbIsMozilla&&!(this.SCbIsOpera||this.SCbIsKonqueror||this.SCbIsPre4Safari )))?this.SCstrOn:this.SCstrOff) +
((this.SCbIsKonqueror)?this.SCstrKonqueror + '<br>' : '') +
'<br>' +
'<b>Note on privacy</b>: Translations will be processed by Google or Yandex, who may receive data from your device. Please check their respective privacy policies.<br>'+
'<small>Select Translation Engine</small>'+
'<select name="translationenginechange" id="translationenginechange" '+
'onchange="GT.SCtranslationenginechange(this)" ' +
' onMouseover="javascript:GT.SCdonthide=true;">' +
'<option value="Yandex" '+((this.SCbYandexTranslation)?" selected ":"")+ '   >Yandex</option>' +
'<option value="Google" '+((!this.SCbYandexTranslation)?" selected ":"")+ '  >Google</option>' +
'</select><br>'
;

 var newspan = document.createElement("DIV");


  newspan.setAttribute("onMouseover","javascript:GT.SCdonthide=true;");
  if(this.SCbIsIE9)
  {
     newspan.onmouseover = new Function("GT.SCdonthide=true;");
     obj.onmouseout = null;
  }
 newspan.innerHTML = newhtml;

 var i;
 
 while(obj.childNodes.length>0)
 {
   obj.removeChild(obj.childNodes[0]);
 }
 
 
// obj.replaceChild(newspan,obj.firstChild);
  obj.appendChild(newspan);

if(this.SCbIsSafari) 
   obj.setAttribute("onMousedown","");
 
// obj.innerHTML = newhtml;
   this.SCsetLanguageDefault("languageoptionsFrom","languageFrom");
   this.SCsetLanguageDefault("languageoptionsTo","languageTo");

    if(this.SCtextareatext !== "" && 
          (this.SCtextareaelement.nodeName == "TEXTAREA" ||
           this.SCtextareaelement.nodeName == "INPUT")
          )
    {
        obj = document.getElementById("languageoptionsFrom");
        if(obj)
           obj.style.display="block";
    }

  
 
};

GT.SCsetLanguageDefault = function(id,key)
{
  var i;
  var obj = document.getElementById(id);
  if(!obj)
      return;
  
  var defaultlanguage = this.SCPersistantLoad(key);
  if(defaultlanguage === "")
  {
     
//     if(typeof this.SCtranslate == "undefined")
     {
        if(key.match(/From/))
          defaultlanguage = this.SCLanguageDefaultFrom;
        else if(key.match(/To/))
          defaultlanguage = this.SCLanguageDefaultTo;
    
     }
//     else defaultlanguage = SCtranslate;
  }
 
 if(!obj || (obj && !obj.options))
  {
     alert("setLanguageDefault: bad object passed!" +
      id + ":" +
      key);
  }
  for(i=0;i<obj.options.length;i++)
  {
     obj.options[i].selected = false;
    
  
     if(obj.options[i].value.match(defaultlanguage,"i"))
     {
        obj.options[i].selected = true; 
        
     }
  }
 
  if(this.SCbIsSafari)
  {
     obj.setAttribute("style","text-decoration:underline");
  }
};

GT.SCwikichange = function(obj)
{
  var parobj = document.getElementById(this.SCcurrentLink);
  if(parobj && this.SCWikihtml !== "")
  {
     this.SCalttranslateFrom = this.SCtranslateFrom;
     this.SCalttranslateTo = this.SCtranslateTo;
    
 //    SCtranslateFrom = "Wikipedia";
 //    SCPersistantSave('languageFrom',SCtranslateFrom);
     this.SCweblookup = "Wikipedia";
     this.SCPersistantSave('weblookup',this.SCweblookup);
     this.SCDicthtml = parobj.innerHTML;
     if(this.SCbIsIE||this.SCbIsSafari)
        this.SCreplaceHtml(parobj,this.SCWikihtml);
     else
        parobj.innerHTML = this.SCWikihtml;
    this.SCsetLanguageDefault("wikipedialanguageoptions",
                       "Wikipedialanguage");

   if(this.SCbIsSafari) 
            parobj.setAttribute("onMousedown","");

  
  }
};
GT.SCdictionarychange = function(obj)
{
  var parobj = document.getElementById(this.SCcurrentLink);
  
  if(parobj && this.SCDicthtml !== "")
  {
     this.SCtranslateFrom = this.SCalttranslateFrom;
  //   SCtranslateTo = SCalttranslateTo;
  //   SCtranslateFrom = SCPersistantLoad('languageFrom');
     this.SCtranslateFrom = this.SCPersistantLoad('languageFrom');
     this.SCPersistantSave('languageFrom',this.SCtranslateFrom);
     this.SCweblookup = "";
     this.SCPersistantSave('weblookup',this.SCweblookup);
     this.SCtranslateTo = this.SCPersistantLoad('languageTo');

     if(this.SCtranslateFrom === "")
         this.SCtranslateFrom = this.SCLanguageDefaultFrom;
     if(this.SCtranslateTo === "")
         this.SCtranslateTo = this.SCLanguageDefaultTo;

     this.SCWikihtml = parobj.innerHTML;
     if(this.SCbIsIE||this.SCbIsSafari)
       this.SCreplaceHtml(parobj,this.SCDicthtml);
     else
       parobj.innerHTML = this.SCDicthtml;

     if(parobj && !this.SCbIsIE)
     {
        parobj.setAttribute("onMousedown",'GT.SChidespan("' + this.SCcurrentLink + '")');
     }

     if(!this.SCbInsertSpan)
     {
      
       this.SCasyncGet(this.SCcurrentLink,this.SCDicthtml);
       this.SCbInsertSpan=true;
      
     }
    
  }
};

GT.SCWikipediaLink = function(wordindex,delimiter,words)
{
  var debug = false;
  if(debug)console.log("WiLink: 1");
  var i,j;
  
  var newhtml = 
'<div ' +
' onMouseover="javascript:GT.SCdonthide=true;"' +
' onMouseout="javascript:GT.SCdonthide=false;">' +
'<a href="javascript:GT.SCmakevisiblelanguagechange()"' +
' style="text-decoration:underline"' +
' onMouseover="javascript:SCdonthide=true;"' +

'>' +
'Wikipedia</a>';

  newhtml +=
  '&nbsp;&nbsp;<a href="javascript:GT.SCdictionarychange(this)"' +
' style="text-decoration:underline"' +
' onMouseover="javascript:GT.SCdonthide=true;"' +
'>' +
'Dictionary?</a>';
  newhtml += 
'<br><small>Wikipedia language</small><br>' +
'<SELECT name="Wikipedialanguageoptions" id="wikipedialanguageoptions"' +
 'onchange="GT.SCwikipedialanguageChange(this)"' +

'onFocus="javascript:GT.SCdonthide1=true;"' +
' onBlur="javascript:GT.SCdonthide1=false;"' +
'>' +
this.SCnewoptions +
'</select><br>';
 if(debug)console.log("WiLink: 2");
  var numwords=4;
  
  if((this.SCtranslateFrom.match("zh","i") 
      || this.SCtranslateFrom == "ja")
       ||
     (this.SCweblookup == "Wikipedia" && 
      (this.SCalttranslateFrom.match("zh","i") ||
       this.SCalttranslateFrom == "ja"
        ))
     )
      numwords = 10;

  var wordindexend = wordindex + numwords;
  if(wordindexend > words.length-1)
     wordindexend = words.length-1;
 
  for(i=wordindex;words!== null && i<=wordindexend;i++)
  {
     var linktext = "";
     for(j=wordindex;j<=i;j++)
     {
        var theword="";
        
        if(words[j].match(/^(.*)(\u2019|')[s]$/i) && j==i)
           theword = RegExp.$1;
        else theword = words[j];
        theword = theword.replace(/\'/g,"\u0026#39;");
        theword = theword.replace(/\"/g,"\u0026quot;");
        linktext += theword;
        if(j<i)
          linktext += delimiter;
     }
     if(linktext.match(/^(.*)[,.;:!()?]$/))
     {
        linktext = RegExp.$1;
     }
     
 if(debug)console.log("WiLink: 3");
     newhtml += '<br><a ' +
'onMouseover="javascript:GT.SCdonthide=true;" ' +
 ' href="javascript:SCdonthide=false;GT.SCdonthide1=false;GT.SChidespan(\'' + this.SCcurrentLink + '\');" ' +
 'onclick=\'javascript:window.open(\"http://' +
this.SCWikipedialanguage.substring(0,2) + '.wikipedia.org?go=Go&search=' +
     encodeURIComponent(linktext) + '\")\'>' + linktext + '</a>';
     
  }
 
  newhtml +='<br><a href="javascript:GT.SCdonthide=false;GT.SCdonthide1=false;GT.SChidespan(' + '\'' + this.SCcurrentLink +'\')"><small>X</small></a></div>';

  var newspan = document.createElement("SPAN");
 
  newspan.innerHTML = newhtml;
 if(debug)console.log("WiLink: 4");
  return newspan;
};
//http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
GT.SCScreenSize = function() {
  
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    this.SCscreenWidth = window.innerWidth;
    this.SCscreenHeight = window.innerHeight;

  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    this.SCscreenWidth = document.documentElement.clientWidth;
    this.SCscreenHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    this.SCscreenWidth = document.body.clientWidth;
    this.SCscreenHeight = document.body.clientHeight;
  }
 
};
//http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
GT.SCgetScrollXY = function() {
  if( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    this.SCscrOfY = window.pageYOffset;
    this.SCscrOfX = window.pageXOffset;
  } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
    //DOM compliant
    this.SCscrOfY = document.body.scrollTop;
    this.SCscrOfX = document.body.scrollLeft;
  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
    //IE6 standards compliant mode
    this.SCscrOfY = document.documentElement.scrollTop;
    this.SCscrOfX = document.documentElement.scrollLeft;
  }

};
// is the current cursor position inside 
// a selected area.  The selected area must be 
// within one node and be on the same line
// only works for IE


// is cursor within the element, needs getClientsRect() call to be present on SPAN element
GT.SCIsInElement = function(elem)
{
   var debug=debug;
   var objx = document.getElementById("SCmessage1");
 

   if(!elem)
       return false;
   

   if(!elem.getClientRects)
       return false;

    if(debug)console.log("SCI:1");

    var collection = elem.getClientRects();
    var i;
    for(i=0;i<collection.length;i++)
    {
       var leftt = collection[i].left +
           document.body.scrollLeft+
           document.documentElement.scrollLeft;
       var rightt =  collection[i].right +
           document.body.scrollLeft+
           document.documentElement.scrollLeft;
       var topp = collection[i].top +
           document.body.scrollTop+
           document.documentElement.scrollTop;
       var bottomm = collection[i].bottom +
           document.body.scrollTop+
           document.documentElement.scrollTop;

    this.SCselectionleft = leftt;
    this.SCselectionright = rightt;
    this.SCselectiontop = topp;
    this.SCselectionbottom = bottomm;

    if(this.SCposx >= leftt
    && this.SCposx <= rightt
    && this.SCposy >= topp
    && this.SCposy <= bottomm
    )
       return true;
  if(debug)
       console.log(collection[i].left+"-"+collection[i].right+"_"+
             collection[i].top +"_"+collection[i].bottom+"__"+
        leftt+":"
       + ":" + rightt + ":" +
       ":"+document.body.scrollLeft +":"+
           document.documentElement.scrollLeft +
       ":"+topp+":"
        +bottomm+":"+":"
         +document.body.scrollTop+":" +
        document.documentElement.scrollTop +":"
       +this.SCposx+":"+this.SCposy);
    }
 
 
    return false;
 
};

GT.SCgetRangeObject = function(selectionObject) 
{
	 // Safari!
		var range = document.createRange();
		range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
		range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
		return range;
	
};
  
GT.SCSavedSelectionRange=null;
GT.SCanchorNode=null;
GT.SCanchorOffset=0;
GT.SCfocusNode=null;
GT.SCfocusOffset = 0;
GT.SCSelectionInPopup = false;
GT.SCSelectionInPopupSaved = false;

GT.SCSetSelection = function()
{
   if(this.SCSelectionInPopupSaved && this.SCSelectionInPopup)
 {
 try {
   var range = document.createRange();
   range.setStart(this.SCanchorNode, this.SCanchorOffset);
  
   range.setEnd(this.SCfocusNode,this.SCfocusOffset); 
        
   var selection = window.getSelection();
   selection.removeAllRanges();
   selection.addRange(range);
   this.SCSelectionInPopup = true;
   } catch(err){ }
   this.SCSelectionInPopupSaved = false;
   this.SCSelectionInPopup = false;
  }
};
GT.SCFFnextsentence = function(action)
{
    this.SCSetSelection(); 
    var debug = false;
    var sel = window.getSelection();
    if(sel === null  )
      return false;
	if(debug)console.log("scffnextsentence:1");
    this.SCffrange = sel.getRangeAt(0);
    try {
    window.getSelection().removeRange(this.SCffrange);
    } catch(err) { }
   if(debug)console.log("scffnextsentence:2");
    var retc = 0;
    if(action.match(/translatefirst/i))
      retc = this.SCffrange.collapse(true);
    else 
      retc = this.SCffrange.collapse(false);
    if(debug)console.log("scffnextsentence:3");
    this.SCseloffset=this.SCffrange.startOffset;
    this.SCseloffsetend=this.SCffrange.endOffset;
    this.SCselnodeend=this.SCffrange.endContainer;
    this.SCselnode = this.SCffrange.startContainer;
    
    this.SCTextElementArray= new Array();
    this.SCTextElementLengthArray = new Array();
    this.SCTextElementArrayIndex = 0;
    if(action.match(/para1/i))
      this.SCseloffsetend = 0;
    if(this.SCseloffsetend > 0 && !action.match(/translate/))
        this.SCseloffsetend--;
    this.SCffrange.setStart(this.SCselnodeend,this.SCseloffsetend);
   if(debug)console.log("scffnextsentence:3");
    
    var loopbreak=10000;
    var loopcounter = 0;
    var minsentencelength = 10;
    var sentencelength = 0;
    var re1=new RegExp("[ï¼Ÿà¥¤:.?;ã€‚]");
    var re1para = new RegExp("[\n\r]{2}");
    var seltype = "sentence";
    if(action.match(/para/i))
    {
      re1 = re1para;
      seltype = "para";
    }
this.SCffrecursioncounter = 0;
  var nextchar = "";
     
   
        nextchar= this.SCgetnextcharacterinffrange(seltype);
   
 while((nextchar !== "" && !nextchar.match(re1))||sentencelength < minsentencelength)
    {
       
       sentencelength++;
       this.SCffrecursioncounter = 0;
//       nextchar = SCgetnextcharacterinffrange(seltype);
     // this is hacky but it may fix the 'getnextsentence' bug
     
        nextchar= this.SCgetnextcharacterinffrange(seltype);

       if(1==0&& nextchar.match(/./))
       {
         
         var answer=confirm("X:"+nextchar);
         if(answer)
           break;
       }
       if(action.match(/para1/i) && this.SCselnodeend == this.SCselnodeend1 && this.SCseloffsetend >= this.SCseloffsetend1)
       {      

	      break;
       }  
       if(++loopcounter > loopbreak)
       {
         //alert("loop break set");
         break;
       }
    }
   
    try {
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(this.SCffrange);
    } catch(err){
    // alert("failure1");
   }
  
if(debug)console.log("scffnextsentence:5");
    var containernode= this.SCselnodeend;
    
    while(containernode && !containernode.offsetHeight)
    {
       containernode = containernode.parentNode;
    }
    
    if(containernode && action.match(/tts|translate/)&&!action.match(/para1/i))
    {
      if(debug)console.log("scffnextsentence:7");
      this.SCposx = this.SCfindPosX(containernode)+
      Math.floor(containernode.offsetWidth/2);
      
      this.SCposy = this.SCfindPosY(containernode) +
        containernode.offsetHeight;
    }
    if(action.match(/translate/i))
    {
	if(debug)console.log("scffnextsentence:8");
	   debug = false;
       this.SCdonthide = false;
       this.SCdonthide1 = false;
       this.SChidespan(this.SCcurrentLink);
    //   SCpposx = SCposx;
    //   SCpposy = SCpoxy;
       this.SCShiftKey = true;
       if(debug)console.log("scffnextsentence: translate1");
       this.SCSetInLink(this.SCffrange.toString(),null,null,0," ",
         this.SCffrange.toString().split(/\s+/),false);
       if(debug)console.log("scffnextsentence: translate2");
       this.SCShiftKey = false;
  //     SCpposx = SCposx;
  //     SCpposy = SCpoxy;
       this.SClastposx = this.SCposx;
       this.SClastposy = this.SCposy;
       this.SCdonthide = true;
       this.SCdontposition = true;
       
    }

    debug=false;
	if(debug)
	{
	  var alertstring = "";
	  var i;
	  for(i=0;i<this.SCTextElementArrayIndex;i++)
	  {
	    alertstring += this.SCTextElementArray[i].nodeValue.substr(0,this.SCTextElementLengthArray[i])+"\n";
		alertstring += this.SCTextElementArray[i].nodeType + "\n";
	  }
	  alert(alertstring);
	}       

};
// next sentence processing
    GT.SCselnode=null;
    GT.SCseloffset=null;
    GT.SCselnodeend=0;
    GT.SCseloffsetend=0;

   GT.SCselnodeend1=0;
    GT.SCseloffsetend1=0;

GT.SCffrange=null;
GT.SCffrecursioncounter=0;
GT.SCffrecursionbreak=1000;

GT.SCTextElementArray= new Array();
GT.SCTextElementLengthArray = new Array();
GT.SCTextElementArrayIndex = 0;

GT.SCLastPNode=null;
GT.SCgetnextcharacterinffrange = function(type)
{
    var debug=false;    
    if(++this.SCffrecursioncounter > this.SCffrecursionbreak)
        return "";

    var rangeset = "";
    if(debug)
      alert("0:" + this.SCselnodeend.nodeType+":"+this.SCselnodeend.nodeName+":"+this.SCselnodeend.length);
    if(this.SCselnodeend.nodeName=="P")
        this.SCLastPNode=this.SCselnodeend;
    if(this.SCselnodeend.nodeType != 3)
    {
       var children = this.SCselnodeend.childNodes;
       var i;
       
       for(i=0;i<children.length;i++)
       {
         this.SCselnodeend = children[i];
         this.SCseloffsetend=0;
         if(debug)alert("to 1:"+this.SCselnodeend.nodeName);
         rangeset = this.SCgetnextcharacterinffrange(type);
         if(debug)alert("from 1:"+this.SCselnodeend.nodeName);

         if(rangeset !== "")
           break;
       }
       
       
    }
    else if(this.SCselnodeend.nodeType==3 && 
            this.SCselnodeend.length <=this.SCseloffsetend
           )
    {
        var node = this.SCselnodeend;
        while(node.parentNode)
        {

           if(++this.SCffrecursioncounter > this.SCffrecursionbreak)
               return "";

           var nextsibling = node.nextSibling;
           if(nextsibling !== null)
           {
             this.SCselnodeend = nextsibling;
             node = node.nextSibling;
             this.SCseloffsetend = 0;
              if(debug)alert("to 2:"+this.SCselnodeend.nodeName);

             rangeset = this.SCgetnextcharacterinffrange(type);
             if(debug)alert("from 2:"+this.SCselnodeend.nodeName);

             if(rangeset !== "")
               break;
           }
           else
           {
               this.SCselnodeend = node.parentNode.nextSibling;
               this.SCseloffsetend = 0;

               if(node.parentNode.nodeName == "P"
                 && typeof type != "undefined" &&
               type.match(/para[^1]/i))
               {
                  return "\n\n";
               }
               
               while(node && !this.SCselnodeend)
               {
                  node = node.parentNode;
                  this.SCselnodeend = node.nextSibling;

                  if(node.nodeName == "P"
                 && typeof type != "undefined" &&
                    type.match(/para[^1]/i))
                  {
                     return "\n\n";
                  }

               }
               if(!node || !this.SCselnodeend)
               {
                  rangeset = "";
                  break;
               }
             if(debug)alert("to 3:"+this.SCselnodeend.nodeName);

             rangeset = this.SCgetnextcharacterinffrange(type);
             if(debug)alert("from 3:"+this.SCselnodeend.nodeName+":"+rangeset);

             if(rangeset !== "")
               break;
             node = this.SCselnodeend;
           }
        }
    }
    else if(this.SCselnodeend.nodeType==3 && 
                this.SCselnodeend.length > this.SCseloffsetend)
    {
	  if(this.SCseloffsetend==0)
	  {
	    	this.SCTextElementArray[this.SCTextElementArrayIndex]=this.SCselnodeend;
            this.SCTextElementLengthArray[this.SCTextElementArrayIndex]=0;
            this.SCTextElementArrayIndex++;
	  }
      this.SCffrange.setEnd(this.SCselnodeend,++this.SCseloffsetend);
      rangeset = this.SCffrange.toString().substr(
         this.SCffrange.toString().length-1,1); 
      this.SCTextElementLengthArray[this.SCTextElementArrayIndex-1]++;
    }
    return rangeset; 
};
GT.SCProcessString = function(str,index)
{

   str = str.replace(/\u0026#39;/gi,"'");
   str = str.replace(/\u0026quot;/gi,'"');
   str = str.replace(/\u000a/," ");  // get rid of any nonbreaking spaces
   if(this.SCTextElementArray[index].nodeValue.substr(0,1).match(/\s+/))
	    str = " "+str;
   if(this.SCTextElementArray[index].nodeValue.substr(this.SCTextElementArray[index].nodeValue.length-1,1).match(/\s+/))
	    str = str +" ";
   return str;
};
// ie
GT.SCnextsentence = function(action)
{
  var debug = false;
  var obj;
  if(this.SCbIsFirefox35Like||this.SCbIsIE9||this.SCbIsIE11)
  {
    this.SCFFnextsentence(action);
    return;
  }
};
GT.SCPauseInPlace = false;
GT.SCPauseWordsAsSpoken = function()
{
    this.SCStopWordsAsSpoken();
    this.SCPauseInPlace = true;
};
GT.SCStopWordsAsSpoken = function()
{
  this.SCStopWords = true;
};


GT.SCgoogletranslate = "";

GT.SCGoogleLookup2 = function()
{
      var translateto = $('.cx-column--translation').attr('lang');
      if(!translateto)
         return;

      var source = 'https://www.googleapis.com/language/translate/v2?key=' +
       this.SCGoogleAPIKeyV2 /*+'&source='+SCtranslateFrom*/+'&target=' + 
       translateto + 
       '&callback=GT.SCTranslatedText2';
	   
	if (this.SCbYandexTranslation)source=
'https://translate.yandex.net/api/v1.5/tr.json/translate?'+ 
'key='+this.SCYandexAPIKey+
 '&lang='+translateto+
 '&callback=GT.SCTranslatedText2Yandex';
	
	
       var i;
	   
	   if(this.SCTextElementArrayIndex <= 0) return;

                  var str1='q=';
                  if (this.SCbYandexTranslation) str1 = 'text=';
	
	   if(this.SCselnode)
	   {
	
	     if(this.SCTextElementArrayIndex == 1)
		 {
		    insertstr = this.SCselnode.nodeValue.substring(this.SCseloffset, this.SCTextElementLengthArray[0]);
		  }
		 else
	        insertstr = this.SCselnode.nodeValue.substring(this.SCseloffset);
		 source += "&"+str1+encodeURIComponent(insertstr);
	   }
	
	   
	   
	   for(i=1;i<this.SCTextElementArrayIndex;i++)
	   {
	     source += "&"+str1 + encodeURIComponent(this.SCTextElementArray[i].nodeValue.substr(0,this.SCTextElementLengthArray[i]));
	   }
 
      this.SCimportScriptURI(source);

};





GT.SCYandexLookup = function(text,label)
{
      var sourceText = encodeURIComponent(text);
        
      var source = 
	
'https://translate.yandex.net/api/v1.5/tr.json/translate?'+ 
'key='+this.SCYandexAPIKey+
 '&lang='+this.SCtranslateTo+
 '&callback=GT.SCTranslatedTextYandex&text=' + sourceText;
 
       this.SCimportScriptURI(source);


};

GT.SCgoogleLookup = function(text,label) 
{
      
      this.SClabel = label;
      this.SCtext = text;

      if(this.SCbYandexTranslation) return this.SCYandexLookup(text,label);
      
    if(typeof SCbaseurl != "undefined")
    {
      this.SCgoogletranslate =
      "http://translate.google.com/translate?hl=en" + "&tl=" + this.SCtranslateTo +"&u=" +
          encodeURIComponent(SCbaseurl + "?" + SCbaseparamlist);
    }
    else
    {
       this.SCgoogletranslate =
       "http://translate.google.com/translate?hl=en" + "&tl=" + this.SCtranslateTo +"&u=" +
          encodeURIComponent(document.location.href);
    }

      var sourceText = encodeURIComponent(text);
        

      var source = 'https://www.googleapis.com/language/translate/v2?key=' +
       this.SCGoogleAPIKeyV2 /*+'&source='+SCtranslateFrom*/+'&target=' + 
       this.SCtranslateTo + 
       '&callback=GT.SCTranslatedText&q=' + sourceText
       ;
 
       this.SCimportScriptURI(source);

       
       
    
};
GT.SCtextDetect="";
GT.SCGoogleDetectV2 = function(text)
{
      
      this.SCtextDetect = text;
      var sourceText = encodeURIComponent(text);
        

      var source = 'https://www.googleapis.com/language/translate/v2?key=' +
       this.SCGoogleAPIKeyV2 /*+'&source='+SCtranslateFrom*/+'&target=' + 
       this.SCtranslateTo + 
       '&callback=GT.SCDetectedText&q=' + sourceText
       ;

       this.SCimportScriptURI(source);

};

GT.SCTranslatedText2Yandex = function(response)
{
   //console.log(response);
   if(response.code != 200)
   {
      alert("Yandex response error code: "+response.code+ " returning!");
      return;
   }
   if(this.SCTextElementArrayIndex <= 0 || response.text.length <= 0)
     return;
 var i;
  var insertstr = "";

	if(this.SCseloffset > 0)
	   insertstr = this.SCselnode.nodeValue.substr(0,SCseloffset);
	  
	 insertstr += response.text[0]; 
	 
	 if(this.SCTextElementArrayIndex == 1)
	 {
	    insertstr += this.SCselnodeend.nodeValue.substring(this.SCseloffsetend,this.SCselnodeend.nodeValue.length);
		
	 }
	  
	  this.SCTextElementArray[0].nodeValue = this.SCProcessString(insertstr,0);
	 
	   
  for(i=1;i<response.text.length-1;i++)
  {
      var retstr = response.text[i];	
	   
	  this.SCTextElementArray[i].nodeValue = this.SCProcessString(retstr,i);
	  
  }
  if(this.SCTextElementArrayIndex>1)
  {
      var retstr = response.text[i];
	  retstr = retstr + this.SCTextElementArray[i].nodeValue.substring(this.SCTextElementLengthArray[i],this.SCTextElementArray[i].nodeValue.length);	  
	  
	  this.SCTextElementArray[i].nodeValue = this.SCProcessString(retstr,0);
  }
  

};
GT.SCTranslatedText2 = function(response)
{
 
  if(response.error)
    return;
	
  var i;
  var insertstr = "";
  if(this.SCTextElementArrayIndex <= 0 || response.data.translations.length <= 0)
     return;
	 
	 
	 if(this.SCseloffset > 0)
	   insertstr = this.SCselnode.nodeValue.substr(0,this.SCseloffset);
	  
	 insertstr += response.data.translations[0].translatedText; 
	 
	 if(this.SCTextElementArrayIndex == 1)
	 {
	    insertstr += this.SCselnodeend.nodeValue.substring(this.SCseloffsetend,this.SCselnodeend.nodeValue.length);
		
	 }
	  
	  this.SCTextElementArray[0].nodeValue = this.SCProcessString(insertstr,0);
	   
  for(i=1;i<response.data.translations.length-1;i++)
  {
      var retstr = response.data.translations[i].translatedText;	
	   
	  this.SCTextElementArray[i].nodeValue = this.SCProcessString(retstr,i);
	  
  }
  if(this.SCTextElementArrayIndex>1)
  {
      var retstr = response.data.translations[i].translatedText;
	  retstr = retstr + this.SCTextElementArray[i].nodeValue.substring(this.SCTextElementLengthArray[i],this.SCTextElementArray[i].nodeValue.length);	  
	  
	  this.SCTextElementArray[i].nodeValue = this.SCProcessString(retstr,0);
  }
  
};

GT.SCTranslatedFromLanguage="";
GT.SCTranslatedTextYandex = function(response)
{
 //if(response.code != 200) return;

       this.SCgoogletranslate =
       "http://translate.yandex.com/?" + "lang=" + this.SCtranslateTo ;
        var nbspstr = "";
       var i;
       var SClanguagestrlength = this.SCGetGoogleLanguage(this.SCtranslateTo).length + 10;
       if(SClanguagestrlength < this.SCSourcestrlength)
          SClanguagestrlength = this.SCSourcestrlength+10;
 
       if(response.code == 200)
       for(i=response.text[0].length;i<SClanguagestrlength;i++)
       {  
            nbspstr+="&nbsp;";
       }
       
 
       var pretranslatedword = "";
       var numofwords = this.SClinkword.split(/\s/).length;
 
        if(response.code == 200)
          {
 
              this.SCTranslatedFromLanguage="ru";  
if(this.SCdoRomanisation && !this.SCIsRomanAlphabetLanguage(this.SCTranslatedFromLanguage))
	          this.SCimportScriptURI(this.SCRomanisationUrl+"?label="+this.SClabel+"&lang="+this.SCTranslatedFromLanguage+"&words="+encodeURIComponent(this.SClinkword));
if(this.SCdoRomanisation && !this.SCIsRomanAlphabetLanguage(this.SCtranslateTo))
			  this.SCimportScriptURI(this.SCRomanisationUrl+"?label="+this.SClabel+"&lang="+this.SCtranslateTo+"&words="+encodeURIComponent(this.SCtext));
	       }   
 
 
 
       if(numofwords == 1)
           pretranslatedword = this.SClinkword + ": ";
 
   //    var insertstring = SClabel + '|' + SCtext + '|' +
        var insertstring = this.SClanguageprompt1 + '-> ' + this.SCGetGoogleLanguage(this.SCtranslateTo) + this.SClanguageprompt2 + this.SCgooglereference2 + this.SClabel + this.SCgooglereference3;
//	var respDiv = $( '<div class="SCxText"></div>' );
	var respText = ((response.code==200) ? (pretranslatedword + 
 '<span id="y'+this.SClabel+'">' +
response.text[0]) + '</span>' : response.code);
//	respDiv.text( respText );
        var respDiv = '<div class="SCxText">' + respText + '</div>';
//	insertstring += respDiv.wrap('<div></div>')[0].outerHTML;
        insertstring += respDiv;
        insertstring += '<div><br>' + this.SCgooglereference4 + this.SCgooglereference1 + this.SCgoogletranslate + this.SCgooglereference1a + ((numofwords > 1) ? this.SCnextsentencestr : "") + 
this.SCSelectstr +
'</div>';
 
             this.SCInsertTranslation(this.SClabel,this.SCtext,insertstring);
 
};







/*
      GT.newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      GT.sourceText = escape(document.getElementById("sourceText").innerHTML);
      GT.source = 'https://www.googleapis.com/language/translate/v2?key=INSERT-YOUR-KEY&source=en&target=de&callback=translateText&q=' + sourceText;
      newScript.src = source;
*/
GT.SCtextDetect="";

GT.SCDetectedText = function(response)
{
  
  
 
  if(response.error)
   alert(response.error.message);
  else 
   if(response.data && response.data.translations)
   {
     this.SCTranslatedFromLanguage=response.data.translations[0].detectedSourceLanguage;
     this.SCTTS(this.SCtextDetect,"en");
     
   }
};

GT.SCTranslatedText = function(response) {

 //console.log(response);
//            if (result.translation||result.error)
       if(response.error && this.SCtranslateFrom!=this.SCTranslatedFromLanguage )
       {
           this.SCGoogleDetectV2(this.SCtext);
           if(this.SCtranslateFrom != this.SCTranslatedFromLanguage)
           {
             this.SCtranslateFrom = this.SCTranslatedFromLanguage;
             this.SCgoogleLookup(this.SCtext,this.SClabel); 
           }
           return;
       }
       else if(response.error)
          return;
       { 
       var nbspstr = "";
       var i;
       var SClanguagestrlength = this.SCGetGoogleLanguage(this.SCtranslateTo).length + 10;
       if(SClanguagestrlength < this.SCSourcestrlength)
          SClanguagestrlength = this.SCSourcestrlength+10;
  //     if(result.translation)
       {
 
       for(i=response.data.translations[0].translatedText.length;i<SClanguagestrlength;i++)
       {  
            nbspstr+="&nbsp;";
       }
       }
 
       var pretranslatedword = "";
       var numofwords = this.SClinkword.split(/\s/).length;
 
        if(response.data && response.data.translations && 1==0)
          {
 /*
              SCTranslatedFromLanguage=response.data.translations[0].detectedSourceLanguage;  
if(SCdoRomanisation && !SCIsRomanAlphabetLanguage(SCTranslatedFromLanguage))
	          SCimportScriptURI(SCRomanisationUrl+"?label="+SClabel+"&lang="+SCTranslatedFromLanguage+"&words="+encodeURIComponent(SClinkword));
if(SCdoRomanisation && !SCIsRomanAlphabetLanguage(SCtranslateTo))
			  SCimportScriptURI(SCRomanisationUrl+"?label="+SClabel+"&lang="+SCtranslateTo+"&words="+encodeURIComponent(SCtext));
*/
	       }   
 
 
 
       if(numofwords == 1)
           pretranslatedword = this.SClinkword + ": ";
 
   //    var insertstring = SClabel + '|' + SCtext + '|' +
        var insertstring = this.SClanguageprompt1 + '-> ' + this.SCGetGoogleLanguage(this.SCtranslateTo) + this.SClanguageprompt2 + this.SCgooglereference2 + this.SClabel + this.SCgooglereference3;
//	var respDiv = $( '<div class="SCxText"></div>' );
	var respText = ((response.data) ? (pretranslatedword + 
 '<span id="y'+this.SClabel+'">' +
response.data.translations[0].translatedText) + '</span>' : response.error.message);
//	respDiv.text( respText );
        var respDiv = '<div class="SCxText">' + respText + '</div>';
//	insertstring += respDiv.wrap('<div></div>')[0].outerHTML;
        insertstring += respDiv;
        insertstring += '<div><br>' + this.SCgooglereference4 + this.SCgooglereference1 + this.SCgoogletranslate + this.SCgooglereference1a + ((numofwords > 1) ? this.SCnextsentencestr : "") + 
this.SCSelectstr +
'</div>';
 
             this.SCInsertTranslation(this.SClabel,this.SCtext,insertstring);
 
       }
 
}; 





GT.SCTranslatedFromLanguage="";





GT.SCGetGoogleLanguage = function(lcode)
{
  var l;
  var i;
  for (i=0;i<this.SCGoogleLanguageCodes.length;i++)
  {
     l = this.SCGoogleLanguageNames[i];
     if(lcode == this.SCGoogleLanguageCodes[i])
       return (l.substring(0,1).toUpperCase() + l.substring(1).toLowerCase()); 
  }
  return "undefined";
};




GT.SCaddOnloadHook = function()
{
    
        this.SCcreateEvents();
    
};

GT.SCbSetLanguagesDone = false;

GT.SCsetLanguages = function()
{
//alert("scsetlanguages");
if(typeof this.SCbGoogleLanguageLoaded != "undefined" &&
   this.SCbGoogleLanguageLoaded &&
   typeof this.SCbDictionarylookup12Loaded != "undefined" &&
   this.SCbDictionarylookup12Loaded)

{
//alert("to scmakegooglelanguages");
//SCMakeGoogleLanguages();

//google.language.getBranding('SCTranslationPopups');
this.SCbSetLanguagesDone = true;


//SConloadtranslationpopups();
this.SCcreateEvents();
this.SCTextSettings();


if(!document.getElementById("SClanguageFrom")&&
   !document.getElementById("SClanguageTo"))
  return;


try{
 this.SCMakeGoogleLanguagesOptions(document.getElementById("SClanguageFrom"));

 this.SCMakeGoogleLanguagesOptions(document.getElementById("SClanguageTo"));

}
catch(err)
{
//  alert("unable to set SCnewoptions!");
}


this.SCsetLanguageDefault('SClanguageFrom','languageFrom');

this.SCsetLanguageDefault('SClanguageTo','languageTo');

this.SCsetLanguageDefault('wikipediagoto','wikipediagoto');

}
else
{
//   alert("timeout: SCsetLanguages()");
   setTimeout(this.SCsetLanguages,1000);
}
};
GT.SCMakeGoogleLanguagesOptions = function(obj)
{
 
 var l,lcode;
 var i=0,j=0;
 for(j=0;j<this.SCGoogleLanguageCodes.length;j++)
   {
      lcode = this.SCGoogleLanguageCodes[j];
      l = this.SCGoogleLanguageNames[j];

      if(lcode==="")
          continue;
      	GT.newoption = new Option(l,lcode);
        obj.options[i] = newoption;
        i++;
   }
};

// input and textarea processing
GT.SCgoogleDetectText = "";
GT.SCgoogleDetectLang = "";
GT.SCgoogleDetect = function(text,label)
{
// alert("SCgoogleDetect000");
  this.SCgoogleDetectText = text;
//  alert("SCgoogleDetect00");
  google.language.detect(text, function(result) {
  var tolanguage = this.SCtranslateTo;
//  alert("SCgoogleDetect0");

  if (!result.error) {

    
    if(result.language == this.SCtranslateTo)
         tolanguage = this.SCtranslateFrom;
  	this.SCgoogleLookupA(text,label,tolanguage,result.language);
  }
  else
  {
//alert(result.error.message);
    this.SCgoogleLookupA(text,label,this.SCtranslateTo,this.SCtranslateFrom);
    
  }

});
};

GT.SCgoogletranslate="";
GT.SCtransliteratelanguages = new Array('hi','ar','en');
GT.SCIsTransliteratable = function(fromlanguage,tolanguage)
{
  var i;
  var bIstransliteratable = false;
  if(fromlanguage != "en" && tolanguage != "en")
     return false;
  for(i=0;i<this.SCtransliteratelanguages.length;i++)
  {
    if(this.SCtransliteratelanguages[i]==fromlanguage)
    {
      bIstransliteratable = true;
      break;
    }
  }
  if(!bIstransliteratable)
     return false;
  bIstransliteratable = false;
  for(i=0;i<this.SCtransliteratelanguages.length;i++)
  {
    if(this.SCtransliteratelanguages[i]==tolanguage)
    {
      bIstransliteratable = true;
      break;
    }
  }
  return bIstransliteratable;

};

GT.SCgoogleLookupA = function(text,label,tolanguage,fromlanguage) 
{
      this.SClabel = label;
      this.SCtext = text;

   if(typeof this.SCbaseurl != "undefined")
    {
    this.SCgoogletranslate =
      "http://translate.google.com/translate?hl=en" + "&tl=" + this.SCtranslateTo +"&u=" +
          encodeURIComponent(this.SCbaseurl + "?" + this.SCbaseparamlist);
    }
    else
    {
   this.SCgoogletranslate =
       "http://translate.google.com/translate?hl=en" + "&tl=" + this.SCtranslateTo +"&u=" +
          encodeURIComponent(document.location.href);
    }

   
          google.language.translate(text, "", tolanguage, 
            function(result) {  

           if(result.error && this.SCIsTransliteratable(this.SCtranslateTo,this.SCtranslateFrom && 1==0))
             return this.SCgoogletransliterate(text,label,tolanguage,fromlanguage);

       var SClanguagestrlength = this.SCGetGoogleLanguage(this.SCtranslateTo).length + 10;



            
            if (result.translation||result.error) 
       { 
       var nbspstr = "";
       var i;
       var textareastring = "";
       if(this.SCtextareatext !== "" && 
          (this.SCtextareaelement.nodeName == "TEXTAREA" ||
           this.SCtextareaelement.nodeName == "INPUT")
          )
       {
         textareastring = "<br>" + this.SCreplacestuff + "<br>";
       }
       if(SClanguagestrlength < this.SCSourcestrlength)
          SClanguagestrlength = this.SCSourcestrlength+10;
       
       for(i=result.translation.length;i<SClanguagestrlength;i++)
       {  
            nbspstr+="&nbsp;";
       }
       

       var pretranslatedword = "";
       if(this.SClinkword.split(/\s/).length == 1)
           pretranslatedword = this.SClinkword + ": ";

       var insertstring = this.SClabel + '|' + this.SCtext + '|' +
      this.SClanguageprompt1 +  
      this.SCGetGoogleLanguage(fromlanguage) + ':' + this.SCGetGoogleLanguage(tolanguage) + 
      this.SClanguageprompt2 + 
 this.SCgooglereference2 +
      this.SClabel + this.SCgooglereference3 + 

      textareastring +

      '<div class="SCxText">' +
      ((result.translation)?
            (pretranslatedword + result.translation)
            :result.error.message) + nbspstr +'</div>' +
      '<div><br>' +
      this.SCgooglereference4 + 
      this.SCgooglereference1 + 
      this.SCgoogletranslate +
      this.SCgooglereference1a
      + '</div>'
      ;

      this.SCtranslateFrom = fromlanguage;
      this.SCPersistantSave('languageFrom',this.SCtranslateFrom);
      

              if(this.SCtextareatext!== "")
                  this.SCtextareareplacetext = result.translation;
              else this.SCtextareareplacetext = "";

              this.SCInsertTranslation(insertstring); 
             }
      
          }); 
    
} ;
GT.SCgoogletransliterate = function(text,label,tolanguage,fromlanguage)
{

var thelist = text.split(/\s/);
google.language.transliterate(thelist, fromlanguage, tolanguage, function(result) {
  var texta = "";
  if (!result.error) {
    
    if (result.transliterations && result.transliterations.length > 0) {
      var i,j;
      for(i=0;i<result.transliterations.length;i++)
      {
         if(result.transliterations[i].transliteratedWords[0].length > 0)
	 texta +=result.transliterations[i].transliteratedWords[0] + " ";
         
      }
      
    }

  }
              if (texta||result.error) 
       { 
       var textareastring = "";
       if(this.SCtextareatext !== "" && 
          (this.SCtextareaelement.nodeName == "TEXTAREA" ||
           this.SCtextareaelement.nodeName == "INPUT")
          )
       {
         textareastring = this.SCreplacestuff + "<br>";
       }
       
       var insertstring = this.SClabel + '|' + this.SCtext + '|' +
      this.SClanguageprompt1 + fromlanguage + ':' + tolanguage + this.SClanguageprompt2 + 
      this.SCgooglereference1 + 
      this.SCgoogletranslate +
      this.SCgooglereference1a + this.SClabel + this.SCgooglereference2 + 
      textareastring +
      ((texta !== "")?texta:result.error.message) + "</div>";
      

              if(this.SCtextareatext!= "")
                  this.SCtextareareplacetext = texta;
              else this.SCtextareareplacetext = "";

              this.SCInsertTranslation(insertstring); 
             }
      

});
};



GT.SCasyncGetTextArea = function(id,word)
{
   var languagepath = "en|fr";
   // consult SCtranslate for language translation
   if(typeof this.SCtranslateFrom != "undefined"
      && typeof this.SCtranslateTo != "undefined"
     )
   {
       languagepath = this.SCtranslateFrom + "|" + 
                      this.SCtranslateTo;
   }
   
   var persistantlanguagepathFrom = this.SCPersistantLoad('languageFrom');
   var persistantlanguagepathTo = this.SCPersistantLoad('languageTo');

   

   if(persistantlanguagepathFrom !== "" &&
      persistantlanguagepathTo !== "")
        languagepath = persistantlanguagepathFrom + 
             "|" + persistantlanguagepathTo;
   if(languagepath=="Wikipedia")
        languagepath = "en|fr";

//   if(languagepath == "Wikipedia")
//   {
//   }
//   else
   {
     // google limits to 500 characters of translation
     if(word.length > this.SCMaxWordLength)
        word = word.substring(0,this.SCMaxWordLength);
     var bIsSelectedText = "NO";
     if(this.SCbIsWordInSelection)
         bIsSelectedText = "YES";
     
     word = word.replace(/\'/g,"\u0026#39;");
     word = word.replace(/\"/g,"\u0026quot;");
     

     this.SCgoogleDetect(word,id);
   }
};


    

GT.SCiTokenMatches=0;

GT.SCconsecutiveoneletterwords=0;
GT.SCbKaraokeIncrement=false;



GT.SCbDictionarylookup12Loaded = true;
GT.SCbGoogleLanguageLoaded = true;

GT.initialize = function() {
if(typeof this.SCbIsProxy == "undefined")
  SCbIsProxy = false;
if(typeof this.SCbIsProxy1 == "undefined")
  SCbIsProxy1 = false;
  
  
var userLang = mw.config.get( 'wgUserLanguage' );
var contentLang = mw.config.get( 'wgContentLanguage' );

if(userLang != contentLang) {
    GT.SCLanguageDefaultTo = userLang;
}

// Beware Uncaught DOMException: Failed to set the 'domain' property on 'Document': 'en.wikipedia.org' is not a suffix of 'en.m.wikipedia.org'.
if ( window.location.host.indexOf('.m.') === -1 ) {
    // need to set document.domain here, each language should set this field her
    document.domain = mw.config.get('wgServerName' );
} else {
    // on mobile domain. Avoid
    return;
}

if(navigator.appVersion.match(/MSIE/i))
{
  this.SCbIsIE = true;
  if(navigator.userAgent.indexOf('MSIE 8') != -1)
     this.SCbIsIE8 = true;

  this.SCbIsIE = false;
  this.SCbIsIE8 = false;
  
}

if(navigator.appVersion.match(/rv:([0-9][0-9])\./i))
{
  var version1 = new Number(RegExp.$1);
  if(version1 >= 11)
{
  this.SCbIsFirefox35=false;
  this.SCbIsSafari=false;
  this.SCbIsChrome=false;
  this.SCbIsOperal11=false;
  this.SCbIsIE9 = true;
  this.SCbIsIE = false;
  this.SCbIsFirefox35Like=true;
  this.SCbIsMozilla = true;
  this.SCbIsIE11 = true;

  this.SCbIsIE11 = false;
}
}
if(navigator.userAgent.match(/Edge/i))
{
  this.SCbIsEdge = true;
  this.SCbIsIE9 = true;
  this.SCbIsIE9 = false;
}

if(this.SCbIsProxy||this.SCbIsProxy1)
{
   this.SCGoogleTrans = true;
   this.SCPersistantSave('GoogleTrans','1');
}
else if(this.SCPersistantLoad('GoogleTrans') == '1'||
        this.SCPersistantLoad('GoogleTrans') === true)
   this.SCGoogleTrans = true;


this.SCCreateSCitem();
if(this.SCGoogleTrans)
{
   //SChookEvent("load",SConloadscitem);
   this.SConloadscitem();
 //  SCTextSettings();
}

if(this.SCbIsProxy)
   this.SCGoogleTrans = true;
else
if(this.SCPersistantLoad("GoogleTrans") == "1")
   this.GSCGoogleTrans = true;
else this.SCGoogleTrans = false;



if(navigator.appVersion.match(/MSIE/i))
{
  this.SCbIsIE = true;

  this.SCbIsIE = false;

  if(navigator.userAgent.indexOf('MSIE 8') != -1)
     this.SCbIsIE8 = true;
  if(navigator.userAgent.indexOf('MSIE 6') != -1)
     this.SCbIsIE6 = true;

   this.SCbIsIE8 = false;
   this.SCbIsIE6 = false;

  if(navigator.userAgent.match(/MSIE ([0-9]+)/))
  {
     var version1 = new Number(RegExp.$1);
     if(version1 >= 8)
       this.SCbIsIE8 = true;
     if(version1 >= 9)
       this.SCbIsIE9 = true;

     this.SCbIsIE8 = false;
     this.SCbIsIE9 = true;
  }
  
}

if(navigator.appVersion.match(/Safari/i))
{
  this.SCbIsSafari = true;
if(navigator.userAgent.indexOf('Version/3.')!= -1 ||
   navigator.userAgent.indexOf('Version/2.')!= -1
  )
{
     this.SCbIsPre4Safari = true;
     this.SCbNoShiftKeyBrowser = true; 
}

}

if(navigator.userAgent.indexOf('Epiphany/1.')!= -1 ||
   navigator.userAgent.indexOf('Firefox/1.') != -1
  )
  this.SCbNoShiftKeyBrowser = true;
if(navigator.userAgent.indexOf('Firefox/3.5') != -1 || navigator.userAgent.indexOf('Firefox/3.6') != -1
)
  this.SCbIsFirefox35 = true;
if(navigator.userAgent.match(/Firefox\/([0-9]+)\.([0-9]+)/))
{
     var version1 = new Number(RegExp.$1);
     var version2 = new Number(RegExp.$2);
     if(version1 >= 3 && version2 >= 5)
         this.SCbIsFirefox35 = true;
     if(version1 >= 4)
         this.SCbIsFirefox35 = true;
}



if(navigator.appVersion.match(/Chrome/i))
{
  this.SCbIsSafari = false;
  this.SCbIsChrome = true;
}


if(navigator.appVersion.match(/Konqueror/i))
{
  this.SCbIsKonqueror = true;
}
if(navigator.appName.match(/Opera/i))
{
  this.SCbIsOpera = true;
// check for opera 11+
if(navigator.userAgent.match(/Version\/([0-9]+)\.([0-9]+)/))
{
     var version1 = new Number(RegExp.$1);
     var version2 = new Number(RegExp.$2);
   //  if(version1 >= 11)
   //      SCbIsOpera11 = true;
       this.SCbIsOpera11 = false;
}

}
if(navigator.appName.match(/Netscape/i))
{
  this.SCbIsMozilla = true;
}

this.SCbIsIE11 = false;
if(navigator.appVersion.match(/rv:([0-9][0-9])\./i))
{
  var version1 = new Number(RegExp.$1);
  if(version1 >= 11)
{
  this.SCbIsFirefox35=false;
  this.SCbIsSafari=false;
  this.SCbIsChrome=false;
  this.SCbIsOperal11=false;
  this.SCbIsIE9 = true;
  this.SCbIsIE = false;
  this.SCbIsFirefox35Like=true;
  this.SCbIsMozilla = true;
  this.SCbIsIE11 = true;

  this.SCbIsIE9 = true;
  this.SCbIsIE11 = true;
}
}


if(this.SCbIsFirefox35 || this.SCbIsSafari || this.SCbIsChrome||this.SCbIsOpera11)
  this.SCbIsFirefox35Like = true;

this.shiftkeyneeded = this.SCPersistantLoad('shiftkeyneeded');
if(this.shiftkeyneeded == "0")
   this.SCShiftKeyNeeded = false;
else this.SCShiftKeyNeeded = true;

if(this.SCbNoShiftKeyBrowser)
     this.SCShiftKeyNeeded = false;


this.SCpersistlangFrom = this.SCPersistantLoad('languageFrom');
if(this.SCpersistlangFrom != "")
   this.SCtranslateFrom = this.SCpersistlangFrom;

this.SCpersistlangTo = this.SCPersistantLoad('languageTo');
if(this.SCpersistlangTo !== "")
   this.SCtranslateTo = this.SCpersistlangTo;
   
this.SCwikilang = this.SCPersistantLoad('Wikipedialanguage');
if(this.SCwikilang !== "")
   this.SCWikipedialanguage = this.SCwikilang;
else this.SCPersistantSave('Wikipedialanguage',this.SCWikipedialanguage);

if(navigator.appVersion.match(/Trident.*rv[: ]([0-9][0-9])\./i))
{
  version1 = new Number(RegExp.$1);
  if(version1 >= 11)
{
  this.SCbIsFirefox35=false;
  this.SCbIsSafari=false;
  this.SCbIsChrome=false;
  this.SCbIsOperal11=false;
  this.SCbIsIE9 = true;
  this.SCbIsIE = false;
  this.SCbIsFirefox35Like=true;
  this.SCbIsMozilla = true;
  this.SCbIsIE11 = true;
  
  this.SCbIsIE11 = false;
}
}

if(typeof SCweblookup != "undefined")
  SCweblookup = "";

SCweblookup = this.SCPersistantLoad('weblookup');

this.SCScreenSize();



this.SCloadGoogleLanguage();

mw.util.addCSS(
 '.gBrandingText {background : white;   }'
);

mw.util.addCSS(

'#SCitem div small, #SCitem small,#SCitem div div small,#SCitem div div div small {font-size:65%;color:black}' +

'#SCitem div a:hover, #SCitem a:hover, #SCitem div div a:hover {text-decoration:underline;}' +

'.SCPopup {background-color:' + this.SCPopupBackgroundColor +';border: 1px solid blue;position:absolute;font-size:14pt;z-index:999999;' +'overflow:visible;line-height:normal;padding:.5em;display:block;}' +

'.SCxWindow {font-size:70%;color:black;' +
 'position:absolute;right:.5em;}'+
'.SCxWindowB {font-size:70%;color:black;' +
 'position:absolute;right:.5em;bottom:.5em}'+
'.SCyWindow{font-size:50%;color:black;position:absolute;right:.5em;'+
'bottom:.5em}' +
'.SCxTranslation {font-size:70%;color:black;' +
'position:absolute;left:.5em;top;.5em;}' +
'.SCxText {color:black;}'+
'.SCyWikipedia{font-size:70%;position:relative;float:left;}'+
'.SCyWikipediaA{font-size:70%;position:relative;float:left;text-decoration:underline}'+

'.SCPopupIE {position:absolute;background-color: ' +
 this.SCPopupBackgroundColor +
';border: 1px solid blue;font-size:14pt;z-index:999999; ' +
'overflow:visible;display:block;line-height:normal;padding:.5em;width:auto;}' +
'.SCPopupIEA {position:absolute;background-color: ' +
 this.SCPopupBackgroundColor +
';border: 1px solid blue;font-size:14pt;z-index:999998; ' +
'overflow:visible;display:block;line-height:normal;padding:.5em;width:auto;}'

+
'.SChidestuff {display:none;}'

);

if(this.SCPersistantLoad("YandexTranslationEngine") == "1")
   this.SCbYandexTranslation = true;
else if(this.SCPersistantLoad("YandexTranslationEngine") == "0") this.SCbYandexTranslation = false;

if(this.SCPersistantLoad("DoubleClickTranslation") == "1")
   this.SCbDoubleClickTranslation = true;
else this.SCbDoubleClickTranslation = false;


GT.SCgooglereference1a =
'\')">' +((this.SCbYandexTranslation)?this.SCstrYandexCredit: this.SCstrGoogle) + '</a></small> ';

setInterval("GT.SCinterval()",1000);


this.SCbIsIE = false;  // we are running at a standards browser app now, therefore no special ie code
};




$(
    function () {
        var bPops = GT.SCPersistantLoad(GT.SCGoogleTransPersistString);
        
        var title = GT.SCstrGoogleTrans;
        if(bPops == "1" || bPops === "")
        {
           GT.SCGoogleTrans = true;
           title += GT.SCstrOn;
           if(bPops === "")
              GT.SCPersistantSave(GT.SCGoogleTransPersistString,'1');
        }
        else
        {
           GT.SCGoogleTrans = false;
           title += GT.SCstrOff;
        }
    //    SCMakeGoogleLanguages();
        GT.initialize();
        mw.util.addPortletLink('p-cactions',"javascript:GT.SCSettings()", title, "ca-TransPopsId", GT.SCstrChangeOptions, "");
    }
);

GT.SCSelectTranslation = function()
{

 if(!(this.SCbIsFirefox35Like||this.SCbIsIE9))
  
    return;

if (window.getSelection) 
{
   this.SCSelectionInPopup = false;
   try {
	var userSelection = window.getSelection();
        this.SCSelectionInPopupSaved = false;
        if(userSelection.toString().length > 0)
        {
        this.SCanchorNode = userSelection.anchorNode;
        this.SCanchorOffset = userSelection.anchorOffset;
        this.SCfocusNode = userSelection.focusNode;
        this.SCfocusOffset = userSelection.focusOffset;
        this.SCSelectionInPopupSaved = true;
        }
     } catch(err) { }
}
var obj1 = document.getElementById('y'+this.SClabel);
if(obj1)
{
 try {
   var range = document.createRange();
   range.setStart(obj1, 0);
  
   range.setEnd(obj1.parentNode.nextSibling,0); 
        
   var selection = window.getSelection();
   selection.removeAllRanges();
   selection.addRange(range);
   this.SCSelectionInPopup = true;
   } catch(err){ }
}
};

GT.SCtranslationenginechange=function(obj)
{
 var teoptions = 
 obj.options[
     obj.selectedIndex
     ].value;
 
if(teoptions.match(/Yandex/i))
{
  this.SCPersistantSave('YandexTranslationEngine','1');
  this.SCbYandexTranslation = true;
 
}
if(teoptions.match(/Google/i))
{
  this.SCPersistantSave('YandexTranslationEngine','0');
  this.SCbYandexTranslation = false;
  
}
// remake this string so that credit is properly applied in popup

GT.SCgooglereference1a =
'\')">' +((this.SCbYandexTranslation)?this.SCstrYandexCredit: this.SCstrGoogle) + '</a></small> ';

};
