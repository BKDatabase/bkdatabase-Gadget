mw.loader.using('mediawiki.util').then(function () {

  // i18n source
  const i18nSource = {
    vi: {
      title: "Thông báo SVG",
      text: "Tập tin này là SVG. Nếu nó không hiển thị đúng, hãy chuyển sang PNG bằng",
      linkText: "ezgif.com/svg-to-png",
      text2: "hoặc các công cụ chuyển đổi khác."
    },
    en: {
      title: "SVG Notice",
      text: "This file is an SVG. If it does not display correctly, convert it to PNG using",
      linkText: "ezgif.com/svg-to-png",
      text2: "or other conversion tools."
    },
    es: {
      title: "Aviso de SVG",
      text: "Este archivo es un SVG. Si no se muestra correctamente, conviértelo a PNG usando",
      linkText: "ezgif.com/svg-to-png",
      text2: "u otras herramientas de conversión."
    },
    de: {
      title: "SVG-Hinweis",
      text: "Diese Datei ist eine SVG-Datei. Wenn sie nicht korrekt angezeigt wird, konvertieren Sie sie in PNG mit",
      linkText: "ezgif.com/svg-to-png",
      text2: "oder andere Konvertierungstools."
    },
    fr: {
      title: "Notification SVG",
      text: "Ce fichier est un SVG. S’il ne s’affiche pas correctement, convertissez-le en PNG avec",
      linkText: "ezgif.com/svg-to-png",
      text2: "ou d'autres outils de conversion."
    },
    ru: {
      title: "Уведомление SVG",
      text: "Этот файл является SVG. Если он отображается неправильно, преобразуйте его в PNG с помощью",
      linkText: "ezgif.com/svg-to-png",
      text2: "или другие инструменты преобразования."
    },
    zh: { 
      title: "SVG 提示",
      text: "此文件为 SVG。如果无法正确显示，请使用以下工具转换为 PNG：",
      linkText: "ezgif.com/svg-to-png",
      text2: "或其他转换工具。"
    },
    'zh-tw': { 
      title: "SVG 提示",
      text: "此檔案為 SVG。如果無法正確顯示，請使用以下工具轉換為 PNG：",
      linkText: "ezgif.com/svg-to-png",
      text2: "或其他轉換工具。"
    },
    yue: { 
      title: "SVG 提示",
      text: "呢個檔案係 SVG。如果無法正常顯示，可以用以下工具轉換成 PNG：",
      linkText: "ezgif.com/svg-to-png",
      text2: "或者其他轉換工具。"
    },
    pl: {
      title: "Powiadomienie SVG",
      text: "Ten plik jest w formacie SVG. Jeśli nie wyświetla się poprawnie, przekonwertuj go do PNG za pomocą",
      linkText: "ezgif.com/svg-to-png",
      text2: "lub inne narzędzia konwersji."
    },
    ja: {
      title: "SVGのお知らせ",
      text: "このファイルはSVGです。正しく表示されない場合は、PNGに変換してください：",
      linkText: "ezgif.com/svg-to-png",
      text2: "またはその他の変換ツール。"
    }
  };

  // lấy ngôn ngữ người dùng
  var lang = mw.config.get('wgUserLanguage') || 'en';
  if (!i18nSource[lang]) lang = 'en';

  var msg = i18nSource[lang];

  if (mw.config.get('wgNamespaceNumber') === 6) {
    var fileName = mw.config.get('wgTitle');

    if (fileName && fileName.toLowerCase().endsWith('.svg')) {
      mw.hook('wikipage.content').add(function () {

        var notice = document.createElement('div');
        notice.style.cssText =
          'border:1px solid #4DB6B0; background:#061016; color:#4DB6B0; padding:8px; margin:4px 0; font-size:95%;';

        notice.innerHTML =
          "<strong>" + msg.title + "</strong><br>" +
          msg.text + " " +
          '<a href="https://ezgif.com/svg-to-png" target="_blank";">' +
          msg.linkText +
          '</a>, ' + msg.text2;

        var content = document.getElementById('mw-content-text');
        if (content) content.insertBefore(notice, content.firstChild);

      });
    }
  }
});
