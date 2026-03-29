// Biểu tượng khóa trang ở cạnh tên bài (phái sinh từ Minecraft Wiki và Lớp học Mật Ngữ wiki)
;(function ($, mw) {
    'use strict';

    const i18n = {
        protectionLevelDescriptions: {
        	'user': 'Chỉ thành viên đã đăng ký tài khoản tại dự án này mới có thể sửa đổi.',
            'autoconfirmed': 'Chỉ thành viên đã được tự động xác nhận mới có thể sửa đổi.',
            'sysop': 'Trang này đã bị khóa và chỉ bảo quản viên mới có thể sửa đổi.',
            'interface': 'Trang này mặc nhiên bị khóa hẳn vì nó cung cấp mã nền tảng cho dự án.'
        },
        moveProtectionLevelDescriptions: {
            'sysop': 'Trang này đã bị khóa và chỉ bảo quản viên mới có thể di chuyển.'
        },
        uploadProtectionLevelDescriptions: {
            'sysop': 'Tập tin này đã bị khóa và chỉ bảo quản viên mới có thể ghi đè tập tin này.'
        },
        protectionLevelLinks: {
        	'user': 'BKDatabase:Quy định khóa trang#Khóa thành viên đăng nhập',
            'autoconfirmed': 'BKDatabase:Quy định khóa trang#Khóa tự động xác nhận',
            'sysop': 'BKDatabase:Quy định khóa trang#Khóa bảo quản viên',
            'interface': 'BKDatabase:Quy định khóa trang#Khóa hệ thống'
        }
    };

    const config = mw.config.get([
        'wgRestrictionEdit',
        'wgRestrictionMove',
        'wgRestrictionCreate',
        'wgNamespaceNumber',
        'wgIsMainPage',
        'wgAction'
    ]);
    const editProtectionLevelData = config.wgRestrictionEdit;
    const moveProtectionLevelData = config.wgRestrictionMove;
    const createProtectionLevelData = config.wgRestrictionCreate;
    if (
        // Dừng ở trang Đặc biệt, về căn bản là để tránh crash
        (!editProtectionLevelData && !createProtectionLevelData) || config.wgIsMainPage ||
        // Đang xem lịch sử hoặc sửa bài thì không cần hiện nữa
        config.wgAction !== 'view' ||
        // Không hiển thị indicator ở các không gian tên sau, vì đã có [[Module:Documentation]] và [[Module:Protection banner]] hỗ trợ rồi
        config.wgNamespaceNumber === 10 || // Không gian tên bản mẫu
        config.wgNamespaceNumber === 828 // Không gian tên Mô đun
    )  {
        return;
    }

    function getCommonsImageURL(filename, callback) {
        $.getJSON(mw.util.wikiScript('api'), {
            action: 'query',
            titles: 'File:' + filename,
            prop: 'imageinfo',
            iiprop: 'url',
            format: 'json'
        }, function (data) {
            const pages = data.query.pages;
            const page = Object.values(pages)[0];
            if (page && page.imageinfo && page.imageinfo[0].url) {
                callback(page.imageinfo[0].url);
            } else {
                console.warn('Không tìm thấy ảnh từ Commons:', filename);
                callback(null);
            }
        });
    }

    function mimicIndicator(id, link, imgName, title) {
        const encodedLink = mw.util.getUrl(link);
        getCommonsImageURL(imgName, function (url) {
            if (!url) return;
            const $indicator = $('<div class="mw-indicator">')
                .attr('id', 'mw-indicator-' + id)
                .append(
                    $('<div class="mw-parser-output">').append(
                        $('<span typeof="mw:File">').append(
                            $('<a>').attr({
                                'href': encodedLink,
                                'title': title
                            }).append(
                                $('<img>').attr({
                                    'alt': title,
                                    'src': url,
                                    'width': '20',
                                    'height': '20'
                                })
                            )
                        )
                    )
                );
            $('.mw-indicators').append($indicator);
        });
    }

    const editProtectionLevel = editProtectionLevelData ? editProtectionLevelData[0] : null;
    const moveProtectionLevel = moveProtectionLevelData ? moveProtectionLevelData[0] : null;
    const createProtectionLevel = createProtectionLevelData ? createProtectionLevelData[0] : null;
    if (config.wgNamespaceNumber === 6 && (editProtectionLevel === 'sysop' || createProtectionLevel === 'sysop')) {
        mimicIndicator(
            'protection-full-upload',
            i18n.protectionLevelLinks.sysop,
            'Upload-protection-shackle.svg',
            i18n.uploadProtectionLevelDescriptions.sysop
        );
    } else if (editProtectionLevel === 'user' || createProtectionLevel === 'user') {
        mimicIndicator(
            'protection-user',
            i18n.protectionLevelLinks.user,
            'Semi-protection-shackle-keyhole.svg',
            i18n.protectionLevelDescriptions.user
        );
    }
    else if (editProtectionLevel === 'autoconfirmed' || createProtectionLevel === 'autoconfirmed') {
        mimicIndicator(
            'protection-semi',
            i18n.protectionLevelLinks.autoconfirmed,
            'Semi-protection-shackle.svg',
            i18n.protectionLevelDescriptions.autoconfirmed
        );
    } else if (editProtectionLevel === 'sysop' || createProtectionLevel === 'sysop') {
        mimicIndicator(
            'protection-full',
            i18n.protectionLevelLinks.sysop,
            'Full-protection-shackle.svg',
            i18n.protectionLevelDescriptions.sysop
        );
    } else if (moveProtectionLevel) {
        mimicIndicator(
            'protection-move',
            i18n.protectionLevelLinks[moveProtectionLevel],
            'Move-protection-shackle.svg',
            i18n.moveProtectionLevelDescriptions[moveProtectionLevel]
        );
    } else if (config.wgNamespaceNumber === 8) {
        mimicIndicator(
            'protection-interface',
            i18n.protectionLevelLinks.interface,
            'Interface-protection-shackle-corrected-color.svg',
            i18n.protectionLevelDescriptions.interface
        );
    }
})(window.jQuery, window.mediaWiki);
