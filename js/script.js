    'use strict';

    const typeConfig = {
        'xml-ads': {
            value: 'xml-ads',
            label: 'Xml объявления',
            type: 'xml',
            fileExt: 'xml',
            entity: 'объявлений',
            entityIn: 'объявлений',
            pathLabel: 'Укажите путь к файлу xml',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ ОБЪЯВЛЕНИЙ',
            tableTitle: 'Xml объявления'
        },
        'xml-links': {
            value: 'xml-links',
            label: 'Xml ссылки',
            type: 'xml',
            fileExt: 'xml',
            entity: 'ссылок',
            entityIn: 'ссылок',
            pathLabel: 'Укажите путь к файлу xml',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ ССЫЛОК',
            tableTitle: 'Xml ссылки'
        },
        'xlsx-phones': {
            value: 'xlsx-phones',
            label: 'Xlsx телефоны',
            type: 'xlsx',
            fileExt: 'xlsx',
            entity: 'резюме',
            entityIn: 'резюме',
            pathLabel: 'Укажите путь к файлу xlsx телефоны',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ РЕЗЮМЕ',
            tableTitle: 'Xlsx телефоны'
        },
        'xlsx-sites': {
            value: 'xlsx-sites',
            label: 'Xlsx сайты',
            type: 'xlsx',
            fileExt: 'xlsx',
            entity: 'сайтов',
            entityIn: 'сайтов',
            pathLabel: 'Укажите путь к файлу xlsx сайты',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ САЙТОВ',
            tableTitle: 'Xlsx сайты'
        },
        'xlsx-app': {
            value: 'xlsx-app',
            label: 'Xlsx наше приложение',
            type: 'xlsx',
            fileExt: 'xlsx',
            entity: 'записей',
            entityIn: 'записей',
            pathLabel: 'Укажите путь к файлу xlsx наше приложение',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ ЗАПИСЕЙ',
            tableTitle: 'Xlsx наше приложение'
        },
        'xlsx-links': {
            value: 'xlsx-links',
            label: 'Xlsx ссылки для объявлений',
            type: 'xlsx',
            fileExt: 'xlsx',
            entity: 'ссылок',
            entityIn: 'ссылок',
            pathLabel: 'Укажите путь к файлу xlsx ссылки для объявлений',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ ССЫЛОК',
            tableTitle: 'Xlsx ссылки для объявлений'
        },
        'docx-zarplata': {
            value: 'docx-zarplata',
            label: 'Docx zarplata.ru',
            type: 'docx',
            fileExt: 'docx',
            entity: 'резюме',
            entityIn: 'резюме',
            pathLabel: 'Укажите путь к файлу docx zarplata.ru',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ РЕЗЮМЕ',
            tableTitle: 'Docx zarplata.ru'
        },
        'docx-hh': {
            value: 'docx-hh',
            label: 'Docx hh.ru',
            type: 'docx',
            fileExt: 'docx',
            entity: 'резюме',
            entityIn: 'резюме',
            pathLabel: 'Укажите путь к файлу docx hh.ru',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ РЕЗЮМЕ',
            tableTitle: 'Docx hh.ru'
        },
        'docx-rabota': {
            value: 'docx-rabota',
            label: 'Docx rabota.ru',
            type: 'docx',
            fileExt: 'docx',
            entity: 'резюме',
            entityIn: 'резюме',
            pathLabel: 'Укажите путь к файлу docx rabota.ru',
            colLabel: 'КОЛИЧЕСТВО ДОБАВЛЕННЫХ РЕЗЮМЕ',
            tableTitle: 'Docx rabota.ru'
        }
    };

    const state = {
        selectedType: null,
        filePath: '',
        isFolder: false,
        pickedFileObject: null,
        pickedFolderFiles: [],
        pickedFolderName: '',
        importButtonDisabled: false,
        hasSourceError: false,
        sourceErrorMessage: '',
        logsByType: {},
        logTypeOrder: [],
        importAll: false,
        skipDuplicateCheck: false,
        currentPage: 1,
        itemsPerPage: 10
    };

    const INITIAL_TYPE_VALUE = 'xml-ads';
    const INITIAL_FILE_PATH = '';
    const PAPERCLIP_TOOLTIP_TEXT = 'Пропишите путь к файлу после этого, его название попадает в поле';
    const FILE_TYPE_MISMATCH_MESSAGE = 'Выбранный файл не соответствует типу импорта';
    const EMPTY_FOLDER_MESSAGE = 'В выбранной папке нет файлов нужного типа';
    const NO_REAL_SOURCE_MESSAGE = 'Ручной путь принят без чтения файла браузером';
    const MANUAL_PATH_REQUIRED_MESSAGE = 'Укажите путь к файлу или выберите файл через скрепку';
    const ORIGINAL_FILE_UNAVAILABLE_MESSAGE = 'Оригинальный файл недоступен: он не был выбран через браузер';
    const MANUAL_SOURCE_NOTE_TEXT = 'Источник указан вручную. Реальный файл не выбран через браузер, поэтому оригинальный файл недоступен для скачивания.';

    const IMPORT_TOAST_DURATION_MS = 5000;
    let _importToastTimer = null;
    function showImportToast(message, type) {
        if (!message) return;
        let container = document.getElementById('importToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'importToastContainer';
            container.className = 'import-toast-container';
            document.body.appendChild(container);
        }
        let toast = container.querySelector('.import-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'import-toast';
            toast.setAttribute('role', 'alert');
            container.appendChild(toast);
        }
        toast.classList.remove('import-toast--error', 'import-toast--success', 'import-toast--info');
        if (type === 'error') toast.classList.add('import-toast--error');
        else if (type === 'success') toast.classList.add('import-toast--success');
        else toast.classList.add('import-toast--info');
        renderImportToastText(toast, message);
        requestAnimationFrame(function () { toast.classList.add('is-visible'); });
        if (_importToastTimer) clearTimeout(_importToastTimer);
        _importToastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
            _importToastTimer = null;
        }, IMPORT_TOAST_DURATION_MS);
    }

    function markSourceError(message) {
        state.hasSourceError = true;
        state.sourceErrorMessage = message || '';
        setFilePathInvalid(true);
        disableImportButton();
        if (message) showImportToast(message, 'error');
    }

    function clearSourceError() {
        state.hasSourceError = false;
        state.sourceErrorMessage = '';
    }

    const FILE_ICON_CONFIG = {
        html: { tooltip: 'Скачать лог в разрешении html' },
        xml:  { tooltip: 'Скачать оригинальный файл xml' },
        xlsx: { tooltip: 'Скачать оригинальный файл xlsx' },
        docx: { tooltip: 'Скачать оригинальный файл docx' },
        zip:  { tooltip: 'Скачать несколько файлов в архиве zip' }
    };

    const MIME_TYPES = {
        html: 'text/html',
        xml:  'application/xml',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        zip:  'application/zip'
    };

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function getCurrentDatetime() {
        const now = new Date();
        const date = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        return { date, time, full: `${date}  ${time}` };
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const FORM_CONTROL_TEXT_Y = 22;
    const STATIC_TEXT_FAMILY = 'Roboto, Arial, sans-serif';
    const TEXT_RENDER_ENGINE = 'bitmap-mask-v1';
    const DESIGN_VIEWPORT_WIDTH = 1920;
    const MIN_PAGE_SCALE = 0.05;

    function getLayoutViewportWidth() {
        return document.documentElement.clientWidth || window.innerWidth || DESIGN_VIEWPORT_WIDTH;
    }

    function getCurrentPageScale() {
        const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'));
        return Number.isFinite(value) && value > 0 ? value : getLayoutViewportWidth() / DESIGN_VIEWPORT_WIDTH;
    }

    function getDevicePixelScale() {
        const deviceScale = Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0
            ? window.devicePixelRatio
            : 1;
        const visualScale = window.visualViewport && Number.isFinite(window.visualViewport.scale) && window.visualViewport.scale > 0
            ? window.visualViewport.scale
            : 1;
        return Math.max(1, deviceScale * visualScale);
    }

    const DEFAULT_DATE_FROM = '12.05.2023';

    const navIconConfig = {
        managers: {
            default: { code: 0xf105, family: 'vsevn-nav-icons' },
            hover: { code: 0xf106, family: 'vsevn-nav-icons' }
        },
        resume: {
            default: { code: 0xf103, family: 'vsevn-nav-icons' },
            hover: { code: 0xf104, family: 'vsevn-nav-icons' }
        },
        companies: {
            default: { code: 0xf10b, family: 'vsevn-nav-icons' },
            hover: { code: 0xf10c, family: 'vsevn-nav-icons' }
        },
        import: {
            default: { code: 0xf109, family: 'vsevn-nav-icons' },
            hover: { code: 0xf10a, family: 'vsevn-nav-icons' }
        },
        ads: {
            default: { code: 0xf10d, family: 'vsevn-nav-icons' },
            hover: { code: 0xf10e, family: 'vsevn-nav-icons' }
        },
        letters: {
            default: { code: 0xf107, family: 'vsevn-nav-icons' },
            hover: { code: 0xf108, family: 'vsevn-nav-icons' }
        },
        settings: {
            default: { code: 0xf101, family: 'vsevn-nav-icons' },
            hover: { code: 0xf102, family: 'vsevn-nav-icons' }
        }
    };

    const navTextWidths = {
        managers: 236,
        resume: 78,
        companies: 104,
        import: 72,
        ads: 138,
        letters: 145,
        settings: 180
    };

    const BITMAP_TEXT_OVERFLOW_PAD = 36;

    function getBitmapMaskPadding(options = {}) {
        const pad = options.maskOverflowPadding !== undefined
            ? Math.max(0, Number(options.maskOverflowPadding) || 0)
            : BITMAP_TEXT_OVERFLOW_PAD;
        const anchor = options.anchor || 'start';

        if (anchor === 'middle') {
            return { left: pad, right: pad };
        }
        if (anchor === 'end') {
            return { left: pad, right: 0 };
        }
        return { left: 0, right: pad };
    }

    function createSvgText(text, options = {}) {
        const width = options.width || 200;
        const height = options.height || 26;
        const fontSize = options.size || 21;
        const svg = document.createElementNS(svgNS, 'svg');
        const label = document.createElementNS(svgNS, 'text');

        svg.classList.add('svg-label');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
        svg.setAttribute('width', (width / 19.2).toFixed(5) + 'vw');
        svg.setAttribute('height', (height / 19.2).toFixed(5) + 'vw');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('text-rendering', 'geometricPrecision');
        svg.style.width = pxToVw(width);
        svg.style.height = pxToVw(height);
        svg.style.overflow = 'visible';
        svg.style.textRendering = 'geometricPrecision';
        svg.style.setProperty('font-size', '0px', 'important');
        svg.style.setProperty('line-height', '0px', 'important');

        if (options.useBitmapText !== false && shouldUseBitmapTextMasks()) {
            const maskPadding = getBitmapMaskPadding(options);
            const maskWidth = width + maskPadding.left + maskPadding.right;
            const maskX = -maskPadding.left;
            appendBitmapTextMask(svg, getTextMaskDataUrl(text, {
                text,
                lines: options.lines,
                size: fontSize,
                width: maskWidth,
                height,
                x: (options.x !== undefined ? options.x : 0) + maskPadding.left,
                y: options.y,
                lineHeight: options.lineHeight,
                anchor: options.anchor,
                weight: options.weight || 300,
                family: options.family || STATIC_TEXT_FAMILY
            }), {
                x: maskX,
                width: maskWidth,
                height,
                color: options.color || 'currentColor'
            });
            return svg;
        }

        label.setAttribute('x', options.x !== undefined ? options.x : 0);
        label.setAttribute('y', options.y !== undefined ? options.y : Math.round(fontSize * 0.82));
        if (options.anchor) label.setAttribute('text-anchor', options.anchor);
        label.setAttribute('fill', options.color || 'currentColor');
        label.setAttribute('font-family', options.family || STATIC_TEXT_FAMILY);
        label.setAttribute('font-size', fontSize);
        label.setAttribute('font-weight', options.weight || 300);
        label.setAttribute('font-synthesis', 'none');
        label.setAttribute('stroke', 'none');
        label.setAttribute('paint-order', 'fill');
        label.setAttribute('text-rendering', 'geometricPrecision');
        label.style.setProperty('font-family', options.family || STATIC_TEXT_FAMILY, 'important');
        label.style.setProperty('font-size', fontSize + 'px', 'important');
        label.style.setProperty('font-weight', String(options.weight || 300), 'important');
        label.style.setProperty('line-height', '1', 'important');
        if (options.lines && options.lines.length > 1) {
            options.lines.forEach(function (line, index) {
                const tspan = document.createElementNS(svgNS, 'tspan');
                tspan.setAttribute('x', options.x !== undefined ? options.x : 0);
                tspan.setAttribute('y', (options.y !== undefined ? options.y : Math.round(fontSize * 0.82)) + index * (options.lineHeight || fontSize * 1.15));
                tspan.style.setProperty('font-size', fontSize + 'px', 'important');
                tspan.style.setProperty('font-weight', String(options.weight || 300), 'important');
                tspan.style.setProperty('font-family', options.family || STATIC_TEXT_FAMILY, 'important');
                tspan.textContent = line;
                label.append(tspan);
            });
        } else {
            label.textContent = options.lines ? options.lines[0] : text;
        }

        svg.append(label);
        return svg;
    }

    function getSvgTextRenderKey(text, options = {}) {
        const lines = options.lines ? options.lines.join('\u0001') : '';
        return [
            getTextRenderEngineKey(),
            String(text),
            lines,
            options.size || '',
            options.width || '',
            options.height || '',
            options.x !== undefined ? options.x : '',
            options.y !== undefined ? options.y : '',
            options.anchor || '',
            options.weight || '',
            options.family || '',
            options.color || '',
            options.lineHeight || '',
            options.useBitmapText === false ? 'svg-text' : 'bitmap-text'
        ].join('\u0002');
    }

    function hasCurrentSvgText(element, key) {
        const firstChild = element && element.firstElementChild;
        return Boolean(
            firstChild &&
            firstChild.classList &&
            firstChild.classList.contains('svg-label') &&
            element.dataset.svgTextKey === key
        );
    }

    function createStaticIconSvg(icon) {
        const svg = document.createElementNS(svgNS, 'svg');
        const width = icon.width || 44;
        const height = icon.height || 44;
        const iconSize = icon.size || 34;

        svg.classList.add('static-icon-svg', icon.className || 'static-icon-default');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.color = 'inherit';

        if (icon.imageHref) {
            const image = document.createElementNS(svgNS, 'image');
            image.setAttribute('href', icon.imageHref);
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', icon.imageHref);
            image.setAttribute('x', icon.imageX !== undefined ? icon.imageX : 0);
            image.setAttribute('y', icon.imageY !== undefined ? icon.imageY : 0);
            image.setAttribute('width', icon.imageWidth || width);
            image.setAttribute('height', icon.imageHeight || height);
            image.setAttribute('preserveAspectRatio', icon.preserveAspectRatio || 'xMidYMid meet');
            svg.append(image);
            return svg;
        }

        if (icon.pathD) {
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', icon.pathD);
            path.setAttribute('fill', icon.fill || 'none');
            path.setAttribute('stroke', icon.stroke || 'currentColor');
            path.setAttribute('stroke-width', icon.strokeWidth || 1.6);
            path.setAttribute('stroke-linecap', icon.strokeLinecap || 'round');
            path.setAttribute('stroke-linejoin', icon.strokeLinejoin || 'round');
            if (icon.vectorEffect) path.setAttribute('vector-effect', icon.vectorEffect);
            svg.append(path);
            return svg;
        }

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', icon.x !== undefined ? icon.x : width / 2);
        label.setAttribute('y', icon.y !== undefined ? icon.y : Math.round(iconSize * 0.82));
        label.setAttribute('text-anchor', icon.anchor || 'middle');
        label.setAttribute('fill', icon.color || 'currentColor');
        label.setAttribute('font-family', icon.family || 'vsevn-icons');
        label.setAttribute('font-size', iconSize);
        label.setAttribute('font-weight', icon.weight || 400);
        if (!icon.preserveFontRendering) {
            label.setAttribute('font-synthesis', 'none');
            label.setAttribute('stroke', 'none');
            label.setAttribute('paint-order', 'fill');
            label.setAttribute('text-rendering', 'geometricPrecision');
            label.style.setProperty('font-family', icon.family || 'vsevn-icons', 'important');
            label.style.setProperty('font-size', iconSize + 'px', 'important');
            label.style.setProperty('font-weight', String(icon.weight || 400), 'important');
            label.style.setProperty('line-height', '1', 'important');
        }
        label.textContent = String.fromCharCode(icon.code);

        svg.append(label);

        return svg;
    }

    const staticIconConfigs = {
        paperclip: [
            { className: 'static-icon-default', code: 0xf006, family: 'vsevn-icons', width: 14, height: 34, size: 34, x: 7, y: 31 },
            { className: 'static-icon-hover', code: 0xf000, family: 'vsevn-paperclip-hover', width: 14, height: 34, size: 34, x: 7, y: 31 }
        ],
        rollback: [
            { className: 'static-icon-default', code: 0xf003, family: 'vsevn-icons', width: 36, height: 36, size: 36, x: 18, y: 32 },
            { className: 'static-icon-hover', code: 0xf000, family: 'vsevn-rollback-hover', width: 36, height: 36, size: 36, x: 18, y: 32 }
        ],
        delete: [
            { className: 'static-icon-default', code: 0xf002, family: 'vsevn-delete-states', width: 24, height: 24, size: 24, x: 12, y: 21 },
            { className: 'static-icon-hover', code: 0xf001, family: 'vsevn-delete-states', width: 24, height: 24, size: 24, x: 12, y: 21 },
            { className: 'static-icon-active', code: 0xf000, family: 'vsevn-delete-active', width: 24, height: 24, size: 24, x: 12, y: 21 }
        ],
        warning: [
            { className: 'static-icon-default', code: 0xf002, family: 'vsevn-icons', width: 36, height: 36, size: 36, x: 18, y: 32 }
        ],
        html: [
            { className: 'static-icon-default', imageHref: 'icons/download/html.svg', width: 36, height: 36 },
            { className: 'static-icon-hover', imageHref: 'icons/download-hover/html.svg', width: 36, height: 36 }
        ],
        xml: [
            { className: 'static-icon-default', imageHref: 'icons/download/xml.svg', width: 36, height: 36 },
            { className: 'static-icon-hover', imageHref: 'icons/download-hover/xml.svg', width: 36, height: 36 }
        ],
        xlsx: [
            { className: 'static-icon-default', imageHref: 'icons/download/xlsx.svg', width: 36, height: 36 },
            { className: 'static-icon-hover', imageHref: 'icons/download-hover/xlsx.svg', width: 36, height: 36 }
        ],
        docx: [
            { className: 'static-icon-default', imageHref: 'icons/download/docx.svg', width: 36, height: 36 },
            { className: 'static-icon-hover', imageHref: 'icons/download-hover/docx.svg', width: 36, height: 36 }
        ],
        zip: [
            { className: 'static-icon-default', imageHref: 'icons/download/zip.svg', width: 36, height: 36 },
            { className: 'static-icon-hover', imageHref: 'icons/download-hover/zip.svg', width: 36, height: 36 }
        ],
        selectArrow: [
            { className: 'static-icon-default', code: 0xf000, family: 'vsevn-select-arrow', width: 10, height: 8, size: 10, x: 5, y: 10, preserveFontRendering: true }
        ]
    };

    function renderStaticIcon(element, type) {
        const config = staticIconConfigs[type];
        if (!element || !config) return;
        const renderVersion = getTextRenderEngineKey();
        if (
            element.dataset.staticIcon === type &&
            element.dataset.staticIconVersion === renderVersion &&
            element.querySelector('.static-icon-svg')
        ) return;
        element.classList.add('has-static-icon');
        element.dataset.staticIcon = type;
        element.dataset.staticIconVersion = renderVersion;
        element.style.setProperty('font-size', '0px', 'important');
        element.style.setProperty('line-height', '0px', 'important');
        element.style.setProperty('text-size-adjust', 'none', 'important');
        element.style.setProperty('-webkit-text-size-adjust', 'none', 'important');
        element.textContent = '';
        config.forEach(function (icon) {
            element.append(createStaticIconSvg(icon));
        });
    }

    function renderStaticIcons(root) {
        const scope = root || document;
        scope.querySelectorAll('.select-arrow-icon').forEach(function (icon) {
            renderStaticIcon(icon, 'selectArrow');
        });
        scope.querySelectorAll('.vi-paperclip').forEach(function (icon) {
            renderStaticIcon(icon, 'paperclip');
        });
        scope.querySelectorAll('.vi-rollback').forEach(function (icon) {
            renderStaticIcon(icon, 'rollback');
        });
        scope.querySelectorAll('.vi-delete').forEach(function (icon) {
            renderStaticIcon(icon, 'delete');
        });
        scope.querySelectorAll('.warning-icon').forEach(function (icon) {
            renderStaticIcon(icon, 'warning');
        });
        scope.querySelectorAll('.file-icon-btn .vi-html, .file-icon-btn .vi-xml, .file-icon-btn .vi-xlsx, .file-icon-btn .vi-docx, .file-icon-btn .vi-zip').forEach(function (icon) {
            icon.classList.remove('has-static-icon');
            delete icon.dataset.staticIcon;
            delete icon.dataset.staticIconVersion;
            icon.querySelectorAll('.static-icon-svg').forEach(function (svg) {
                svg.remove();
            });
        });
    }


    const fixedTextMetricRules = [
        { selector: '.log-preview-title', size: 25, line: 30, family: 'Roboto, Arial, sans-serif', weight: 300 },
        { selector: '.log-preview-meta-item span', size: 13, line: 16, family: 'Roboto, Arial, sans-serif', weight: 300 },
        { selector: '.log-preview-meta-item strong', size: 18, line: 22, family: 'Roboto, Arial, sans-serif', weight: 300 },
        { selector: '.log-preview-source-note, .log-preview-source-title', size: 18, line: 24.3, family: 'Roboto, Arial, sans-serif', weight: 300 },
        { selector: '.log-preview-summary', size: 14, line: 18.2, family: 'monospace', weight: 400 },
        { selector: '.log-preview-summary-line, .log-preview-summary-section strong, .log-preview-summary-section span, .log-preview-summary-section em', size: 14, line: 18.2, family: 'monospace', weight: 400 },
        { selector: '.log-preview-table td, .log-preview-source-table td, .log-preview-reason, .log-preview-status', size: 16, line: 20.8, family: 'Roboto, Arial, sans-serif', weight: 300 },
        { selector: '.log-preview-table th, .log-preview-source-table th', size: 18, line: 23.4, family: 'Roboto, Arial, sans-serif', weight: 300 }
    ];

    function lockTextMetricElement(element, rule) {
        if (!element || !rule) return;
        element.style.setProperty('font-family', rule.family, 'important');
        element.style.setProperty('font-size', pxToVw(rule.size), 'important');
        element.style.setProperty('line-height', pxToVw(rule.line), 'important');
        element.style.setProperty('font-weight', String(rule.weight), 'important');
        element.style.setProperty('text-size-adjust', 'none', 'important');
        element.style.setProperty('-webkit-text-size-adjust', 'none', 'important');
    }

    function lockScaleCriticalHtmlText(root) {
        const scope = root || document;
        fixedTextMetricRules.forEach(function (rule) {
            scope.querySelectorAll(rule.selector).forEach(function (element) {
                lockTextMetricElement(element, rule);
            });
        });
    }

    function lockScaleCriticalCarriers(root) {
        const scope = root || document;
        scope.querySelectorAll([
            '.vi-clear',
            '.select-arrow-icon',
            '.file-icon-btn',
            '.file-icon-btn .vi',
            '.rollback-btn',
            '.rollback-btn .vi',
            '.delete-btn',
            '.delete-btn .vi',
            '.warning-icon',
            '.paperclip-btn',
            '.paperclip-icon',
            '.select-clear-btn',
            '.filepath-clear-btn',
            '.log-preview-close',
            '.import-btn',
            '.source-choice-menu button',
            '.svg-label',
            '.static-icon-svg',
            '.topbar',
            '.main-nav',
            '.nav-link',
            '.nav-text',
            '.page-title',
            '.date-row',
            '.date-field',
            '.date-label',
            '.date-value-render',
            '.log-count-label',
            '.log-count-num',
            '.page-btn span',
            '.page-ellipsis span',
            '.check-field',
            '.check-label',
            '.import-controls',
            '.select-group',
            '.custom-select',
            '.select-trigger',
            '.select-value-text',
            '.select-dropdown',
            '.select-option',
            '.field-label',
            '.filepath-group',
            '.filepath-input-wrapper',
            '.filepath-static-value',
            '.paperclip-wrapper',
            '.source-choice-menu',
            '.tooltip',
            '.log-area',
            '.log-title',
            '.log-empty-state',
            '.log-table',
            '.log-table thead',
            '.log-table tbody',
            '.log-table tr',
            '.log-table th',
            '.log-table td',
            '.count-cell',
            '.count-base',
            '.count-added',
            '.count-updated',
            '.count-total',
            '.datetime-value',
            '.filename-link',
            '.download-icons',
            '.status-loaded',
            '.status-rolled',
            '.rollback-wrapper',
            '.delete-wrapper',
            '.file-icon-wrapper',
            '.date-calendar',
            '.date-calendar-header',
            '.date-calendar-title',
            '.date-calendar-picker',
            '.date-calendar-select',
            '.date-calendar-select-arrow',
            '.date-calendar-menu',
            '.date-calendar-option',
            '.date-calendar-nav',
            '.date-calendar-weekdays',
            '.date-calendar-grid',
            '.date-calendar-weekday',
            '.date-calendar-day',
            '.log-preview-overlay',
            '.log-preview-window',
            '.log-preview-head',
            '.log-preview-body',
            '.log-preview-meta',
            '.log-preview-meta-item',
            '.log-preview-source',
            '.log-preview-summary',
            '.log-preview-table',
            '.log-preview-source-table',
            '.log-preview-table tr',
            '.log-preview-source-table tr'
        ].join(',')).forEach(function (element) {
            if (element.classList.contains('plain-text-render')) return;
            element.style.setProperty('font-size', '0px', 'important');
            element.style.setProperty('line-height', '0px', 'important');
            element.style.setProperty('text-size-adjust', 'none', 'important');
            element.style.setProperty('-webkit-text-size-adjust', 'none', 'important');
        });
    }

    const plainTextRenderSelectors = [];
    const plainTextRenderSelector = plainTextRenderSelectors.join(',');

    function shouldRenderPlainText(element) {
        return Boolean(plainTextRenderSelector && element && element.matches(plainTextRenderSelector));
    }

    function renderPlainElementText(element, text, options = {}) {
        const size = options.size || 21;
        const height = options.height || Math.ceil(size * 1.35);
        const weight = options.weight || 300;
        const renderKey = [String(text), size, height, weight].join('\u0002');

        if (
            element.classList.contains('plain-text-render') &&
            element.dataset.plainTextKey === renderKey &&
            element.textContent === text
        ) {
            return;
        }

        element.classList.add('plain-text-render');
        element.dataset.plainTextKey = renderKey;
        element.textContent = text;
        element.style.setProperty('--plain-font-size', pxToVw(size));
        element.style.setProperty('--plain-line-height', pxToVw(height));
        element.style.setProperty('--plain-font-weight', String(weight));
        element.style.setProperty('font-size', pxToVw(size), 'important');
        element.style.setProperty('line-height', pxToVw(height), 'important');
        element.style.setProperty('font-weight', String(weight), 'important');
        element.style.removeProperty('color');
    }

    function renderElementText(element, options = {}) {
        const text = options.text || element.dataset.text || element.textContent.trim();
        element.dataset.text = text;
        element.setAttribute('aria-label', text);

        if (shouldRenderPlainText(element)) {
            renderPlainElementText(element, text, options);
            return;
        }

        const renderKey = getSvgTextRenderKey(text, options);
        if (hasCurrentSvgText(element, renderKey)) return;

        element.classList.remove('plain-text-render');
        element.textContent = '';
        element.dataset.svgTextKey = renderKey;
        element.append(createSvgText(text, options));
    }

    function measureTextWidth(text, size, weight, family) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${weight} ${size}px ${family || STATIC_TEXT_FAMILY}`;
        return Math.ceil(ctx.measureText(text).width) + 2;
    }

    function splitTextIntoLines(text, maxChars) {
        const words = String(text).trim().split(/\s+/);
        const lines = [];
        let line = '';

        words.forEach(function (word) {
            const next = line ? `${line} ${word}` : word;
            if (next.length > maxChars && line) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        });

        if (line) lines.push(line);
        return lines;
    }

    const bitmapTextMaskCache = new Map();
    let bitmapTextMaskCounter = 0;
    let bitmapTextFontVersion = 0;
    let textRenderMode = 'bitmap';
    let textRenderModeVersion = 0;
    let baselineDevicePixelScale = null;

    function getTextRenderEngineKey() {
        return textRenderMode === 'bitmap'
            ? `${TEXT_RENDER_ENGINE}:${bitmapTextFontVersion}:${textRenderModeVersion}`
            : `svg-text-v1:${textRenderModeVersion}`;
    }

    function shouldUseBitmapTextMasks() {
        return textRenderMode === 'bitmap';
    }

    function getNormalBrowserZoomRatio() {
    var raw = document.documentElement.clientWidth || window.innerWidth || DESIGN_VIEWPORT_WIDTH;
    if (raw <= 0) raw = DESIGN_VIEWPORT_WIDTH;
    return DESIGN_VIEWPORT_WIDTH / raw;
}

    function isNormalBrowserZoomActive() {
        const ratio = getNormalBrowserZoomRatio();
        const currentScale = getDevicePixelScale();
        return Math.abs(ratio - 1) > 0.015 || currentScale >= 3;
    }

    function getBitmapTextScale() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        return Math.max(3, Math.min(6, Math.ceil(dpr)));
    }

    function makeCanvasFont(size, weight, family) {
        return `${weight || 300} ${size}px ${family || STATIC_TEXT_FAMILY}`;
    }

    function getTextMaskDataUrl(text, options = {}) {
        const width = Math.max(1, Math.ceil(options.width || 200));
        const height = Math.max(1, Math.ceil(options.height || 26));
        const size = options.size || 21;
        const weight = options.weight || 300;
        const family = options.family || STATIC_TEXT_FAMILY;
        const x = options.x !== undefined ? options.x : 0;
        const y = options.y !== undefined ? options.y : Math.round(size * 0.82);
        const lineHeight = options.lineHeight || size * 1.15;
        const lines = options.lines && options.lines.length ? options.lines : [text];
        const anchor = options.anchor || 'start';
        const scale = getBitmapTextScale();
        const key = [
            TEXT_RENDER_ENGINE,
            bitmapTextFontVersion,
            String(text),
            lines.join('\u0001'),
            width,
            height,
            size,
            weight,
            family,
            x,
            y,
            lineHeight,
            anchor,
            scale
        ].join('\u0002');

        if (bitmapTextMaskCache.has(key)) return bitmapTextMaskCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);

        const ctx = canvas.getContext('2d');
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.font = makeCanvasFont(size, weight, family);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        lines.forEach(function (line, index) {
            ctx.fillText(line, x, y + index * lineHeight);
        });

        const dataUrl = canvas.toDataURL('image/png');
        bitmapTextMaskCache.set(key, dataUrl);
        return dataUrl;
    }

    function appendBitmapTextMask(svg, dataUrl, options = {}) {
        const x = options.x || 0;
        const y = options.y || 0;
        const width = options.width || 200;
        const height = options.height || 26;
        const maskId = `bitmap-text-mask-${++bitmapTextMaskCounter}`;
        const defs = document.createElementNS(svgNS, 'defs');
        const mask = document.createElementNS(svgNS, 'mask');
        const image = document.createElementNS(svgNS, 'image');
        const rect = document.createElementNS(svgNS, 'rect');

        mask.setAttribute('id', maskId);
        mask.setAttribute('maskUnits', 'userSpaceOnUse');
        mask.setAttribute('maskContentUnits', 'userSpaceOnUse');
        mask.setAttribute('x', x);
        mask.setAttribute('y', y);
        mask.setAttribute('width', width);
        mask.setAttribute('height', height);
        mask.style.maskType = 'alpha';

        image.setAttribute('href', dataUrl);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
        image.setAttribute('x', x);
        image.setAttribute('y', y);
        image.setAttribute('width', width);
        image.setAttribute('height', height);
        image.setAttribute('preserveAspectRatio', 'none');

        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', options.color || 'currentColor');
        rect.setAttribute('mask', `url(#${maskId})`);

        mask.append(image);
        defs.append(mask);
        svg.append(defs, rect);
    }

    function truncateTextToWidth(text, size, weight, maxWidth, family) {
        const value = String(text || '');
        const ellipsis = '...';
        if (measureTextWidth(value, size, weight, family) <= maxWidth) {
            return { text: value, truncated: false };
        }
        if (measureTextWidth(ellipsis, size, weight, family) > maxWidth) {
            return { text: '', truncated: true };
        }

        let low = 0;
        let high = value.length;
        while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            if (measureTextWidth(value.slice(0, mid) + ellipsis, size, weight, family) <= maxWidth) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        return { text: value.slice(0, low) + ellipsis, truncated: true };
    }

    function wrapTextToWidth(text, size, weight, maxWidth, options = {}) {
        const value = String(text || '').trim();
        const family = options.family || STATIC_TEXT_FAMILY;
        const maxLines = options.maxLines || 4;
        const ellipsis = '...';
        const lines = [];
        let line = '';

        for (let i = 0; i < value.length; i += 1) {
            const char = value[i];
            const next = line + char;
            if (!line || measureTextWidth(next, size, weight, family) <= maxWidth) {
                line = next;
                continue;
            }

            lines.push(line.trimEnd());
            line = char === ' ' ? '' : char;

            if (lines.length === maxLines) {
                const remaining = value.slice(i).trim();
                const base = lines[maxLines - 1] + remaining;
                lines[maxLines - 1] = truncateTextToWidth(base, size, weight, maxWidth, family).text || ellipsis;
                return lines;
            }
        }

        if (line) lines.push(line.trimEnd());
        return lines.length ? lines : [''];
    }

    function getDesignWidth(element, fallback) {
        const rect = element.getBoundingClientRect();
        const pageScale = getCurrentPageScale();
        if (!rect.width || !pageScale) return fallback;
        return Math.max(24, Math.floor(rect.width / pageScale) - 12);
    }

    function getMeasuredLineWidth(lines, size, weight, maxWidth, family) {
        return Math.max(24, Math.min(maxWidth, Math.ceil(Math.max.apply(null, lines.map(function (line) {
            return measureTextWidth(line, size, weight, family);
        }))) + 2));
    }

    function renderImportToastText(toast, message) {
        if (!toast) return;
        const text = String(message || '');
        const maxWidth = 458;
        const size = 16;
        const weight = 300;
        const lineHeight = 22;
        const lines = wrapTextToWidth(text, size, weight, maxWidth, { maxLines: 4 });
        const width = Math.max(220, getMeasuredLineWidth(lines, size, weight, maxWidth));

        toast.dataset.text = text;
        toast.setAttribute('aria-label', text);
        toast.classList.add('is-static-toast');
        toast.textContent = '';
        toast.append(createSvgText(text, {
            lines,
            size,
            width,
            height: Math.max(24, lines.length * lineHeight + 2),
            y: 17,
            lineHeight,
            weight,
            color: 'currentColor'
        }));
    }

    function updateFilenameUnderlineWidth(link) {
        if (!link) return;
        const fullText = link.dataset.fullText || link.dataset.text || link.getAttribute('aria-label') || link.textContent.trim();
        const designWidth = getDesignWidth(link, 720);
        const maxTextWidth = Math.max(40, designWidth - 10);
        const fitted = truncateTextToWidth(fullText, 21, 300, maxTextWidth);
        const underlineWidth = Math.min(maxTextWidth, measureTextWidth(fitted.text, 21, 300));

        link.dataset.fullText = fullText;
        link.dataset.text = fullText;
        link.dataset.truncated = fitted.truncated ? 'true' : 'false';
        link.dataset.underlineText = fitted.text;
        link.style.setProperty('--filename-underline-width', pxToVw(Math.max(1, underlineWidth)));
        renderFilenameHoverUnderline(link, underlineWidth);
    }

    function refreshFilenameUnderlineWidths(root) {
        const scope = root || document;
        scope.querySelectorAll('.filename-link').forEach(updateFilenameUnderlineWidth);
    }

    function getZoomSafeUnit() {
        const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom-safe-line'));
        return Number.isFinite(value) && value > 0 ? Math.max(1, value) : 1;
    }

    function renderFilenameHoverUnderline(link, width) {
        if (!link) return;

        const safeWidth = Math.max(1, Math.ceil(width));
        const dotSize = 2;
        const dotGap = 3;
        const dotRadius = dotSize / 2;
        const dotStep = dotSize + dotGap;
        const renderKey = [safeWidth, dotSize, dotStep].join(':');
        const existing = link.querySelector(':scope > .filename-hover-underline');

        link.dataset.underlineWidth = String(safeWidth);
        link.style.setProperty('--frozen-underline-css-height', pxToVw(dotSize));
        link.classList.add('has-frozen-underline');

        if (existing && existing.dataset.renderKey === renderKey) return;
        if (existing && link.matches(':hover')) return;
        if (existing) existing.remove();

        const underline = document.createElementNS(svgNS, 'svg');
        underline.classList.add('filename-hover-underline');
        underline.dataset.renderKey = renderKey;
        underline.setAttribute('viewBox', `0 0 ${safeWidth} ${dotSize}`);
        underline.setAttribute('width', pxToVw(safeWidth));
        underline.setAttribute('height', pxToVw(dotSize));
        underline.setAttribute('preserveAspectRatio', 'none');
        underline.setAttribute('aria-hidden', 'true');
        underline.setAttribute('focusable', 'false');
        underline.setAttribute('shape-rendering', 'geometricPrecision');
        underline.style.width = pxToVw(safeWidth);
        underline.style.height = pxToVw(dotSize);

        for (let x = dotRadius; x <= safeWidth - dotRadius + 0.01; x += dotStep) {
            const dot = document.createElementNS(svgNS, 'circle');
            dot.setAttribute('cx', x.toFixed(2).replace(/\.?0+$/, ''));
            dot.setAttribute('cy', String(dotRadius));
            dot.setAttribute('r', String(dotRadius));
            dot.setAttribute('fill', '#0476D8');
            underline.append(dot);
        }

        link.append(underline);
    }

    function renderTooltipText(tooltip, textOverride) {
        if (!tooltip) return;
        const text = String(textOverride !== undefined ? textOverride : (tooltip.dataset.text || tooltip.textContent.trim()));
        if (!text) return;

        const size = 21.6;
        const weight = 300;
        const lineHeight = 25.2;
        const isFullTextTooltip = tooltip.classList.contains('filepath-full-tooltip') || tooltip.classList.contains('filename-full-tooltip');
        const maxWidth = isFullTextTooltip ? 1060 : 760;
        const measured = measureTextWidth(text, size, weight) + 4;
        const shouldWrap = isFullTextTooltip || measured > maxWidth;
        const lines = shouldWrap ? wrapTextToWidth(text, size, weight, maxWidth, { maxLines: isFullTextTooltip ? 4 : 2 }) : [text];
        const width = Math.max(isFullTextTooltip ? 180 : 48, getMeasuredLineWidth(lines, size, weight, maxWidth));
        const height = Math.max(30, lines.length * lineHeight + 4);
        const centered = isFullTextTooltip;

        tooltip.dataset.text = text;
        tooltip.setAttribute('aria-label', text);
        tooltip.classList.add('is-static-tooltip');
        tooltip.classList.toggle('is-wrapped', lines.length > 1);
        tooltip.textContent = '';
        tooltip.append(createSvgText(text, {
            lines,
            size,
            width,
            height,
            x: centered ? width / 2 : 0,
            y: 23,
            anchor: centered ? 'middle' : undefined,
            lineHeight,
            weight,
            color: 'currentColor'
        }));
    }

    function renderAllTooltips(root) {
        const scope = root || document;
        scope.querySelectorAll('.tooltip').forEach(function (tooltip) {
            const text = tooltip.dataset.text || tooltip.textContent.trim();
            if (text) renderTooltipText(tooltip, text);
        });
    }

    function renderWrappedElementText(element, options = {}) {
        const text = options.text || element.dataset.text || element.textContent.trim();
        const lines = options.lines || splitTextIntoLines(text, options.maxChars || 18);
        element.dataset.text = text;
        element.setAttribute('aria-label', text);
        element.textContent = '';
        element.append(createSvgText(text, {
            ...options,
            lines,
            width: options.width || getDesignWidth(element, 180),
            height: options.height || Math.max(30, lines.length * (options.lineHeight || 24) + 8)
        }));
    }

    function renderNavIcon(item, hovered = false) { return;
        const icon = item.querySelector('.icon');
        const config = navIconConfig[item.dataset.tab];
        if (!icon || !config) return;

        const iconConfig = hovered || item.classList.contains('active') ? config.hover : config.default;
        const renderKey = `${getTextRenderEngineKey()}:${iconConfig.family}:${iconConfig.code}`;
        if (icon.dataset.navIconKey === renderKey && icon.querySelector('.static-icon-svg')) return;

        icon.classList.add('has-static-icon');
        icon.dataset.navIconKey = renderKey;
        icon.textContent = '';
        icon.append(createStaticIconSvg({
            className: 'static-icon-default',
            code: iconConfig.code,
            family: iconConfig.family,
            width: 44,
            height: 44,
            size: 34,
            x: 22,
            y: 40,
            weight: 400
        }));
    }

    function renderNavText(item) {
        const textEl = item.querySelector('.nav-text');
        if (!textEl) return;
        const isActive = item.classList.contains('active');
        const weight = isActive ? 400 : 300;
        const text = textEl.dataset.text || textEl.textContent.trim();
        renderElementText(textEl, {
            text,
            size: 20,
            // width: measureTextWidth(text, 20, weight),
            width: navTextWidths[item.dataset.tab] || measureTextWidth(text, 20, weight),
            height: 24,
            y: 18,
            weight: weight,
            useBitmapText: false
        });

        const svg = textEl.querySelector('.svg-label');
        if (svg) svg.style.width = '100%';
    }

    function renderSelectValueText(text) {
        const valueText = document.getElementById('selectValueText');
        if (!valueText) return;
        const currentText = text || valueText.dataset.text || valueText.textContent.trim();
        renderElementText(valueText, {
            text: currentText,
            size: 21.6,
            width: Math.min(390, measureTextWidth(currentText, 21.6, 300)),
            height: 30,
            y: FORM_CONTROL_TEXT_Y,
            weight: 300,
            color: 'currentColor'
        });
    }

    function renderImportButtonText(text) {
        const btn = document.getElementById('importBtn');
        if (!btn) return;
        const currentText = text || btn.dataset.text || btn.textContent.trim();
        // Динамическая ширина SVG по реальной ширине текста
        const measuredPx = Math.max(80, measureTextWidth(currentText, 21.6, 300) + 8);
        renderElementText(btn, {
            text: currentText,
            size: 21.6,
            width: measuredPx,
            height: 30,
            x: measuredPx / 2,
            y: FORM_CONTROL_TEXT_Y,
            anchor: 'middle',
            weight: 300,
            color: 'currentColor'
        });
    }

    function renderFieldLabels() {
        document.querySelectorAll('.field-label').forEach(function (label) {
            const text = label.dataset.text || label.textContent.trim();
            renderElementText(label, {
                text,
                size: 21.6,
                width: 330,
                height: 26,
                y: 20,
                weight: 300,
                color: '#82752e'
            });
        });
    }

    function renderSelectOptions() {
        document.querySelectorAll('.select-option').forEach(function (option) {
            const text = option.dataset.text || option.textContent.trim();
            renderElementText(option, {
                text,
                size: 21.6,
                width: Math.min(430, measureTextWidth(text, 21.6, 300)),
                height: 30,
                y: 22,
                weight: 300,
                color: 'currentColor'
            });
        });
    }

    function renderSourceChoiceMenuText() {
        document.querySelectorAll('.source-choice-menu button').forEach(function (button) {
            const text = button.dataset.text || button.textContent.trim();
            renderElementText(button, {
                text,
                size: 18,
                width: Math.max(46, measureTextWidth(text, 18, 300) + 6),
                height: 24,
                x: Math.max(46, measureTextWidth(text, 18, 300) + 6) / 2,
                y: 19,
                anchor: 'middle',
                weight: 300,
                color: 'currentColor'
            });
        });
    }

    function renderFilePathValue(input) {
        const field = input || document.getElementById('filepathInput');
        if (!field) return;
        const wrapper = field.closest('.filepath-input-wrapper');
        if (!wrapper) return;

        let render = wrapper.querySelector('.filepath-static-value');
        if (!render) {
            render = document.createElement('span');
            render.className = 'filepath-static-value';
            wrapper.insertBefore(render, field.nextSibling);
        }

        const text = field.value || field.getAttribute('placeholder') || '';
        const isPlaceholder = !field.value && Boolean(text);
        wrapper.classList.toggle('has-filepath-value', Boolean(field.value));
        const designWidth = getDesignWidth(render, 880);
        const maxTextWidth = Math.max(32, designWidth - 4);
        const fitted = truncateTextToWidth(text, 21.6, 300, maxTextWidth);
        updateFilePathCaret(field, maxTextWidth);

        render.classList.toggle('is-placeholder', isPlaceholder);
        render.classList.toggle('is-error', field.dataset.errorActive === '1');
        render.dataset.text = text;
        render.dataset.truncated = fitted.truncated ? 'true' : 'false';

        if (!text) {
            if (render.firstChild) render.textContent = '';
            delete render.dataset.svgTextKey;
            return;
        }

        const renderOptions = {
            text: fitted.text,
            size: 21.6,
            width: maxTextWidth,
            height: 30,
            y: 22,
            weight: 300,
            color: 'currentColor'
        };
        const renderKey = getSvgTextRenderKey(fitted.text, renderOptions);
        if (hasCurrentSvgText(render, renderKey)) return;

        render.classList.remove('plain-text-render');
        render.textContent = '';
        render.dataset.svgTextKey = renderKey;
        render.append(createSvgText(fitted.text, renderOptions));
    }

    function updateFilePathCaret(input, maxTextWidthOverride) {
        const field = input || document.getElementById('filepathInput');
        if (!field) return;
        const wrapper = field.closest('.filepath-input-wrapper');
        if (!wrapper) return;

        const value = field.value || '';
        if (!value) {
            wrapper.style.setProperty('--filepath-caret-x', '0px');
            return;
        }

        const render = wrapper.querySelector('.filepath-static-value');
        const designWidth = render ? getDesignWidth(render, 880) : 880;
        const maxTextWidth = Math.max(32, maxTextWidthOverride || designWidth - 4);
        const selectionEnd = Number.isFinite(field.selectionEnd) ? field.selectionEnd : value.length;
        const caretText = value.slice(0, Math.max(0, selectionEnd));
        const caretWidth = Math.min(maxTextWidth, measureTextWidth(caretText, 21.6, 300));
        wrapper.style.setProperty('--filepath-caret-x', pxToVw(caretWidth));
    }

    function pxToVw(px) {
        return 'calc(var(--dpx) * ' + Number(px).toFixed(5).replace(/\.?0+$/, '') + ')';
    }

    function designPxToViewportPx(px) {
        return px * getCurrentPageScale();
    }

    const zoomLineVarsCache = {};
    let svgTextZoomProbe = null;
    let svgTextZoomMeasureCanvas = null;

    function getSvgTextZoomFactor() {
        if (!document.body) return 1;

        if (!svgTextZoomProbe) {
            const wrapper = document.createElement('div');
            const svg = document.createElementNS(svgNS, 'svg');
            const label = document.createElementNS(svgNS, 'text');

            wrapper.style.position = 'fixed';
            wrapper.style.left = '-10000px';
            wrapper.style.top = '-10000px';
            wrapper.style.width = '1px';
            wrapper.style.height = '1px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.pointerEvents = 'none';
            wrapper.style.visibility = 'hidden';
            wrapper.className = 'text-zoom-probe';
            wrapper.setAttribute('aria-hidden', 'true');

            svg.setAttribute('width', '1200');
            svg.setAttribute('height', '160');
            svg.setAttribute('viewBox', '0 0 1200 160');
            label.setAttribute('x', '0');
            label.setAttribute('y', '110');
            label.setAttribute('font-family', 'Arial, sans-serif');
            label.setAttribute('font-size', '100');
            label.setAttribute('font-weight', '400');
            label.textContent = 'MMMMMMMMMM';

            svg.append(label);
            wrapper.append(svg);
            document.body.append(wrapper);
            svgTextZoomProbe = { wrapper, label };
        }

        if (!svgTextZoomMeasureCanvas) {
            svgTextZoomMeasureCanvas = document.createElement('canvas');
        }
        const ctx = svgTextZoomMeasureCanvas.getContext('2d');
        ctx.font = '400 100px Arial, sans-serif';
        const canvasWidth = Math.max(1, ctx.measureText(svgTextZoomProbe.label.textContent).width);
        let svgWidth = canvasWidth;

        try {
            svgWidth = svgTextZoomProbe.label.getBBox().width || canvasWidth;
        } catch (error) {
            svgWidth = canvasWidth;
        }

        const factor = svgWidth / canvasWidth;
        return Number.isFinite(factor) && factor > 0 ? Math.max(1, Math.min(8, factor)) : 1;
    }

    function updateSvgTextZoomCompensation() {
        const nextMode = 'bitmap';
        const changed = nextMode !== textRenderMode;

        if (changed) {
            textRenderMode = nextMode;
            textRenderModeVersion += 1;
            bitmapTextMaskCache.clear();
        }

        document.documentElement.style.setProperty('--svg-text-zoom-inverse', '1');
        return changed;
    }

    function updateZoomAwareLines() {
        const textRenderModeChanged = updateSvgTextZoomCompensation();
        const root = document.documentElement;
        const layoutWidth = getLayoutViewportWidth();
        const pageScale = layoutWidth / DESIGN_VIEWPORT_WIDTH;
        const underlineScreenDotPx = 2;
        const underlineScreenGapPx = 3;
        const zoomSafeLine = Math.max(MIN_PAGE_SCALE, pageScale);
        const dotSize = zoomSafeLine * underlineScreenDotPx;
        const dotStep = dotSize + zoomSafeLine * underlineScreenGapPx;
        const checkboxFillLine = pageScale * 6;
        const nextVars = {
            '--page-scale': pageScale.toFixed(6),
            '--dpx': pageScale.toFixed(6) + 'px',
            '--ui-half-line': (pageScale * 0.5).toFixed(6) + 'px',
            '--ui-hairline': pageScale.toFixed(6) + 'px',
            '--ui-control-line': (pageScale * 0.5).toFixed(6) + 'px',
            '--ui-control-strong-line': (pageScale * 1.5).toFixed(6) + 'px',
            '--ui-checkbox-line': (pageScale * 1.25).toFixed(6) + 'px',
            '--ui-checkbox-fill-line': checkboxFillLine.toFixed(6) + 'px',
            '--ui-strong-line': (pageScale * 2).toFixed(6) + 'px',
            '--zoom-safe-line': zoomSafeLine.toFixed(6) + 'px',
            '--zoom-dot-size': dotSize.toFixed(6) + 'px',
            '--zoom-dot-radius': (dotSize / 2).toFixed(6) + 'px',
            '--zoom-dot-edge': (dotSize * 0.55).toFixed(6) + 'px',
            '--zoom-dot-step': dotStep.toFixed(6) + 'px'
        };

        Object.keys(nextVars).forEach(function (name) {
            if (zoomLineVarsCache[name] === nextVars[name]) return;
            zoomLineVarsCache[name] = nextVars[name];
            root.style.setProperty(name, nextVars[name]);
        });

        return textRenderModeChanged;
    }

    let viewportUpdateFrame = null;
    let zoomHoverShield = null;
    let zoomHoverShieldTimer = null;
    let zoomHoverReleaseBound = false;

    function ensureZoomHoverShield() {
        if (zoomHoverShield || !document.body) return zoomHoverShield;
        zoomHoverShield = document.createElement('div');
        zoomHoverShield.className = 'zoom-hover-shield';
        zoomHoverShield.setAttribute('aria-hidden', 'true');
        zoomHoverShield.hidden = true;
        document.body.appendChild(zoomHoverShield);
        return zoomHoverShield;
    }

    function releaseZoomHoverBlock() {
        if (zoomHoverShield && !zoomHoverShield.hidden) return;

        hideAllTooltips();
        document.documentElement.classList.remove('is-zoom-hover-blocked');
        if (!zoomHoverReleaseBound) return;

        window.removeEventListener('pointermove', releaseZoomHoverBlock, true);
        window.removeEventListener('mousedown', releaseZoomHoverBlock, true);
        window.removeEventListener('keydown', releaseZoomHoverBlock, true);
        zoomHoverReleaseBound = false;
    }

    function armZoomHoverRelease() {
        if (zoomHoverReleaseBound) return;

        zoomHoverReleaseBound = true;
        window.addEventListener('pointermove', releaseZoomHoverBlock, true);
        window.addEventListener('mousedown', releaseZoomHoverBlock, true);
        window.addEventListener('keydown', releaseZoomHoverBlock, true);
    }

    function resetTransientHoverState() {
        hideAllTooltips();

        document.querySelectorAll('.nav-link').forEach(function (item) {
            renderNavIcon(item);
        });

        document.querySelectorAll('.delete-btn.is-pressed').forEach(function (button) {
            button.classList.remove('is-pressed');
        });

        const selectEl = document.getElementById('typeSelect');
        if (selectEl) selectEl.classList.remove('open', 'is-preparing');

        const sourceChoiceMenu = document.getElementById('sourceChoiceMenu');
        if (sourceChoiceMenu) sourceChoiceMenu.hidden = true;

        const calendar = document.querySelector('.date-calendar');
        if (calendar && !calendar.hidden) closeDateCalendar();
    }

    function activateZoomHoverShield() {
        const shield = ensureZoomHoverShield();
        if (!shield) return;

        resetTransientHoverState();
        document.documentElement.classList.add('is-zoom-hover-blocked');
        shield.hidden = false;
        if (zoomHoverShieldTimer) clearTimeout(zoomHoverShieldTimer);
        zoomHoverShieldTimer = setTimeout(function () {
            shield.hidden = true;
            zoomHoverShieldTimer = null;
            releaseZoomHoverBlock();
        }, 260);
    }

    function areTooltipsSuppressed() {
        return document.documentElement.classList.contains('is-zoom-hover-blocked');
    }
    

    function syncViewportMetrics() {
        if (viewportUpdateFrame !== null) {
            window.cancelAnimationFrame(viewportUpdateFrame);
            viewportUpdateFrame = null;
        }

        const textRenderModeChanged = updateZoomAwareLines();
        if (textRenderModeChanged) {
            renderStaticText();
            if (dateCalendarState.field) renderDateCalendar();
        }
        refreshFilenameUnderlineWidths(document);
    }

    function applyViewportMetrics() {
        viewportUpdateFrame = null;
        syncViewportMetrics();
        if (dateCalendarState.field) positionDateCalendar(dateCalendarState.field);
    }

    function markViewportChanging() {
        activateZoomHoverShield();
        if (viewportUpdateFrame !== null) return;
        viewportUpdateFrame = window.requestAnimationFrame(applyViewportMetrics);
    }

    function getTableHeaderKey(th) {
        const className = Array.from(th.classList).find(function (name) {
            return name.indexOf('col-') === 0;
        });
        return className ? className.replace('col-', '') : '';
    }

    function getCountHeaderLines(text) {
        const parts = String(text).trim().replace(/\s+/g, ' ').split(' ');
        if (parts.length >= 3 && parts[0] === 'КОЛИЧЕСТВО' && parts[1] === 'ДОБАВЛЕННЫХ') {
            return [parts[0], parts[1], parts.slice(2).join(' ')];
        }
        return splitTextIntoLines(text, 13);
    }

    function renderTableHeaderText(th) {
        const text = th.dataset.text || th.textContent.trim();
        const key = getTableHeaderKey(th);
        const centeredHeaderWidths = {
            download: 114,
            status: 248,
            rollback: 114,
            delete: 105
        };
        const specs = {
            num: {
                left: 9.7,
                top: 10.7,
                width: 44,
                height: 30,
                y: 22
            },
            datetime: {
                left: 10,
                top: 15.8,
                width: 165,
                height: 32,
                y: 22
            },
            count: {
                left: 10,
                top: 15.8,
                width: 161,
                height: 82,
                y: 22,
                lineHeight: 25.2,
                lines: getCountHeaderLines(text)
            },
            filename: {
                left: 14.17,
                top: 15.8,
                width: 503,
                height: 32,
                y: 22
            }
        };
        const centeredWidth = centeredHeaderWidths[key];
        const spec = specs[key] || (centeredWidth ? {
            left: 0,
            top: 15.4,
            width: centeredWidth,
            height: 32,
            x: centeredWidth / 2,
            y: 22,
            anchor: 'middle'
        } : {
            left: 10,
            top: 15.8,
            width: getDesignWidth(th, 110),
            height: 32,
            y: 22
        });

        const renderOptions = {
            text,
            lines: spec.lines,
            size: 21,
            width: spec.width,
            height: spec.height,
            x: spec.x !== undefined ? spec.x : 0,
            y: spec.y,
            lineHeight: spec.lineHeight,
            anchor: spec.anchor,
            weight: 300,
            color: '#62560E'
        };
        const renderKey = [
            getSvgTextRenderKey(text, renderOptions),
            spec.left,
            spec.top
        ].join('\u0003');

        th.dataset.text = text;
        th.setAttribute('aria-label', text);

        if (hasCurrentSvgText(th, renderKey)) return;

        th.classList.remove('plain-text-render');
        th.textContent = '';
        th.dataset.svgTextKey = renderKey;
        const svg = createSvgText(text, renderOptions);

        svg.style.position = 'absolute';
        svg.style.left = pxToVw(spec.left);
        svg.style.top = pxToVw(spec.top);
        svg.style.maxWidth = 'none';
        th.append(svg);
    }

    function renderLogStaticText() {
        const logArea = document.getElementById('logArea');
        if (!logArea) return;

        logArea.querySelectorAll('.log-title').forEach(function (title) {
            const text = title.dataset.text || title.textContent.trim();
            renderElementText(title, {
                text,
                size: 27,
                width: Math.min(520, measureTextWidth(text, 27, 400)),
                height: 38,
                y: 28,
                weight: 400,
                color: '#62560E'
            });
        });

        logArea.querySelectorAll('.log-empty-state').forEach(function (empty) {
            const text = empty.dataset.text || empty.textContent.trim();
            renderElementText(empty, {
                text,
                size: 21.6,
                width: Math.min(520, measureTextWidth(text, 21.6, 300)),
                height: 32,
                y: 23,
                weight: 300,
                color: 'rgba(98, 86, 14, 0.65)'
            });
        });

        logArea.querySelectorAll('.log-table th').forEach(function (th) {
            renderTableHeaderText(th);
        });

        logArea.querySelectorAll('.filename-link').forEach(function (link) {
            const fullText = link.dataset.fullText || link.dataset.text || link.textContent.trim();
            const designWidth = getDesignWidth(link, 720);
            const maxTextWidth = Math.max(40, designWidth - 10);
            const fitted = truncateTextToWidth(fullText, 21, 300, maxTextWidth);
            link.dataset.fullText = fullText;
            link.dataset.text = fullText;
            link.dataset.truncated = fitted.truncated ? 'true' : 'false';
            link.dataset.underlineText = fitted.text;
            link.setAttribute('aria-label', fullText);
            const renderOptions = {
                text: fitted.text,
                size: 21,
                width: maxTextWidth,
                height: 30,
                y: 22,
                weight: 300,
                color: 'currentColor'
            };
            const renderKey = getSvgTextRenderKey(fitted.text, renderOptions);
            if (hasCurrentSvgText(link, renderKey)) {
                updateFilenameUnderlineWidth(link);
                return;
            }
            link.textContent = '';
            link.dataset.svgTextKey = renderKey;
            link.append(createSvgText(fitted.text, renderOptions));
            updateFilenameUnderlineWidth(link);
        });

        logArea.querySelectorAll([
            '.log-table td.col-num',
            '.datetime-value',
            '.count-base',
            '.count-added',
            '.count-updated',
            '.count-total',
            '.status-loaded',
            '.status-rolled'
        ].join(',')).forEach(function (element) {
            const text = element.dataset.text || element.textContent.trim();
            const isCountDelta = element.matches('.count-added, .count-updated');
            const renderSize = isCountDelta ? 18 : 21;
            const isDateTime = element.matches('.datetime-value');
            const measureBuffer = 4;
            const measuredWidth = Math.max(24, measureTextWidth(text, renderSize, 300) + measureBuffer);
            const maxWidth = isDateTime ? 165 : measuredWidth;
            renderElementText(element, {
                text,
                size: renderSize,
                width: isDateTime ? 165 : Math.min(maxWidth, measuredWidth),
                height: isCountDelta ? 20 : 30,
                y: isCountDelta ? 17 : 22,
                weight: 300,
                color: 'currentColor'
            });
        });

        renderStaticIcons(logArea);
        lockScaleCriticalCarriers(logArea);
    }

    function fitSvgWidthToText(element) {
        const apply = function () {
            const svg = element.querySelector('svg.svg-label');
            const textEl = svg && svg.querySelector('text');
            if (!svg || !textEl) return;
            let bboxWidth = 0;
            try {
                bboxWidth = textEl.getBBox().width;
            } catch (e) {
                return;
            }
            if (!bboxWidth) return;
            const finalWidth = Math.ceil(bboxWidth);
            const heightAttr = parseFloat(svg.getAttribute('viewBox').split(' ')[3]) || 30;
            svg.setAttribute('viewBox', `0 0 ${finalWidth} ${heightAttr}`);
            svg.setAttribute('width', (finalWidth / 19.2).toFixed(4) + 'vw');
        };
        apply();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(apply);
        }
    }

    const dateCalendarMonthNames = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
    ];
    const dateCalendarWeekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    const dateCalendarStartYear = 2000;
    const dateCalendarEndYear = 2050;
    const dateCalendarTextConfig = {
        select: { size: 21.6, height: 30, y: 22, maxWidth: 126, family: STATIC_TEXT_FAMILY, weight: 300 },
        option: { size: 21.6, height: 30, y: 22, maxWidth: 168, family: STATIC_TEXT_FAMILY, weight: 300 },
        weekday: { size: 21.6, height: 30, y: 22, maxWidth: 38, family: STATIC_TEXT_FAMILY, weight: 300 },
        day: { size: 21.6, height: 30, y: 22, maxWidth: 34, family: STATIC_TEXT_FAMILY, weight: 300 }
    };
    const dateCalendarState = {
        field: null,
        viewDate: null,
        placement: null
    };

    function parseDateValue(value) {
        const trimmed = value.trim();
        const displayMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const match = displayMatch || isoMatch;
        if (!match) return null;

        const year = displayMatch ? Number(match[3]) : Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = displayMatch ? Number(match[1]) : Number(match[3]);
        const date = new Date(year, month, day);

        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null;
        }
        return date;
    }

    function formatDateDisplay(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}.${date.getFullYear()}`;
    }

    function formatDateValue(value) {
        const date = parseDateValue(value);
        return date ? formatDateDisplay(date) : value.trim();
    }

    function parseLogDate(value) {
        const datePart = value.trim().split(/\s+/)[0];
        return parseDateValue(datePart);
    }

    function getDateKey(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }

    function isSameDate(firstDate, secondDate) {
        return firstDate.getFullYear() === secondDate.getFullYear()
            && firstDate.getMonth() === secondDate.getMonth()
            && firstDate.getDate() === secondDate.getDate();
    }

    function isDateBefore(firstDate, secondDate) {
        return firstDate.getTime() < secondDate.getTime();
    }

    function getMonthStart(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function isMonthBefore(firstDate, secondDate) {
        return firstDate.getFullYear() < secondDate.getFullYear()
            || (
                firstDate.getFullYear() === secondDate.getFullYear()
                && firstDate.getMonth() < secondDate.getMonth()
            );
    }

    function getDateRangeFields() {
        const fromField = document.querySelector('.date-field[data-date-role="from"]');
        const toField = document.querySelector('.date-field[data-date-role="to"]');
        const fromInput = fromField && fromField.querySelector('.date-input');
        const toInput = toField && toField.querySelector('.date-input');

        return {
            fromField,
            toField,
            fromInput,
            toInput,
            fromDate: fromInput ? parseDateValue(fromInput.value) : null,
            toDate: toInput ? parseDateValue(toInput.value) : null
        };
    }

    function initDateFilterDefaults() {
        const range = getDateRangeFields();
        if (range.fromInput) range.fromInput.value = DEFAULT_DATE_FROM;
        if (range.toInput) range.toInput.value = formatDateDisplay(new Date());
    }

    function getDateCalendarMinViewDate(field, range) {
        return field.dataset.dateRole === 'to' && range.fromDate
            ? getMonthStart(range.fromDate)
            : null;
    }

    function constrainDateCalendarViewDate(field, viewDate, range) {
        const minViewDate = getDateCalendarMinViewDate(field, range);
        if (minViewDate && isMonthBefore(viewDate, minViewDate)) {
            return minViewDate;
        }
        return viewDate;
    }

    function isDateCalendarMonthDisabled(role, range, year, month) {
        return role === 'to'
            && range.fromDate
            && isMonthBefore(new Date(year, month, 1), getMonthStart(range.fromDate));
    }

    function isDateCalendarYearDisabled(role, range, year) {
        return role === 'to'
            && range.fromDate
            && year < range.fromDate.getFullYear();
    }

    function syncDateRangeAfterSelection(field, selectedDate) {
        const range = getDateRangeFields();
        const role = field.dataset.dateRole;

        if (role === 'from' && range.toInput && range.toDate && isDateBefore(range.toDate, selectedDate)) {
            range.toInput.value = formatDateDisplay(selectedDate);
            if (range.toField) renderDateValue(range.toField);
        }
    }

    function isRowInDateRange(row) {
        const range = getDateRangeFields();
        const rowDate = parseLogDate(row.datetime);
        if (!rowDate) return false;

        if (range.fromDate && isDateBefore(rowDate, range.fromDate)) return false;
        if (range.toDate && isDateBefore(range.toDate, rowDate)) return false;
        return true;
    }

    function getFilteredRows(rows) {
        return rows
            .map(function (row, originalIndex) {
                return { row, originalIndex };
            })
            .filter(function (item) {
                return isRowInDateRange(item.row);
            });
    }

    function renderDateValue(field) {
        const input = field.querySelector('.date-input');
        if (!input) return;

        let render = field.querySelector('.date-value-render');
        if (!render) {
            render = document.createElement('span');
            render.className = 'date-value-render';
            field.appendChild(render);
        }

        const text = formatDateValue(input.value);
        renderElementText(render, {
            text: text,
            size: 21.6,
            width: 110,
            height: 30,
            y: 22,
            weight: 400,
            color: '#0087FC'
        });

        render.style.left = '';
        render.style.right = '';

        field.classList.add('rendered');
    }

    function renderStaticSvgOnly(element, text, options = {}) {
        if (!element) return;

        const value = String(text);
        const weight = options.weight || 300;
        const width = options.width || Math.min(
            options.maxWidth || 120,
            measureTextWidth(value, options.size || 16, weight, options.family || STATIC_TEXT_FAMILY) + (options.widthPadding || 2)
        );

        element.dataset.text = value;
        if (options.ariaLabel !== false) {
            element.setAttribute('aria-label', options.ariaLabel || value);
        }

        const renderOptions = {
            text: value,
            size: options.size || 16,
            width,
            height: options.height || 20,
            x: options.x,
            y: options.y,
            anchor: options.anchor,
            weight,
            family: options.family || STATIC_TEXT_FAMILY,
            color: 'currentColor'
        };
        const renderKey = getSvgTextRenderKey(value, renderOptions);
        if (hasCurrentSvgText(element, renderKey)) return;

        element.textContent = '';
        element.dataset.svgTextKey = renderKey;
        element.append(createSvgText(value, renderOptions));
    }

    function createDateCalendarChevron(direction) {
        const svg = document.createElementNS(svgNS, 'svg');
        const path = document.createElementNS(svgNS, 'path');
        const pathByDirection = {
            prev: 'M10.5 3.5 L6 8 L10.5 12.5',
            next: 'M5.5 3.5 L10 8 L5.5 12.5',
            down: 'M4 6 L8 10 L12 6'
        };

        svg.classList.add('date-calendar-chevron', `date-calendar-chevron-${direction}`);
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('aria-hidden', 'true');
        path.setAttribute('d', pathByDirection[direction] || pathByDirection.down);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.55');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.append(path);
        return svg;
    }

    function renderDateCalendarChevron(element, direction) {
        if (!element) return;
        element.textContent = '';
        element.append(createDateCalendarChevron(direction));
    }

    function renderDateCalendarStaticBits(calendar) {
        if (!calendar) return;

        renderDateCalendarChevron(calendar.querySelector('[data-calendar-prev]'), 'prev');
        renderDateCalendarChevron(calendar.querySelector('[data-calendar-next]'), 'next');
        calendar.querySelectorAll('.date-calendar-select-arrow').forEach(function (arrow) {
            renderDateCalendarChevron(arrow, 'down');
        });
    }

    function renderDateCalendarWeekdayText(container) {
        container.querySelectorAll('.date-calendar-weekday').forEach(function (weekday) {
            const text = weekday.dataset.calendarText || weekday.textContent.trim();
            renderElementText(weekday, {
                text,
                size: dateCalendarTextConfig.weekday.size,
                width: 30,
                height: dateCalendarTextConfig.weekday.height,
                y: 22,
                anchor: 'middle',
                x: 15,
                weight: dateCalendarTextConfig.weekday.weight
            });
        });
    }

    function renderDateCalendarOptionText(container) {
        container.querySelectorAll('.date-calendar-option').forEach(function (option) {
            const text = option.dataset.calendarText || option.textContent.trim();
            renderElementText(option, {
                text,
                size: dateCalendarTextConfig.option.size,
                width: Math.max(44, Math.min(124, measureTextWidth(text, dateCalendarTextConfig.option.size, dateCalendarTextConfig.option.weight) + 8)),
                height: dateCalendarTextConfig.option.height,
                y: 22,
                weight: dateCalendarTextConfig.option.weight
            });
            option.setAttribute('aria-label', text);
        });
    }

    function renderDateCalendarDayText(container) {
        container.querySelectorAll('.date-calendar-day').forEach(function (day) {
            const text = day.dataset.calendarText || day.textContent.trim();
            renderElementText(day, {
                text,
                size: dateCalendarTextConfig.day.size,
                width: 30,
                height: dateCalendarTextConfig.day.height,
                y: 22,
                anchor: 'middle',
                x: 15,
                weight: dateCalendarTextConfig.day.weight
            });
            day.setAttribute('aria-label', day.dataset.calendarDate || text);
        });
    }

    function closeDateCalendarMenus(calendar, activeType) {
        calendar.querySelectorAll('.date-calendar-picker').forEach(function (picker) {
            const isActive = Boolean(activeType && picker.dataset.calendarPicker === activeType);
            picker.classList.toggle('is-open', isActive);
            const menu = picker.querySelector('.date-calendar-menu');
            const button = picker.querySelector('.date-calendar-select');
            if (menu) menu.hidden = !isActive;
            if (button) button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    }

    function scrollDateCalendarMenuToSelected(picker) {
        const menu = picker.querySelector('.date-calendar-menu');
        const selected = picker.querySelector('.date-calendar-option.is-selected');
        if (!menu || !selected) return;

        menu.scrollTop = selected.offsetTop - (menu.clientHeight - selected.offsetHeight) / 2;
    }

    function toggleDateCalendarMenu(calendar, type) {
        const picker = calendar.querySelector(`[data-calendar-picker="${type}"]`);
        const isOpen = picker && picker.classList.contains('is-open');
        closeDateCalendarMenus(calendar, isOpen ? null : type);
        if (!isOpen && picker) scrollDateCalendarMenuToSelected(picker);
    }

    function ensureDateCalendar() {
        let calendar = document.querySelector('.date-calendar');
        const host = document.getElementById('zoomFrame') || document.body;
        if (calendar) {
            if (host && calendar.parentElement !== host) host.append(calendar);
            return calendar;
        }

        calendar = document.createElement('div');
        calendar.className = 'date-calendar';
        calendar.hidden = true;
        calendar.innerHTML = `
            <div class="date-calendar-header">
                <button class="date-calendar-nav" type="button" data-calendar-prev aria-label="Предыдущий месяц">‹</button>
                <div class="date-calendar-title">
                    <div class="date-calendar-picker" data-calendar-picker="month">
                        <button class="date-calendar-select" type="button" data-calendar-toggle="month" aria-expanded="false">
                            <span data-calendar-month-label></span>
                            <span class="date-calendar-select-arrow">⌄</span>
                        </button>
                        <div class="date-calendar-menu" data-calendar-month-menu hidden></div>
                    </div>
                    <div class="date-calendar-picker" data-calendar-picker="year">
                        <button class="date-calendar-select date-calendar-year" type="button" data-calendar-toggle="year" aria-expanded="false">
                            <span data-calendar-year-label></span>
                            <span class="date-calendar-select-arrow">⌄</span>
                        </button>
                        <div class="date-calendar-menu date-calendar-year-menu" data-calendar-year-menu hidden></div>
                    </div>
                </div>
                <button class="date-calendar-nav" type="button" data-calendar-next aria-label="Следующий месяц">›</button>
            </div>
            <div class="date-calendar-weekdays"></div>
            <div class="date-calendar-grid"></div>
        `;
        host.append(calendar);

        const weekdays = calendar.querySelector('.date-calendar-weekdays');
        weekdays.innerHTML = dateCalendarWeekdays
            .map(function (weekday) {
                return `<div class="date-calendar-weekday" data-calendar-text="${weekday}">${weekday}</div>`;
            })
            .join('');
        renderDateCalendarWeekdayText(weekdays);
        renderDateCalendarStaticBits(calendar);

        calendar.addEventListener('click', function (event) {
            event.stopPropagation();
            const prev = event.target.closest('[data-calendar-prev]');
            const next = event.target.closest('[data-calendar-next]');
            const toggle = event.target.closest('[data-calendar-toggle]');
            const option = event.target.closest('[data-calendar-option]');
            const day = event.target.closest('[data-calendar-date]');
            const calendar = event.currentTarget;

            if (toggle) {
                event.preventDefault();
                toggleDateCalendarMenu(calendar, toggle.dataset.calendarToggle);
                return;
            }

            if (option) {
                event.preventDefault();
                if (option.disabled) return;
                const currentDate = dateCalendarState.viewDate;
                const month = option.dataset.calendarOption === 'month'
                    ? Number(option.dataset.calendarValue)
                    : currentDate.getMonth();
                const year = option.dataset.calendarOption === 'year'
                    ? Number(option.dataset.calendarValue)
                    : currentDate.getFullYear();

                dateCalendarState.viewDate = new Date(year, month, 1);
                renderDateCalendar();
                positionDateCalendar(dateCalendarState.field);
                return;
            }

            if (prev || next) {
                event.preventDefault();
                if ((prev && prev.disabled) || (next && next.disabled)) return;
                closeDateCalendarMenus(calendar);
                const direction = prev ? -1 : 1;
                dateCalendarState.viewDate = new Date(
                    dateCalendarState.viewDate.getFullYear(),
                    dateCalendarState.viewDate.getMonth() + direction,
                    1
                );
                renderDateCalendar();
                positionDateCalendar(dateCalendarState.field);
                return;
            }

            if (day && dateCalendarState.field) {
                event.preventDefault();
                closeDateCalendarMenus(calendar);
                const selectedDate = parseDateValue(day.dataset.calendarDate);
                const input = dateCalendarState.field.querySelector('.date-input');
                const range = getDateRangeFields();
                const role = dateCalendarState.field.dataset.dateRole;
                if (role === 'to' && selectedDate && range.fromDate && isDateBefore(selectedDate, range.fromDate)) {
                    return;
                }
                if (selectedDate && input) {
                    input.value = formatDateDisplay(selectedDate);
                    renderDateValue(dateCalendarState.field);
                    syncDateRangeAfterSelection(dateCalendarState.field, selectedDate);
                    state.currentPage = 1;
                    renderLogTables();
                    closeDateCalendar();
                }
            }
        });

        return calendar;
    }

    function getDateCalendarPlacement(field, belowTop, calendarHeight, viewportHeight, viewportGap) {
        if (dateCalendarState.field === field && dateCalendarState.placement) {
            return dateCalendarState.placement;
        }

        const belowLimit = viewportHeight - viewportGap;
        const placement = belowTop + calendarHeight > belowLimit
            ? 'above'
            : 'below';

        if (dateCalendarState.field === field) {
            dateCalendarState.placement = placement;
        }

        return placement;
    }

    function positionDateCalendar(field, options) {
        const calendar = ensureDateCalendar();
        const frame = document.getElementById('zoomFrame');
        if (!field || !calendar) return;
        if (options && options.resetPlacement && dateCalendarState.field === field) {
            dateCalendarState.placement = null;
        }

        const rect = field.getBoundingClientRect();
        const gap = designPxToViewportPx(8);
        const viewportGap = designPxToViewportPx(12);
        const calendarWidth = calendar.offsetWidth;
        const calendarHeight = calendar.offsetHeight;

        if (frame) {
            const frameRect = frame.getBoundingClientRect();
            const frameScale = frameRect.width && frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
            const safeScale = frameScale || 1;
            const viewportDesignWidth = window.innerWidth / safeScale;
            const viewportDesignHeight = window.innerHeight / safeScale;

            let left = (rect.left - frameRect.left) / safeScale;
            const belowTop = (rect.bottom - frameRect.top) / safeScale + gap;
            const aboveTop = (rect.top - frameRect.top) / safeScale - calendarHeight - gap;
            const placement = getDateCalendarPlacement(
                field,
                belowTop,
                calendarHeight,
                viewportDesignHeight,
                viewportGap
            );
            let top = placement === 'above' ? aboveTop : belowTop;

            if (left + calendarWidth > viewportDesignWidth - viewportGap) {
                left = viewportDesignWidth - calendarWidth - viewportGap;
            }

            calendar.style.left = Math.round(Math.max(viewportGap, left)) + 'px';
            calendar.style.top = Math.round(Math.max(viewportGap, top)) + 'px';
            return;
        }

        let left = rect.left;
        const belowTop = rect.bottom + gap;
        const aboveTop = rect.top - calendarHeight - gap;
        const viewportGapPx = viewportGap;
        const placement = getDateCalendarPlacement(
            field,
            belowTop,
            calendarHeight,
            window.innerHeight,
            viewportGapPx
        );
        let top = placement === 'above' ? aboveTop : belowTop;

        if (left + calendarWidth > window.innerWidth - viewportGapPx) {
            left = window.innerWidth - calendarWidth - viewportGapPx;
        }

        calendar.style.left = Math.round(Math.max(viewportGapPx, left)) + 'px';
        calendar.style.top = Math.round(Math.max(viewportGapPx, top)) + 'px';
    }

    function renderDateCalendar() {
        const calendar = ensureDateCalendar();
        const field = dateCalendarState.field;
        if (!field || !dateCalendarState.viewDate) return;

        const input = field.querySelector('.date-input');
        const selectedDate = input ? parseDateValue(input.value) : null;
        const range = getDateRangeFields();
        const role = field.dataset.dateRole;
        const today = new Date();
        const viewDate = constrainDateCalendarViewDate(field, dateCalendarState.viewDate, range);
        dateCalendarState.viewDate = viewDate;
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const offset = (firstDay.getDay() + 6) % 7;
        const monthLabel = calendar.querySelector('[data-calendar-month-label]');
        const yearLabel = calendar.querySelector('[data-calendar-year-label]');
        const monthMenu = calendar.querySelector('[data-calendar-month-menu]');
        const yearMenu = calendar.querySelector('[data-calendar-year-menu]');
        const prevButton = calendar.querySelector('[data-calendar-prev]');
        const grid = calendar.querySelector('.date-calendar-grid');
        const prevViewDate = new Date(year, month - 1, 1);
        const isPrevDisabled = isDateCalendarMonthDisabled(
            role,
            range,
            prevViewDate.getFullYear(),
            prevViewDate.getMonth()
        );

        renderElementText(monthLabel, {
            text: dateCalendarMonthNames[month],
            size: dateCalendarTextConfig.select.size,
            width: 68,
            height: dateCalendarTextConfig.select.height,
            y: 22,
            weight: dateCalendarTextConfig.select.weight
        });
        renderElementText(yearLabel, {
            text: String(year),
            size: dateCalendarTextConfig.select.size,
            width: 48,
            height: dateCalendarTextConfig.select.height,
            y: 22,
            weight: dateCalendarTextConfig.select.weight
        });
        const monthToggle = calendar.querySelector('[data-calendar-toggle="month"]');
        const yearToggle = calendar.querySelector('[data-calendar-toggle="year"]');
        if (monthToggle) monthToggle.setAttribute('aria-label', `Выбрать месяц: ${dateCalendarMonthNames[month]}`);
        if (yearToggle) yearToggle.setAttribute('aria-label', `Выбрать год: ${year}`);
        prevButton.disabled = isPrevDisabled;
        prevButton.setAttribute('aria-disabled', isPrevDisabled ? 'true' : 'false');

        const monthMenuHtml = dateCalendarMonthNames
            .map(function (monthName, index) {
                const disabled = isDateCalendarMonthDisabled(role, range, year, index);
                const selected = !disabled && index === month ? ' is-selected' : '';
                const disabledClass = disabled ? ' is-disabled' : '';
                const disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';
                return `<button class="date-calendar-option${selected}${disabledClass}" type="button" data-calendar-option="month" data-calendar-value="${index}" data-calendar-text="${monthName}"${disabledAttr}>${monthName}</button>`;
            })
            .join('');
        if (monthMenu._calendarRenderKey !== monthMenuHtml) {
            monthMenu._calendarRenderKey = monthMenuHtml;
            monthMenu.innerHTML = monthMenuHtml;
            renderDateCalendarOptionText(monthMenu);
        }

        const years = [];
        const startYear = Math.min(dateCalendarStartYear, year);
        const endYear = Math.max(dateCalendarEndYear, year);
        for (let optionYear = startYear; optionYear <= endYear; optionYear++) {
            const disabled = isDateCalendarYearDisabled(role, range, optionYear);
            const selected = !disabled && optionYear === year ? ' is-selected' : '';
            const disabledClass = disabled ? ' is-disabled' : '';
            const disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';
            years.push(`<button class="date-calendar-option${selected}${disabledClass}" type="button" data-calendar-option="year" data-calendar-value="${optionYear}" data-calendar-text="${optionYear}"${disabledAttr}>${optionYear}</button>`);
        }
        const yearMenuHtml = years.join('');
        if (yearMenu._calendarRenderKey !== yearMenuHtml) {
            yearMenu._calendarRenderKey = yearMenuHtml;
            yearMenu.innerHTML = yearMenuHtml;
            renderDateCalendarOptionText(yearMenu);
        }
        closeDateCalendarMenus(calendar);

        const days = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
        const weekRows = totalCells / 7;
        calendar.style.setProperty('--date-calendar-week-rows', String(weekRows));
        calendar.style.setProperty('--date-calendar-grid-height', pxToVw(weekRows * 30 + Math.max(0, weekRows - 1) * 2));
        calendar.style.setProperty('--date-calendar-height', pxToVw(93 + weekRows * 32));
        for (let index = 0; index < totalCells; index++) {
            const date = new Date(year, month, 1 - offset + index);
            const classes = ['date-calendar-day'];
            const isDisabled = role === 'to' && range.fromDate && isDateBefore(date, range.fromDate);

            if (date.getMonth() !== month) classes.push('is-outside');
            if (isSameDate(date, today)) classes.push('is-today');
            if (!isDisabled && selectedDate && isSameDate(date, selectedDate)) classes.push('is-selected');
            if (isDisabled) classes.push('is-disabled');

            days.push(
                `<button class="${classes.join(' ')}" type="button" data-calendar-date="${getDateKey(date)}" data-calendar-text="${date.getDate()}"${isDisabled ? ' disabled aria-disabled="true"' : ''}>${date.getDate()}</button>`
            );
        }

        const daysHtml = days.join('');
        if (grid._calendarRenderKey !== daysHtml) {
            grid._calendarRenderKey = daysHtml;
            grid.innerHTML = daysHtml;
            renderDateCalendarDayText(grid);
        }
        lockScaleCriticalCarriers(calendar);
    }

    function openDateCalendar(field) {
        const input = field.querySelector('.date-input');
        if (!input) return;

        syncViewportMetrics();
        const calendar = ensureDateCalendar();
        if (dateCalendarState.field === field && !calendar.hidden) {
            positionDateCalendar(field);
            return;
        }

        const currentDate = parseDateValue(input.value) || new Date();
        const previousField = dateCalendarState.field;
        if (previousField && previousField !== field) {
            previousField.classList.remove('is-calendar-open');
        }

        dateCalendarState.field = field;
        dateCalendarState.viewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        dateCalendarState.placement = null;

        calendar.hidden = false;
        calendar.classList.remove('is-preparing');
        renderDateCalendar();
        positionDateCalendar(field, { resetPlacement: true });
        field.classList.add('is-calendar-open');
    }

    function closeDateCalendar() {
        const calendar = document.querySelector('.date-calendar');
        if (calendar) {
            closeDateCalendarMenus(calendar);
            calendar.classList.remove('is-preparing');
            calendar.hidden = true;
        }
        if (dateCalendarState.field) {
            dateCalendarState.field.classList.remove('is-calendar-open');
        }
        dateCalendarState.field = null;
        dateCalendarState.viewDate = null;
        dateCalendarState.placement = null;
    }

    function initDateCalendarGlobalHandlers() {
        if (document.documentElement.dataset.dateCalendarBound) return;
        document.documentElement.dataset.dateCalendarBound = 'true';

        document.addEventListener('click', function (event) {
            const calendar = document.querySelector('.date-calendar');
            const field = dateCalendarState.field;
            if (!field || !calendar) return;
            if (!field.contains(event.target) && !calendar.contains(event.target)) {
                closeDateCalendar();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeDateCalendar();
        });

        window.addEventListener('resize', function () {
            markViewportChanging();
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', markViewportChanging);
        }

        window.addEventListener('scroll', function () {
            if (dateCalendarState.field) positionDateCalendar(dateCalendarState.field);
        }, true);
    }

    function renderStaticText() {
        const title = document.querySelector('.page-title');
        if (title) {
            renderElementText(title, {
                size: 27,
                width: 380,
                height: 37,
                y: 29,
                weight: 400,
                color: '#62560E'
            });
        }

        document.querySelectorAll('.date-label').forEach(function (el) {
            renderElementText(el, {
                size: 21.6,
                width: 82,
                height: 26,
                y: 20,
                weight: 300,
                color: '#62560E'
            });
        });

        document.querySelectorAll('.log-count-label').forEach(function (el) {
            const text = el.dataset.text || el.textContent.trim();
            el.dataset.text = text;
            renderElementText(el, {
                text: text,
                size: 21.6,
                width: measureTextWidth(text, 21.6, 300) + 2,
                height: 26,
                y: 20,
                weight: 300,
                color: 'currentColor'
            });
        });

        document.querySelectorAll('.date-field').forEach(function (field) {
            renderDateValue(field);
            // Пересчитать позицию после загрузки шрифта Roboto, иначе ширина метки меряется fallback-шрифтом
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function () {
                    renderDateValue(field);
                });
            }
            const input = field.querySelector('.date-input');
            if (input && !input.dataset.svgDateBound) {
                input.dataset.svgDateBound = 'true';
                field.addEventListener('mousedown', function (event) {
                    if (event.button === 0) event.preventDefault();
                });
                field.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    openDateCalendar(field);
                });
                input.addEventListener('focus', function () {
                    if (dateCalendarState.field !== field) {
                        openDateCalendar(field);
                    }
                });
                input.addEventListener('input', function () {
                    renderDateValue(field);
                });
                input.addEventListener('change', function () {
                    renderDateValue(field);
                });
            }
        });
        initDateCalendarGlobalHandlers();

        renderFieldLabels();
        renderSelectValueText();
        renderSelectOptions();
        renderImportButtonText();
        renderSourceChoiceMenuText();
        renderFilePathValue();

        document.querySelectorAll('.check-label').forEach(function (el) {
            const text = el.dataset.text || el.textContent.trim();
            const isNthChild4 = el.closest('.check-field') && el.closest('.check-field').matches(':nth-child(4)');
            renderElementText(el, {
                text,
                size: 21.6,
                width: isNthChild4 ? 258 : 311,
                height: 26,
                y: 20,
                weight: 300,
                color: '#62560e'
            });
        });

        document.querySelectorAll('.nav-link').forEach(function (item) {
            renderNavIcon(item);
            renderNavText(item);
        });
        renderLogStaticText();
        renderStaticIcons(document);
        renderAllTooltips(document);
        lockScaleCriticalCarriers(document);
    }

    function buildFileIconHTML(iconType, downloadFilename, typeValue, rowIdx, options) {
        const cfg = FILE_ICON_CONFIG[iconType];
        if (!cfg) return '';
        const opts = options || {};
        const isUnavailable = Boolean(opts.unavailable);
        const typeAttr = !isUnavailable && typeValue !== undefined ? ` data-type="${esc(typeValue)}"` : '';
        const idxAttr = !isUnavailable && rowIdx !== undefined ? ` data-idx="${rowIdx}"` : '';
        const disabledAttr = isUnavailable ? ' disabled aria-disabled="true"' : '';
        const unavailableClass = isUnavailable ? ' is-unavailable' : '';
        const tooltipText = opts.tooltip !== undefined ? opts.tooltip : cfg.tooltip;

        return `
    <div class="icon-wrapper file-icon-wrapper">
        <button class="file-icon-btn${unavailableClass}" data-dl-name="${esc(downloadFilename)}" data-dl-type="${esc(iconType)}"${typeAttr}${idxAttr}${disabledAttr} title="">
            <i class="vi vi-${iconType}"></i>
        </button>
        ${tooltipText ? `<span class="tooltip">${esc(tooltipText)}</span>` : ''}
    </div>`;
    }

    function initImportCheckboxes() {
        const inputs = document.querySelectorAll('.check-field .check-input');
        const importAllInput = document.querySelector('[data-import-option="importAll"]') || inputs[0];
        const skipDupInput = document.querySelector('[data-import-option="skipDuplicateCheck"]') || inputs[1];
        if (!importAllInput || !skipDupInput) return;

        importAllInput.checked = false;
        skipDupInput.checked = false;

        function syncImportOptions() {
            state.importAll = !!importAllInput.checked;
            state.skipDuplicateCheck = !!skipDupInput.checked;
        }

        syncImportOptions();
        importAllInput.addEventListener('change', syncImportOptions);
        skipDupInput.addEventListener('change', syncImportOptions);
    }

    function applyImportOptionsToEntries(entries, options) {
        const out = entries.map(function (e) { return Object.assign({}, e); });
        const isLocked = function (entry) {
            if (!entry) return false;
            if (entry.locked) return true;
            const reason = String(entry.reason || '').toLowerCase();
            return /ошибка чтения|не удалось|не распознан|некоррект|не является|нет данных|не найден лист|broken zip|unsupported zip|invalid zip/.test(reason);
        };
        const isDuplicate = function (entry) {
            const text = String((entry && entry.reason) || '') + ' ' + String((entry && entry.name) || '');
            return /повтор|дубл|duplicate/i.test(text);
        };
        const toAdded = function (entry) {
            entry.statusClass = 'is-added';
            entry.status = 'Добавлено';
            delete entry.reason;
        };
        if (options.skipDuplicateCheck) {
            out.forEach(function (e) {
                if (!isLocked(e) && e.statusClass === 'is-skipped' && isDuplicate(e)) toAdded(e);
            });
        }
        if (options.importAll) {
            out.forEach(function (e) {
                if (!isLocked(e) && e.statusClass !== 'is-added') toAdded(e);
            });
        }
        return out;
    }

    function countImportEntries(entries) {
        return (entries || []).reduce(function (acc, entry) {
            if (entry.statusClass === 'is-added') acc.added++;
            else if (entry.statusClass === 'is-updated') acc.updated++;
            else if (entry.statusClass === 'is-skipped') acc.skipped++;
            return acc;
        }, { added: 0, updated: 0, skipped: 0 });
    }

    function syncRowCountFromEntries(row) {
        if (!row || !row.count || !row.importLog || !Array.isArray(row.importLog.entries)) return;
        const counts = countImportEntries(row.importLog.entries);
        row.count.added = counts.added;
        row.count.updated = counts.updated;
        row.count.skipped = counts.skipped;
    }

    async function generateLogRow(typeValue, filePath) {
        const cfg = typeConfig[typeValue];
        const { full: datetime } = getCurrentDatetime();
        const filename = state.isFolder
            ? deriveFolderImportName(cfg, filePath, datetime)
            : deriveImportFilename(cfg, filePath, datetime);
        const folderFiles = Array.isArray(state.pickedFolderFiles) ? state.pickedFolderFiles.slice() : [];
        const importLog = await analyzeImportSource(typeValue, filename, state.pickedFileObject, state.isFolder, folderFiles);

        const options = {
            importAll: !!state.importAll,
            skipDuplicateCheck: !!state.skipDuplicateCheck
        };
        const transformedEntries = applyImportOptionsToEntries(importLog.entries || [], options);
        const counts = countImportEntries(transformedEntries);
        importLog.entries = transformedEntries;
        importLog.added = counts.added;
        importLog.updated = counts.updated;
        importLog.skipped = counts.skipped;

        const base = getLastTypeTotal(typeValue);
        const count = {
            base,
            added: counts.added,
            updated: counts.updated,
            skipped: counts.skipped,
            sourceTotal: importLog.sourceTotal,
            total: base + counts.added
        };

        return {
            datetime,
            count,
            filename,
            logFilename: `${filename}.html`,
            isFolder: state.isFolder,
            fileObject: state.pickedFileObject,
            folderFiles,
            folderName: state.pickedFolderName,
            importLog,
            options,
            sourceMode: importLog.sourceMode || (state.isFolder ? 'folder-picker' : state.pickedFileObject ? 'file-picker' : 'manual-path'),
            status: 'loaded'
        };
    }

    function makeMockFile(name, content, type) {
        try {
            return new File([content], name, {
                type: type || 'text/plain',
                lastModified: Date.now()
            });
        } catch (error) {
            const blob = new Blob([content], { type: type || 'text/plain' });
            blob.name = name;
            blob.lastModified = Date.now();
            return blob;
        }
    }

    function makeMockEntries(prefix, total) {
        const cityNames = ['Ташкент', 'Самарканд', 'Бухара', 'Навои', 'Фергана'];

        return Array.from({ length: total }, function (_, index) {
            const rowNum = index + 1;
            if (rowNum % 6 === 0) {
                return makeImportEntry(index, [
                    `${prefix} ${rowNum}`,
                    '+9989011122' + rowNum,
                    cityNames[index % cityNames.length],
                    'повтор найден'
                ], 'skipped', 'Найден повтор по телефону');
            }
            if (rowNum % 4 === 0) {
                return makeImportEntry(index, [
                    `${prefix} ${rowNum}`,
                    '+9989011122' + rowNum,
                    cityNames[index % cityNames.length],
                    'обновить карточку'
                ], 'updated', '');
            }
            return makeImportEntry(index, [
                `${prefix} ${rowNum}`,
                '+9989011122' + rowNum,
                cityNames[index % cityNames.length]
            ], 'added', '');
        });
    }

    function makeMockImportLog(format, filename, entries, notes, sourceMode) {
        const counts = countImportEntries(entries);

        return {
            format,
            sourceMode,
            filename,
            sourceTotal: entries.length,
            added: counts.added,
            updated: counts.updated,
            skipped: counts.skipped,
            entries,
            notes: notes || []
        };
    }

    function makeMockRow(typeValue, options) {
        const cfg = typeConfig[typeValue];
        const opts = options || {};
        const entries = makeMockEntries(opts.entryPrefix || cfg.tableTitle, opts.entries || 8);
        const counts = countImportEntries(entries);
        const filename = opts.filename || `mock-${typeValue}.${cfg.fileExt}`;
        const isFolder = Boolean(opts.isFolder);
        const sourceMode = opts.sourceMode || (isFolder ? 'folder-picker' : 'file-picker');
        const folderFiles = isFolder
            ? (opts.folderFiles || [
                makeMockFile(`mock-1.${cfg.fileExt}`, `mock ${cfg.fileExt} 1`, 'text/plain'),
                makeMockFile(`mock-2.${cfg.fileExt}`, `mock ${cfg.fileExt} 2`, 'text/plain'),
                makeMockFile(`mock-3.${cfg.fileExt}`, `mock ${cfg.fileExt} 3`, 'text/plain')
            ])
            : [];

        return {
            datetime: opts.datetime || '06.05.2026 02:13',
            count: {
                base: 0,
                added: counts.added,
                updated: counts.updated,
                skipped: counts.skipped,
                sourceTotal: entries.length,
                total: counts.added
            },
            filename,
            logFilename: `${filename}.html`,
            isFolder,
            fileObject: isFolder ? null : makeMockFile(filename, `mock source for ${filename}`, 'text/plain'),
            folderFiles,
            folderName: opts.folderName || (isFolder ? filename : ''),
            importLog: makeMockImportLog(cfg.type, filename, entries, opts.notes, sourceMode),
            options: {
                importAll: Boolean(opts.importAll),
                skipDuplicateCheck: Boolean(opts.skipDuplicateCheck)
            },
            sourceMode,
            rollbackDate: opts.rollbackDate || '',
            status: opts.status || 'loaded'
        };
    }

    function loadMockData() {
        state.logsByType = {
            'xlsx-links': [
                makeMockRow('xlsx-links', {
                    datetime: '06.05.2026 02:13',
                    filename: 'Downloads',
                    folderName: 'Downloads',
                    isFolder: true,
                    entries: 12,
                    entryPrefix: 'Ссылка объявления',
                    importAll: true,
                    notes: ['Моковая папка XLSX: проверка трех иконок скачивания и hover underline.']
                }),
                makeMockRow('xlsx-links', {
                    datetime: '06.05.2026 02:09',
                    filename: 'very-long-xlsx-links-file-name-for-hover-underline-and-tooltip-check.xlsx',
                    entries: 7,
                    entryPrefix: 'Длинный XLSX',
                    skipDuplicateCheck: true
                })
            ],
            'xml-ads': Array.from({length: 100}, (_, i) => makeMockRow('xml-ads', {
            datetime: '06.05.2026 02:10',
            filename: `mock_xml_file_${100 - i}.xml`,
            entries: 1000 + Math.floor(Math.random() * 5000),
            entryPrefix: 'XML объявление'
        })),
            'docx-hh': [
                makeMockRow('docx-hh', {
                    datetime: '05.05.2026 18:42',
                    filename: 'hh_resume_pack.docx',
                    entries: 6,
                    entryPrefix: 'Резюме HH',
                    sourceMode: 'manual-path',
                    notes: [MANUAL_SOURCE_NOTE_TEXT]
                })
            ]
        };
        state.logTypeOrder = ['xlsx-links', 'xml-ads', 'docx-hh'];
        Object.keys(state.logsByType).forEach(recalculateTypeTotals);
        renderLogTables();
        attachLogAreaHandlers();
    }

    function buildDownloadCellHTML(row, typeValue, rowIdx) {
        const cfg = typeConfig[typeValue];
        let html = buildFileIconHTML('html', row.logFilename, typeValue, rowIdx);
        if (row.sourceMode === 'manual-path') {
            html += buildFileIconHTML(cfg.type, row.filename, typeValue, rowIdx);
            return `<div class="download-icons">${html}</div>`;
        }
        const folderFiles = Array.isArray(row.folderFiles) ? row.folderFiles : [];

        if (row.isFolder && folderFiles.length) {
            const ext = cfg.fileExt.toLowerCase();
            const zipFilename = new RegExp('\\.' + ext + '$', 'i').test(row.filename)
                ? row.filename.replace(new RegExp('\\.' + ext + '$', 'i'), '.zip')
                : `${row.filename}.zip`;
            const typeFilename = new RegExp('\\.' + ext + '$', 'i').test(row.filename)
                ? row.filename
                : `${row.filename}.${ext}`;
            html += buildFileIconHTML(cfg.type, typeFilename, typeValue, rowIdx, {
                tooltip: `Скачать оригинальный файл ${ext}`
            });
            html += buildFileIconHTML('zip', zipFilename, typeValue, rowIdx, {
                tooltip: `Скачать несколько файлов ${ext} в архиве zip`
            });
        } else if (cfg.type === 'xml') {
            html += buildFileIconHTML('xml', row.filename, typeValue, rowIdx);
        } else if (cfg.type === 'xlsx') {
            html += buildFileIconHTML('xlsx', row.filename, typeValue, rowIdx);
        } else if (cfg.type === 'docx') {
            html += buildFileIconHTML('docx', row.filename, typeValue, rowIdx);
        }
        const compactClass = row.isFolder && folderFiles.length ? ' is-compact' : '';
        return `<div class="download-icons${compactClass}">${html}</div>`;
    }

    function buildRowHTML(row, rowNum, rowIdx, typeValue) {
        const isLoaded = row.status === 'loaded';
        const isRolledBack = row.status === 'rolled_back';

        let countAddedHTML = '';
        let countUpdatedHTML = '';

        if (isLoaded) {
            const addedVal = row.count.added || 0;
            countAddedHTML = `<span class="count-added">+${addedVal}</span>`;
            countUpdatedHTML = `<span class="count-updated" style="visibility:hidden" aria-hidden="true">-0</span>`;
        } else if (isRolledBack) {
            const rolledBackAmount = row.count.added || 0;
            countAddedHTML = `<span class="count-added">+${rolledBackAmount}</span>`;
            countUpdatedHTML = `<span class="count-updated">-${rolledBackAmount}</span>`;
        }

        const totalDisplay = isRolledBack ? row.count.base : row.count.total;

        const statusHTML = isLoaded
            ? `<span class="status-loaded">Загружено</span>`
            : `<span class="status-rolled">Откат ${esc(row.rollbackDate)}</span>`;

        // const rollbackTooltip = `Отменить данный импорт`;
        const rollbackHTML = isLoaded
            ? `
    <div class="icon-wrapper rollback-wrapper">
        <button class="rollback-btn" data-type="${esc(typeValue)}" data-idx="${rowIdx}" title="">
            <i class="vi vi-rollback"></i>
        </button>
        <span class="tooltip">Отменить данный импорт</span>
    </div>`
            : `
    <div class="rollback-done">
        <i class="vi vi-warning warning-icon"></i>
    </div>`;

        const deleteHTML = `
    <div class="icon-wrapper delete-wrapper">
        <button class="delete-btn" data-type="${esc(typeValue)}" data-idx="${rowIdx}" title="">
            <i class="vi vi-delete"></i>
        </button>
        <span class="tooltip">Удалить лог</span>
    </div>`;

        const [date, time] = row.datetime.split(/\s+/);
        const datetimeText = `${date}\u00A0\u00A0${time || ''}`;

        const filenameText = row.filename;
        const filenameClass = row.status === 'loaded' ? 'filename-link' : 'filename-link filename-rolled';
        const filenameHTML = `<a href="#" class="${filenameClass}" data-type="${esc(typeValue)}" data-idx="${rowIdx}" data-full-text="${esc(filenameText)}" aria-label="${esc(filenameText)}">${esc(filenameText)}</a>`;
        const downloadCellAttrs = row.isFolder && row.folderFiles && row.folderFiles.length ? ' style="padding-left:0;padding-right:0"' : '';

        return `
    <td class="col-num">${rowNum}</td>
    <td class="col-datetime datetime-cell"><span class="datetime-value">${esc(datetimeText)}</span></td>
    <td class="col-count">
        <div class="count-cell">
            <span class="count-base">${row.count.base}</span>
            <span class="count-deltas">${countAddedHTML}${countUpdatedHTML}</span>
            <span class="count-total">=${totalDisplay}</span>
        </div>
    </td>
    <td class="col-filename">${filenameHTML}</td>
    <td class="col-download"${downloadCellAttrs}>${buildDownloadCellHTML(row, typeValue, rowIdx)}</td>
    <td class="col-status">${statusHTML}</td>
    <td class="col-rollback">${rollbackHTML}</td>
    <td class="col-delete">${deleteHTML}</td>`;
    }

    function renderLogTables() {
        const logArea = document.getElementById('logArea');
        const bottomStripe = logArea && logArea.closest('.bottom-stripe');
        if (!logArea) return;

        logArea.innerHTML = '';

        // const visibleSections = [];
        let hasSourceRows = false;
        let allRows = [];

        for (const typeValue of state.logTypeOrder) {
        const rows = state.logsByType[typeValue];
        if (!rows || rows.length === 0) continue;
        hasSourceRows = true;
        const filteredRows = getFilteredRows(rows).slice().reverse();
        if (filteredRows.length === 0) continue;
        filteredRows.forEach((item, index) => {
            allRows.push({ typeValue, item, originalIndexInType: index });
        });
    }

    const totalItems = allRows.length;
    const countSpan = document.getElementById('totalLogsCount');
    if (countSpan) {
        const text = String(totalItems);
        countSpan.dataset.text = text;
        renderElementText(countSpan, {
            text: text,
            size: 21.6,
            width: measureTextWidth(text, 21.6, 400) + 2,
            height: 26,
            y: 20,
            weight: 400,
            color: 'currentColor'
        });
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    renderPagination(totalItems);

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedRows = allRows.slice(startIndex, startIndex + state.itemsPerPage);

    const groupedVisible = {};
    for (const { typeValue, item, originalIndexInType } of paginatedRows) {
        if (!groupedVisible[typeValue]) groupedVisible[typeValue] = [];
        groupedVisible[typeValue].push({ item, originalIndexInType });
    }

    const visibleTypes = Object.keys(groupedVisible);
    const showTitles = visibleTypes.length >= 2;
    const hasVisibleRows = visibleTypes.length > 0;
    
    logArea.classList.toggle('log-area--multi', showTitles);
    logArea.classList.toggle('log-area--single', hasVisibleRows && !showTitles);
    logArea.classList.toggle('log-area--filtered-empty', hasSourceRows && !hasVisibleRows);

    let globalRowCounter = startIndex + 1;

    for (const typeValue of visibleTypes) {
        const typeFilteredRows = groupedVisible[typeValue];
        const cfg = typeConfig[typeValue];
        const section = document.createElement('div');
        section.className = 'log-section';
        section.classList.toggle('has-title', showTitles);
        section.dataset.type = typeValue;

        if (showTitles) {
            const title = document.createElement('h2');
            title.className = 'log-title';
            title.textContent = `Импорт  ${cfg.tableTitle}`;
            section.appendChild(title);
        }

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'log-table-wrapper';

        const table = document.createElement('table');
        table.className = 'log-table';
        table.innerHTML = `
    <colgroup>
    <col class="col-num"><col class="col-datetime"><col class="col-count">
    <col class="col-filename"><col class="col-download"><col class="col-status">
    <col class="col-rollback"><col class="col-delete">
    </colgroup>
    <thead><tr>
    <th class="col-num">№</th>
    <th class="col-datetime">ДАТА И ВРЕМЯ</th>
    <th class="col-count">${esc(cfg.colLabel)}</th>
    <th class="col-filename">ИМЯ ФАЙЛА ИЗ КОТОРОГО ИДЕТ ИМПОРТ</th>
    <th class="col-download">СКАЧАТЬ</th>
    <th class="col-status">СТАТУС</th>
    <th class="col-rollback">ОТКАТ</th>
    <th class="col-delete">DELETE</th>
    </tr></thead>
    <tbody></tbody>`;

             const tbody = table.querySelector('tbody');
        typeFilteredRows.forEach(({ item, originalIndexInType }) => {
            const tr = document.createElement('tr');
            tr.innerHTML = buildRowHTML(item.row, globalRowCounter++, item.originalIndex, typeValue);
            tbody.appendChild(tr);
        });

            tableWrapper.appendChild(table);
            section.appendChild(tableWrapper);
            logArea.appendChild(section);
        }

        if (hasSourceRows && !hasVisibleRows) {
            const empty = document.createElement('div');
            empty.className = 'log-empty-state';
            empty.textContent = 'Нет данных за выбранный период';
            logArea.appendChild(empty);
        }

        if (bottomStripe) {
            bottomStripe.classList.toggle('is-empty', !hasSourceRows);
            bottomStripe.classList.toggle('has-log-titles', showTitles);
        }

        renderLogStaticText();
        adjustCountColumnWidth();
        // Шрифт Roboto может быть ещё не загружен — пересчитать ширину текста после загрузки
        if (document.fonts && document.fonts.ready && !renderLogTables._fontReadyBound) {
            renderLogTables._fontReadyBound = true;
            document.fonts.ready.then(function () {
                renderLogStaticText();
                adjustCountColumnWidth();
            });
        }
    }
    function renderPagination(totalItems) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    container.innerHTML = '';
    const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;

    const createBtn = (text, isDisabled, isActive, isTextBtn) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (isTextBtn) btn.classList.add('page-text-btn');
        if (isActive) btn.classList.add('active');
        btn.disabled = isDisabled;
        
        const span = document.createElement('span');
        btn.appendChild(span);
        
        renderElementText(span, {
            text: String(text),
            size: 21.6,
            width: measureTextWidth(String(text), 21.6, isActive ? 400 : 300) + 2,
            height: 26,
            y: 20,
            weight: isActive ? 400 : 300,
            color: 'currentColor'
        });
        
        return btn;
    };

    const firstBtn = createBtn('First', state.currentPage === 1, false, true);
    firstBtn.addEventListener('click', () => {
        state.currentPage = 1;
        renderLogTables();
        attachLogAreaHandlers();
    });
    container.appendChild(firstBtn);

    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, state.currentPage + 2);

    if (state.currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    }
    if (state.currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = createBtn(String(i), false, i === state.currentPage, false);
        if (i !== state.currentPage) {
            btn.addEventListener('click', () => {
                state.currentPage = i;
                renderLogTables();
                attachLogAreaHandlers();
            });
        }
        container.appendChild(btn);
    }

    if (endPage < totalPages) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        const elSpan = document.createElement('span');
        ellipsis.appendChild(elSpan);
        container.appendChild(ellipsis);
        
        renderElementText(elSpan, {
            text: '...',
            size: 21.6,
            width: measureTextWidth('...', 21.6, 300) + 2,
            height: 26,
            y: 20,
            weight: 300,
            color: 'currentColor'
        });
        
        const lastBtn = createBtn(String(totalPages), false, false, false);
        lastBtn.addEventListener('click', () => {
            state.currentPage = totalPages;
            renderLogTables();
            attachLogAreaHandlers();
        });
        container.appendChild(lastBtn);
    }

    const nextBtn = createBtn('Next', state.currentPage >= totalPages, false, true);
    nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderLogTables();
            attachLogAreaHandlers();
        }
    });
    container.appendChild(nextBtn);
}


    // Вычисляет реально нужную ширину колонки "КОЛИЧЕСТВО" по самому широкому ряду
    // и расширяет колонку, если 186px не хватает (за счёт колонки "ИМЯ ФАЙЛА")
    function adjustCountColumnWidth() {
        const BASE_WIDTH_PX = 186;
        const BASE_LEFT_PX = 8.69952;
        const BASE_TO_DELTAS_GAP_PX = 2;
        const DELTAS_TO_TOTAL_GAP_PX = 8;
        const RIGHT_PAD_PX = 10;
        function getCountTextWidth(element, size) {
            if (!element) return 0;
            const text = element.dataset.text || element.getAttribute('aria-label') || element.textContent.trim();
            return measureTextWidth(text, size, 300);
        }

        const tables = document.querySelectorAll('.log-table');
        tables.forEach(function (table) {
            let maxNeededPx = BASE_WIDTH_PX;
            const cellMetrics = [];

            table.querySelectorAll('.count-cell').forEach(function (cell) {
                const baseEl = cell.querySelector('.count-base');
                const deltasEl = cell.querySelector('.count-deltas');
                const totalEl = cell.querySelector('.count-total');

                const basePx = getCountTextWidth(baseEl, 21);
                let deltasPx = 0;
                if (deltasEl) {
                    deltasEl.querySelectorAll(':scope > *').forEach(function (c) {
                        const w = getCountTextWidth(c, 18);
                        if (w > deltasPx) deltasPx = w;
                    });
                }

                const totalPx = getCountTextWidth(totalEl, 21);
                const deltasLeftPx = BASE_LEFT_PX + basePx + BASE_TO_DELTAS_GAP_PX;
                const totalLeftPx = deltasLeftPx + deltasPx + DELTAS_TO_TOTAL_GAP_PX;

                cellMetrics.push({ cell, deltasLeftPx, totalLeftPx, totalPx });
            });

            cellMetrics.forEach(function (item) {
                const neededPx = item.totalLeftPx + item.totalPx + RIGHT_PAD_PX;

                item.cell.style.setProperty('--count-deltas-left', pxToVw(item.deltasLeftPx));
                item.cell.style.setProperty('--count-total-left', pxToVw(item.totalLeftPx));
                if (neededPx > maxNeededPx) maxNeededPx = neededPx;
            });

            table.style.setProperty('--col-count-width', pxToVw(maxNeededPx));
        });
    }

    function triggerGeneratedDownload(filename, iconType, fileObject) {
        if (!fileObject || iconType === 'html') {
            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
            return;
        }
        const blobSource = fileObject;
        const url  = URL.createObjectURL(blobSource);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadBlob(filename, blob) {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function getFileRelativePath(file) {
        return file.webkitRelativePath || file.__relativePath || file.name;
    }

    function makeCrc32Table() {
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let crc = i;
            for (let bit = 0; bit < 8; bit++) {
                crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
            }
            table[i] = crc >>> 0;
        }
        return table;
    }

    const CRC32_TABLE = makeCrc32Table();

    function crc32(bytes) {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < bytes.length; i++) {
            crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function writeUint16LE(target, offset, value) {
        target[offset] = value & 0xFF;
        target[offset + 1] = (value >>> 8) & 0xFF;
    }

    function writeUint32LE(target, offset, value) {
        target[offset] = value & 0xFF;
        target[offset + 1] = (value >>> 8) & 0xFF;
        target[offset + 2] = (value >>> 16) & 0xFF;
        target[offset + 3] = (value >>> 24) & 0xFF;
    }

    function dateToDosParts(date) {
        const year = Math.max(1980, date.getFullYear());
        const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
        const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
        return { dosTime, dosDate };
    }

    async function createStoredZip(files) {
        const encoder = new TextEncoder();
        const localParts = [];
        const centralParts = [];
        let offset = 0;

        for (const file of files) {
            const safePath = getFileRelativePath(file).replace(/\\/g, '/').replace(/^\/+/, '');
            const nameBytes = encoder.encode(safePath || file.name);
            const data = new Uint8Array(await file.arrayBuffer());
            const crc = crc32(data);
            const { dosTime, dosDate } = dateToDosParts(new Date(file.lastModified || Date.now()));

            const localHeader = new Uint8Array(30 + nameBytes.length);
            writeUint32LE(localHeader, 0, 0x04034B50);
            writeUint16LE(localHeader, 4, 20);
            writeUint16LE(localHeader, 6, 0x0800);
            writeUint16LE(localHeader, 8, 0);
            writeUint16LE(localHeader, 10, dosTime);
            writeUint16LE(localHeader, 12, dosDate);
            writeUint32LE(localHeader, 14, crc);
            writeUint32LE(localHeader, 18, data.length);
            writeUint32LE(localHeader, 22, data.length);
            writeUint16LE(localHeader, 26, nameBytes.length);
            localHeader.set(nameBytes, 30);

            const centralHeader = new Uint8Array(46 + nameBytes.length);
            writeUint32LE(centralHeader, 0, 0x02014B50);
            writeUint16LE(centralHeader, 4, 20);
            writeUint16LE(centralHeader, 6, 20);
            writeUint16LE(centralHeader, 8, 0x0800);
            writeUint16LE(centralHeader, 10, 0);
            writeUint16LE(centralHeader, 12, dosTime);
            writeUint16LE(centralHeader, 14, dosDate);
            writeUint32LE(centralHeader, 16, crc);
            writeUint32LE(centralHeader, 20, data.length);
            writeUint32LE(centralHeader, 24, data.length);
            writeUint16LE(centralHeader, 28, nameBytes.length);
            writeUint32LE(centralHeader, 42, offset);
            centralHeader.set(nameBytes, 46);

            localParts.push(localHeader, data);
            centralParts.push(centralHeader);
            offset += localHeader.length + data.length;
        }

        const centralOffset = offset;
        const centralSize = centralParts.reduce(function (sum, part) { return sum + part.length; }, 0);
        const end = new Uint8Array(22);
        writeUint32LE(end, 0, 0x06054B50);
        writeUint16LE(end, 8, files.length);
        writeUint16LE(end, 10, files.length);
        writeUint32LE(end, 12, centralSize);
        writeUint32LE(end, 16, centralOffset);

        return new Blob(localParts.concat(centralParts, [end]), { type: MIME_TYPES.zip });
    }

    async function createStoredZipFromEntries(entries, mimeType) {
        const encoder = new TextEncoder();
        const localParts = [];
        const centralParts = [];
        let offset = 0;

        for (const entry of entries) {
            const safePath = String(entry.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
            if (!safePath) continue;
            const nameBytes = encoder.encode(safePath);
            const data = entry.data instanceof Uint8Array
                ? entry.data
                : encoder.encode(String(entry.data || ''));
            const crc = crc32(data);
            const { dosTime, dosDate } = dateToDosParts(new Date(entry.lastModified || Date.now()));

            const localHeader = new Uint8Array(30 + nameBytes.length);
            writeUint32LE(localHeader, 0, 0x04034B50);
            writeUint16LE(localHeader, 4, 20);
            writeUint16LE(localHeader, 6, 0x0800);
            writeUint16LE(localHeader, 8, 0);
            writeUint16LE(localHeader, 10, dosTime);
            writeUint16LE(localHeader, 12, dosDate);
            writeUint32LE(localHeader, 14, crc);
            writeUint32LE(localHeader, 18, data.length);
            writeUint32LE(localHeader, 22, data.length);
            writeUint16LE(localHeader, 26, nameBytes.length);
            localHeader.set(nameBytes, 30);

            const centralHeader = new Uint8Array(46 + nameBytes.length);
            writeUint32LE(centralHeader, 0, 0x02014B50);
            writeUint16LE(centralHeader, 4, 20);
            writeUint16LE(centralHeader, 6, 20);
            writeUint16LE(centralHeader, 8, 0x0800);
            writeUint16LE(centralHeader, 10, 0);
            writeUint16LE(centralHeader, 12, dosTime);
            writeUint16LE(centralHeader, 14, dosDate);
            writeUint32LE(centralHeader, 16, crc);
            writeUint32LE(centralHeader, 20, data.length);
            writeUint32LE(centralHeader, 24, data.length);
            writeUint16LE(centralHeader, 28, nameBytes.length);
            writeUint32LE(centralHeader, 42, offset);
            centralHeader.set(nameBytes, 46);

            localParts.push(localHeader, data);
            centralParts.push(centralHeader);
            offset += localHeader.length + data.length;
        }

        const centralOffset = offset;
        const centralSize = centralParts.reduce(function (sum, part) { return sum + part.length; }, 0);
        const end = new Uint8Array(22);
        writeUint32LE(end, 0, 0x06054B50);
        writeUint16LE(end, 8, centralParts.length);
        writeUint16LE(end, 10, centralParts.length);
        writeUint32LE(end, 12, centralSize);
        writeUint32LE(end, 16, centralOffset);

        return new Blob(localParts.concat(centralParts, [end]), { type: mimeType || MIME_TYPES.zip });
    }

    async function triggerFolderZipDownload(filename, files) {
        const validFiles = (files || []).filter(function (file) {
            return file && file.name;
        });
        if (!validFiles.length) {
            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
            return;
        }
        const zipBlob = await createStoredZip(validFiles);
        downloadBlob(filename, zipBlob);
    }

    function formatFileSize(bytes) {
        if (!Number.isFinite(bytes)) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    function formatFileDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return '';
        return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function buildLogEntries(row, typeValue) {
        if (row.importLog && Array.isArray(row.importLog.entries) && row.importLog.entries.length > 0) {
            return row.importLog.entries;
        }
        return [];
    }

    function renderLogEntryRows(entries) {
        return entries.map(function (entry, index) {
            const statusColor = entry.statusClass === 'is-added'
                ? '#27ae60'
                : entry.statusClass === 'is-skipped'
                ? '#446DCC'
                : entry.statusClass === 'is-manual'
                ? '#62560E'
                : '#e67e22';
            const reason = entry.reason ? `<div style="color:#446DCC">Причина: ${esc(entry.reason)}</div>` : '';
            return `<tr><td>${index + 1}</td><td>${esc(entry.name)}${reason}</td><td style="color:${statusColor}">${esc(entry.status)}</td></tr>`;
        }).join('');
    }

    function isManualPathRow(row) {
        return row && (row.sourceMode === 'manual-path' || (row.importLog && row.importLog.sourceMode === 'manual-path'));
    }

    function generateHtmlLog(row, typeValue) {
        const cfg = typeConfig[typeValue];
        const logEntries = buildLogEntries(row, typeValue);
        const addedRows = logEntries.filter(function (entry) { return entry.statusClass === 'is-added'; });
        const updatedRows = logEntries.filter(function (entry) { return entry.statusClass === 'is-updated'; });
        const skippedRows = logEntries.filter(function (entry) { return entry.statusClass === 'is-skipped'; });
        const isManualPath = isManualPathRow(row);
        const sourceTotal = row.count.sourceTotal !== undefined ? row.count.sourceTotal : logEntries.length;
        const sourceLine = isManualPath
            ? `<div>Режим импорта: manual-path</div><div>Ручной путь: ${esc(row.filename)}</div><div>${esc(MANUAL_SOURCE_NOTE_TEXT)}</div>`
            : `<div>Всего в ${esc(cfg.fileExt)} файле ${esc(cfg.entityIn || 'записей')}: ${sourceTotal}</div>`;
        const notes = row.importLog && row.importLog.notes && row.importLog.notes.length
            ? `<div class="note">${row.importLog.notes.map(esc).join('<br>')}</div>`
            : '';
        const statusText = row.status === 'rolled_back' ? `Откат ${row.rollbackDate}` : 'Загружено';
        return `<!DOCTYPE html>
    <html lang="ru">
    <head>
    <meta charset="UTF-8">
    <title>Лог импорта — ${esc(row.filename)}</title>
    <style>
    body { font-family: monospace; font-size: 13px; color: #333; margin: 20px; line-height: 1.25; }
    h2 { margin: 0 0 10px; color: #62560E; font-family: Arial, sans-serif; }
    .note { margin: 10px 0; color: #8A7F52; font-family: Arial, sans-serif; }
    .section { margin-top: 14px; }
    .section-title { font-weight: 700; }
    .record { margin-top: 3px; }
    .reason { color: #446DCC; }
    .added { color: #333; }
    .updated { color: #8A6A00; }
    </style>
    </head>
    <body>
    <h2>Лог импорта</h2>
    <div>Создан лог файла «${esc(row.logFilename)}»</div>
    <div>Дата и время: ${esc(row.datetime)}</div>
    <div>Тип импорта: ${esc(cfg.tableTitle)}</div>
    <div>Статус: ${esc(statusText)}</div>
    ${sourceLine}
    ${notes}
    <div class="section">
    <div class="section-title">Настройки импорта:</div>
    <div class="record">- Все импортировать объявления: ${row.options && row.options.importAll ? 'включено' : 'выключено'}</div>
    <div class="record">- Не проверять на повторы: ${row.options && row.options.skipDuplicateCheck ? 'включено' : 'выключено'}</div>
    </div>
    <div class="section">
    <div class="section-title">Количество добавленных в приложение ${esc(cfg.entity || 'записей')}: ${addedRows.length}</div>
    ${addedRows.map(function (entry, index) {
        return `<div class="record added">${index + 1}. ${esc(entry.name)}</div>`;
    }).join('')}
    </div>
    <div class="section">
    <div class="section-title">Количество обновленных в приложении ${esc(cfg.entity || 'записей')}: ${updatedRows.length}</div>
    ${updatedRows.map(function (entry, index) {
        return `<div class="record updated">${index + 1}. ${esc(entry.name)}</div>`;
    }).join('')}
    </div>
    <div class="section">
    <div class="section-title">Количество не добавленных в приложение ${esc(cfg.entity || 'записей')}: ${skippedRows.length}</div>
    ${skippedRows.map(function (entry, index) {
        const reason = entry.reason ? `<div class="reason">Причина: ${esc(entry.reason)}</div>` : '';
        return `<div class="record">${index + 1}. ${esc(entry.name)}${reason}</div>`;
    }).join('')}
    </div>
    </body>
    </html>`;
    }

    function getLogPreviewElements() {
        return {
            overlay: document.getElementById('logPreviewOverlay'),
            title: document.getElementById('logPreviewTitle'),
            close: document.getElementById('logPreviewClose'),
            meta: document.getElementById('logPreviewMeta'),
            source: document.getElementById('logPreviewSource'),
            summary: document.getElementById('logPreviewSummary'),
            rows: document.getElementById('logPreviewRows')
        };
    }

    let logPreviewSessionId = 0;

    function buildLogPreviewSummary(row, typeValue, entries) {
        const cfg = typeConfig[typeValue];
        const addedRows = entries.filter(function (entry) { return entry.statusClass === 'is-added'; });
        const updatedRows = entries.filter(function (entry) { return entry.statusClass === 'is-updated'; });
        const skippedRows = entries.filter(function (entry) { return entry.statusClass === 'is-skipped'; });
        const manualRows = entries.filter(function (entry) { return entry.statusClass === 'is-manual'; });
        const sourceTotal = row.count.sourceTotal !== undefined ? row.count.sourceTotal : entries.length;
        const sourceLine = isManualPathRow(row)
            ? `<div class="log-preview-summary-line">Режим импорта: manual-path</div>
    <div class="log-preview-summary-line">Ручной путь: ${esc(row.filename)}</div>
    <div class="log-preview-summary-line">${esc(MANUAL_SOURCE_NOTE_TEXT)}</div>`
            : `<div class="log-preview-summary-line">Всего в ${esc(cfg.fileExt)} файле ${esc(cfg.entityIn || 'записей')}: ${sourceTotal}</div>`;

        return `
    <div class="log-preview-summary-line">Создан лог файла «${esc(row.logFilename)}»</div>
    ${sourceLine}
    <div class="log-preview-summary-section">
        <strong>Настройки импорта:</strong>
        <span>- Все импортировать объявления: ${row.options && row.options.importAll ? 'включено' : 'выключено'}</span>
        <span>- Не проверять на повторы: ${row.options && row.options.skipDuplicateCheck ? 'включено' : 'выключено'}</span>
    </div>
    ${manualRows.length ? `<div class="log-preview-summary-section"><strong>manual-path log</strong>${manualRows.map(function (entry) {
            const reason = entry.reason ? `<em>${esc(entry.reason)}</em>` : '';
            return `<span>${esc(entry.name)}${reason}</span>`;
        }).join('')}</div>` : ''}
    <div class="log-preview-summary-section">
        <strong>Количество добавленных в приложение ${esc(cfg.entity || 'записей')}: ${addedRows.length}</strong>
        ${addedRows.slice(0, 6).map(function (entry, index) {
            return `<span>${index + 1}. ${esc(entry.name)}</span>`;
        }).join('')}
    </div>
    <div class="log-preview-summary-section">
        <strong>Количество обновленных в приложении ${esc(cfg.entity || 'записей')}: ${updatedRows.length}</strong>
        ${updatedRows.slice(0, 6).map(function (entry, index) {
            return `<span>${index + 1}. ${esc(entry.name)}</span>`;
        }).join('')}
    </div>
    <div class="log-preview-summary-section">
        <strong>Количество не добавленных в приложение ${esc(cfg.entity || 'записей')}: ${skippedRows.length}</strong>
        ${skippedRows.slice(0, 8).map(function (entry, index) {
            const reason = entry.reason ? `<em>Причина: ${esc(entry.reason)}</em>` : '';
            return `<span>${index + 1}. ${esc(entry.name)}${reason}</span>`;
        }).join('')}
    </div>`;
    }

    function renderLogPreviewRows(entries) {
        return entries.map(function (entry, index) {
            const reason = entry.reason ? `<div class="log-preview-reason">Причина: ${esc(entry.reason)}</div>` : '';
            return `
    <tr>
        <td>${index + 1}</td>
        <td>${esc(entry.name)}${reason}</td>
        <td><span class="log-preview-status ${esc(entry.statusClass)}">${esc(entry.status)}</span></td>
    </tr>`;
        }).join('');
    }

    function buildLogPreviewMeta(row, typeValue) {
        const cfg = typeConfig[typeValue];
        const totalDisplay = row.status === 'rolled_back' ? row.count.base : row.count.total;
        const rollbackText = row.status === 'rolled_back' ? `Откат ${row.rollbackDate}` : 'Загружено';
        const meta = isManualPathRow(row) ? [
            ['Файл', row.filename],
            ['Тип', cfg.tableTitle],
            ['Дата', row.datetime],
            ['Статус', rollbackText],
            ['Режим', 'manual-path'],
            ['После импорта', totalDisplay],
            ['Добавлено', row.status === 'rolled_back' ? '+0' : `+${row.count.added}`],
            ['Обновлено', row.status === 'rolled_back' ? '0' : (row.count.updated || 0)],
            ['Не добавлено', row.status === 'rolled_back' ? '0' : (row.count.skipped || 0)]
        ] : [
            ['Файл', row.filename],
            ['Тип', cfg.tableTitle],
            ['Дата', row.datetime],
            ['Статус', rollbackText],
            ['Всего в файле', row.count.sourceTotal !== undefined ? row.count.sourceTotal : totalDisplay],
            ['После импорта', totalDisplay],
            ['Добавлено', row.status === 'rolled_back' ? '+0' : `+${row.count.added}`],
            ['Обновлено', row.status === 'rolled_back' ? '0' : (row.count.updated || 0)],
            ['Не добавлено', row.status === 'rolled_back' ? '0' : (row.count.skipped || 0)]
        ];

        if (row.fileObject) {
            meta.push(['Размер файла', formatFileSize(row.fileObject.size)]);
            meta.push(['Изменен', formatFileDate(row.fileObject.lastModified)]);
        }
        if (row.folderFiles && row.folderFiles.length) {
            meta.push([`Файлов ${cfg.fileExt.toUpperCase()}`, row.folderFiles.length]);
            meta.push(['Папка', row.folderName || 'Выбранная папка']);
        }

        return meta.map(function ([label, value]) {
            const displayValue = value === 0 ? '0' : String(value || '');
            return `<div class="log-preview-meta-item"><span>${esc(label)}</span><strong>${esc(displayValue)}</strong></div>`;
        }).join('');
    }

    function renderXmlSourcePreview(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');
        if (doc.querySelector('parsererror')) {
            return '<div class="log-preview-source-note">XML файл выбран, но структура не распознана браузером.</div>';
        }

        const elements = Array.from(doc.querySelectorAll('*'))
            .filter(function (node) {
                return node.children.length === 0 && node.textContent.trim().length > 0;
            })
            .slice(0, 20);

        if (elements.length === 0) {
            return '<div class="log-preview-source-note">XML файл выбран, но текстовых полей для просмотра нет.</div>';
        }

        return `
    <div class="log-preview-source-title">Данные XML файла</div>
    <table class="log-preview-source-table">
        <thead><tr><th>#</th><th>Тег</th><th>Значение</th></tr></thead>
        <tbody>
            ${elements.map(function (node, index) {
                return `<tr><td>${index + 1}</td><td>${esc(node.tagName)}</td><td>${esc(node.textContent.trim().slice(0, 160))}</td></tr>`;
            }).join('')}
        </tbody>
    </table>`;
    }

    function updateRealFilePreview(row, typeValue, sessionId) {
        const cfg = typeConfig[typeValue];
        const { source } = getLogPreviewElements();
        if (!source) return;
        const isCurrentPreview = function () {
            return sessionId === logPreviewSessionId;
        };

        if (row.folderFiles && row.folderFiles.length) {
            if (!isCurrentPreview()) return;
            const notes = row.importLog && row.importLog.notes && row.importLog.notes.length
                ? row.importLog.notes.map(esc).join('<br>')
                : `Папка выбрана; обработано ${cfg.fileExt.toUpperCase()} файлов: ${row.folderFiles.length}.`;
            source.innerHTML = `<div class="log-preview-source-note">${notes}</div>`;
            lockScaleCriticalHtmlText(source);
            return;
        }

        if (!row.fileObject) {
            if (!isCurrentPreview()) return;
            const note = row.importLog && row.importLog.notes && row.importLog.notes.length
                ? row.importLog.notes.map(esc).join('<br>')
                : MANUAL_SOURCE_NOTE_TEXT;
            source.innerHTML = `<div class="log-preview-source-note">${note}</div>`;
            lockScaleCriticalHtmlText(source);
            return;
        }

        if (cfg.type !== 'xml') {
            if (!isCurrentPreview()) return;
            source.innerHTML = row.importLog && row.importLog.notes && row.importLog.notes.length
                ? `<div class="log-preview-source-note">${row.importLog.notes.map(esc).join('<br>')}</div>`
                : '';
            lockScaleCriticalHtmlText(source);
            return;
        }

        if (!isCurrentPreview()) return;
        source.innerHTML = '<div class="log-preview-source-note">Чтение XML файла...</div>';
        lockScaleCriticalHtmlText(source);
        row.fileObject.text()
            .then(function (text) {
                if (!isCurrentPreview()) return;
                source.innerHTML = renderXmlSourcePreview(text);
                lockScaleCriticalHtmlText(source);
            })
            .catch(function () {
                if (!isCurrentPreview()) return;
                source.innerHTML = '<div class="log-preview-source-note">Не удалось прочитать XML файл.</div>';
                lockScaleCriticalHtmlText(source);
            });
    }

    function closeLogPreview() {
        const { overlay } = getLogPreviewElements();
        if (!overlay) return;
        logPreviewSessionId += 1;
        overlay.hidden = true;
        document.documentElement.classList.remove('log-preview-open');
        document.body.classList.remove('log-preview-open');
    }

    function initLogPreview() {
        const { overlay, close } = getLogPreviewElements();
        if (!overlay) return;

        if (close) {
            close.addEventListener('click', closeLogPreview);
        }

        const closeWrapper = close && close.closest('.preview-close-wrapper');
        if (closeWrapper) {
            closeWrapper.addEventListener('mouseover', function () {
                const tooltip = closeWrapper.querySelector('.tooltip');
                if (tooltip) positionTooltipByElement(tooltip, closeWrapper);
            });
            closeWrapper.addEventListener('mouseout', function (event) {
                if (!closeWrapper.contains(event.relatedTarget)) {
                    hideTooltip(closeWrapper.querySelector('.tooltip'));
                }
            });
        }

        overlay.addEventListener('mousedown', function (event) {
            if (event.target === overlay) closeLogPreview();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !overlay.hidden) closeLogPreview();
        });
    }

    function openHtmlLog(row, typeValue) {
        const { overlay, title, meta, source, summary, rows } = getLogPreviewElements();
        if (!overlay || !title || !meta || !source || !summary || !rows) return;
        const sessionId = ++logPreviewSessionId;
        const entries = buildLogEntries(row, typeValue);

        title.textContent = `Лог импорта — ${row.filename}`;
        meta.innerHTML = buildLogPreviewMeta(row, typeValue);
        source.innerHTML = '';
        summary.innerHTML = buildLogPreviewSummary(row, typeValue, entries);
        rows.innerHTML = renderLogPreviewRows(entries);
        lockScaleCriticalHtmlText(overlay);
        lockScaleCriticalCarriers(overlay);

        overlay.hidden = false;
        document.documentElement.classList.add('log-preview-open');
        document.body.classList.add('log-preview-open');
        updateRealFilePreview(row, typeValue, sessionId);
    }

    function openHtmlLogInBrowser(row, typeValue) {
        const html = generateHtmlLog(row, typeValue);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, '_blank', 'noopener');

        if (!opened) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 60000);
    }

    function updateImportButtonText() {
    const btn = document.getElementById('importBtn');
    if (!btn) return;

    let text = 'Начать Импорт из XML';
    btn.classList.remove('has-type');
    renderImportButtonText(text);
}

    function renderFilepathLabel(text) {
        const filepathLabel = document.getElementById('filepathLabel');
        if (!filepathLabel) return;
        const labelWidth = Math.max(330, measureTextWidth(text, 21.6, 300) + 4);

        renderElementText(filepathLabel, {
            text,
            size: 21.6,
            width: labelWidth,
            height: 26,
            y: 20,
            weight: 300,
            color: '#82752e'
        });
    }

    function getPathExtension(value) {
        const trimmed = stripQueryHash(value);
        if (/[\\/]$/.test(trimmed)) return '';
        const filename = trimmed.replace(/[\\/]+$/, '').split(/[/\\]/).pop();
        const match = filename.match(/\.([^.]+)$/);
        return match ? match[1].toLowerCase() : '';
    }

    function isManualFolderPath(value) {
        const trimmed = stripQueryHash(value);
        return trimmed.length > 0 && (/[\\/]$/.test(trimmed) || !getPathExtension(trimmed));
    }

    function stripQueryHash(value) {
        return String(value || '').trim().replace(/[?#].*$/, '');
    }

    function buildGeneratedFilename(cfg, datetime) {
        const stamp = String(datetime || '')
            .replace(/\s+/g, '_')
            .replace(/[^\d_]/g, '');
        return `import_${cfg.value}_${stamp}.${cfg.fileExt}`;
    }

    function deriveImportFilename(cfg, filePath, datetime) {
        const trimmed = stripQueryHash(filePath);
        if (!trimmed) return buildGeneratedFilename(cfg, datetime);

        const normalized = trimmed.replace(/[\\/]+$/, '');
        let filename = normalized.split(/[/\\]/).pop() || buildGeneratedFilename(cfg, datetime);
        if (!getPathExtension(filename)) {
            filename += '.' + cfg.fileExt;
        } else if (!filename.toLowerCase().endsWith('.' + cfg.fileExt)) {
            filename += '.' + cfg.fileExt;
        }
        return filename;
    }

    function deriveFolderImportName(cfg, filePath, datetime) {
        const trimmed = stripQueryHash(filePath);
        if (!trimmed) {
            return buildGeneratedFilename(cfg, datetime).replace(/\.[^.]+$/, '');
        }

        const normalized = trimmed.replace(/[\\/]+$/, '');
        return normalized.split(/[/\\]/).pop() || 'Выбранная папка';
    }

    function getRowCurrentTotal(row) {
        if (!row) return 0;
        return row.status === 'rolled_back' ? row.count.base : row.count.total;
    }

    function getLastTypeTotal(typeValue) {
        const rows = state.logsByType[typeValue] || [];
        if (rows.length === 0) return 0;
        return getRowCurrentTotal(rows[rows.length - 1]);
    }

    function recalculateTypeTotals(typeValue) {
        const rows = state.logsByType[typeValue] || [];
        let runningTotal = 0;
        for (const row of rows) {
            if (!row || !row.count) continue;
            syncRowCountFromEntries(row);
            row.count.base = runningTotal;
            if (row.status === 'rolled_back') {
                row.count.total = runningTotal;
            } else {
                row.count.total = runningTotal + (row.count.added || 0);
                runningTotal = row.count.total;
            }
        }
    }

    function makeImportEntry(index, fields, status, reason, meta) {
        const text = fields
            .filter(function (value) { return String(value || '').trim().length > 0; })
            .join(', ');
        const statusClass = status === 'skipped'
            ? 'is-skipped'
            : status === 'updated'
            ? 'is-updated'
            : 'is-added';
        return Object.assign({
            name: text || `Запись ${index + 1}`,
            status: status === 'skipped' ? 'Не добавлено' : status === 'updated' ? 'Обновлено' : 'Добавлено',
            statusClass,
            reason: reason || ''
        }, meta || {});
    }

    function detectImportStatus(fields) {
        const text = fields.join(' ').toLowerCase();
        const skippedMatchers = [
            'причина',
            'не добав',
            'неактуаль',
            'не актуаль',
            'повтор',
            'дубл',
            'ошибка',
            'error',
            'invalid',
            'skip',
            'отказ'
        ];
        if (skippedMatchers.some(function (word) { return text.includes(word); })) {
            const explicitReason = fields.find(function (value) {
                return /причина|reason/i.test(value);
            });
            const reason = explicitReason || fields.find(function (value) {
                return /неактуаль|не актуаль|дубл|ошибка|error|invalid|skip|отказ/i.test(value);
            }) || 'Причина не добавления указана в файле';
            return { status: 'skipped', reason };
        }
        if (/обнов|update|updated/i.test(text)) {
            return { status: 'updated', reason: '' };
        }
        return { status: 'added', reason: '' };
    }

    function makeAnalysisResult(format, filename, entries, notes) {
        const added = entries.filter(function (entry) { return entry.statusClass === 'is-added'; }).length;
        const updated = entries.filter(function (entry) { return entry.statusClass === 'is-updated'; }).length;
        const skipped = entries.filter(function (entry) { return entry.statusClass === 'is-skipped'; }).length;
        return {
            format,
            filename,
            sourceTotal: entries.length,
            added,
            updated,
            skipped,
            entries,
            notes: notes || []
        };
    }

    function makeManualPathAnalysis(format, filename, isFolder) {
        return {
            format: 'manual-path',
            sourceMode: 'manual-path',
            filename,
            sourceTotal: 0,
            added: 0,
            updated: 0,
            skipped: 0,
            entries: [
                {
                    name: filename,
                    status: 'manual-path log',
                    statusClass: 'is-manual',
                    reason: NO_REAL_SOURCE_MESSAGE,
                    locked: true
                }
            ],
            notes: [
                NO_REAL_SOURCE_MESSAGE,
                MANUAL_SOURCE_NOTE_TEXT
            ]
        };
    }

    function getLeafTextValues(node) {
        const values = [];
        Array.from(node.attributes || []).forEach(function (attr) {
            if (attr.value && attr.value.trim()) values.push(`${attr.name}: ${attr.value.trim()}`);
        });
        Array.from(node.querySelectorAll('*')).forEach(function (child) {
            if (child.children.length === 0 && child.textContent.trim()) {
                values.push(`${child.tagName}: ${child.textContent.trim()}`);
            }
        });
        if (values.length === 0 && node.textContent.trim()) values.push(node.textContent.trim());
        return values;
    }

    function findXmlRecordNodes(doc) {
        const candidates = Array.from(doc.querySelectorAll('*')).filter(function (node) {
            if (node === doc.documentElement) return false;
            const leafCount = getLeafTextValues(node).length;
            if (leafCount < 2) return false;
            const siblings = node.parentElement
                ? Array.from(node.parentElement.children).filter(function (child) { return child.tagName === node.tagName; }).length
                : 0;
            return siblings > 1 || /item|offer|vacancy|resume|ad|object|row|record|phone|site|company/i.test(node.tagName);
        });

        if (candidates.length === 0) return [];

        const byTag = candidates.reduce(function (acc, node) {
            acc[node.tagName] = acc[node.tagName] || [];
            acc[node.tagName].push(node);
            return acc;
        }, {});
        return Object.keys(byTag)
            .map(function (tag) { return byTag[tag]; })
            .sort(function (a, b) { return b.length - a.length; })[0];
    }

    function analyzeXmlText(xmlText, filename) {
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (doc.querySelector('parsererror')) {
            return makeAnalysisResult('xml', filename, [
                makeImportEntry(0, [filename, 'XML не распознан'], 'skipped', 'Ошибка чтения XML', { locked: true })
            ], ['XML файл выбран, но структура не распознана браузером.']);
        }

        const records = findXmlRecordNodes(doc);
        const sourceNodes = records.length > 0
            ? records
            : Array.from(doc.documentElement ? doc.documentElement.children : []).filter(function (node) {
                return node.textContent.trim().length > 0;
            });
        const entries = sourceNodes.map(function (node, index) {
            const fields = getLeafTextValues(node).slice(0, 8);
            const detected = detectImportStatus(fields);
            return makeImportEntry(index, fields, detected.status, detected.reason);
        });

        return makeAnalysisResult('xml', filename, entries, records.length ? [] : ['Для XML применен общий режим чтения: отдельные записи определены по дочерним узлам.']);
    }

    async function inflateRaw(bytes) {
        if (bytes.length === 0) return new Uint8Array();
        if (typeof DecompressionStream === 'undefined') {
            throw new Error('DecompressionStream is not supported');
        }
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    }

    async function readZipEntries(file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const entries = {};
        const decoder = new TextDecoder('utf-8');

        function getEntryData(filename, method, compressedSize, localOffset) {
            if (localOffset + 30 > bytes.length) {
                throw new Error('Broken ZIP local header');
            }
            const localSignature = view.getUint32(localOffset, true);
            if (localSignature !== 0x04034b50) {
                throw new Error('Broken ZIP local signature');
            }
            const filenameLength = view.getUint16(localOffset + 26, true);
            const extraLength = view.getUint16(localOffset + 28, true);
            const dataStart = localOffset + 30 + filenameLength + extraLength;
            const compressed = bytes.slice(dataStart, dataStart + compressedSize);
            return { filename, method, compressed };
        }

        let eocdOffset = -1;
        for (let i = bytes.length - 22; i >= 0 && i >= bytes.length - 66000; i--) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i;
                break;
            }
        }

        if (eocdOffset >= 0) {
            const totalEntries = view.getUint16(eocdOffset + 10, true);
            const centralOffset = view.getUint32(eocdOffset + 16, true);
            let centralPos = centralOffset;
            const zipItems = [];

            for (let index = 0; index < totalEntries && centralPos + 46 <= bytes.length; index++) {
                if (view.getUint32(centralPos, true) !== 0x02014b50) break;
                const method = view.getUint16(centralPos + 10, true);
                const compressedSize = view.getUint32(centralPos + 20, true);
                const filenameLength = view.getUint16(centralPos + 28, true);
                const extraLength = view.getUint16(centralPos + 30, true);
                const commentLength = view.getUint16(centralPos + 32, true);
                const localOffset = view.getUint32(centralPos + 42, true);
                const filenameStart = centralPos + 46;
                const filename = decoder.decode(bytes.slice(filenameStart, filenameStart + filenameLength));
                zipItems.push(getEntryData(filename, method, compressedSize, localOffset));
                centralPos = filenameStart + filenameLength + extraLength + commentLength;
            }

            for (const item of zipItems) {
                let content;
                if (item.method === 0) {
                    content = item.compressed;
                } else if (item.method === 8) {
                    content = await inflateRaw(item.compressed);
                } else {
                    throw new Error('Unsupported ZIP compression method: ' + item.method);
                }
                entries[item.filename] = decoder.decode(content);
            }

            return entries;
        }

        let offset = 0;
        let localEntriesRead = 0;

        while (offset + 30 <= bytes.length) {
            const signature = view.getUint32(offset, true);
            if (signature !== 0x04034b50) break;

            const flags = view.getUint16(offset + 6, true);
            const method = view.getUint16(offset + 8, true);
            const compressedSize = view.getUint32(offset + 18, true);
            const filenameLength = view.getUint16(offset + 26, true);
            const extraLength = view.getUint16(offset + 28, true);
            const filenameStart = offset + 30;
            const filename = decoder.decode(bytes.slice(filenameStart, filenameStart + filenameLength));
            const dataStart = filenameStart + filenameLength + extraLength;

            if (flags & 0x08) {
                throw new Error('ZIP data descriptor is not supported');
            }

            const compressed = bytes.slice(dataStart, dataStart + compressedSize);
            let content;
            if (method === 0) {
                content = compressed;
            } else if (method === 8) {
                content = await inflateRaw(compressed);
            } else {
                throw new Error('Unsupported ZIP compression method: ' + method);
            }

            entries[filename] = decoder.decode(content);
            localEntriesRead++;
            offset = dataStart + compressedSize;
        }

        if (localEntriesRead === 0) {
            throw new Error('Файл не является корректным ZIP архивом');
        }

        return entries;
    }

    function getElementsByLocalName(root, localName) {
        if (!root) return [];
        return Array.from(root.getElementsByTagName('*')).filter(function (node) {
            return node.localName === localName;
        });
    }

    function getFirstByLocalName(root, localName) {
        return getElementsByLocalName(root, localName)[0] || null;
    }

    function parseSharedStrings(xml) {
        if (!xml) return [];
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        return getElementsByLocalName(doc, 'si').map(function (si) {
            return getElementsByLocalName(si, 't').map(function (t) { return t.textContent; }).join('');
        });
    }

    function parseXlsxRows(sheetXml, sharedStrings) {
        const doc = new DOMParser().parseFromString(sheetXml || '', 'application/xml');
        return getElementsByLocalName(doc, 'row').map(function (row) {
            return getElementsByLocalName(row, 'c').map(function (cell) {
                const value = getFirstByLocalName(cell, 'v');
                const inlineNode = getFirstByLocalName(cell, 'is');
                const inline = inlineNode ? getFirstByLocalName(inlineNode, 't') : null;
                if (inline) return inline.textContent.trim();
                if (!value) return '';
                const raw = value.textContent.trim();
                return cell.getAttribute('t') === 's' ? (sharedStrings[Number(raw)] || '') : raw;
            }).filter(function (value) { return String(value).trim().length > 0; });
        }).filter(function (row) { return row.length > 0; });
    }

    function looksLikeTaskListXlsx(rows) {
        const header = ((rows && rows[0]) || []).join(' ').toLowerCase();
        const taskHeaderMatches = [
            'номер пп',
            'краткая суть',
            'подробнее',
            'статус готовности',
            'приоритет',
            'правки после',
            'постановка от подрядчика'
        ];
        return taskHeaderMatches.filter(function (word) {
            return header.includes(word);
        }).length >= 2;
    }

    function createDocxParagraph(text, options) {
        const opts = options || {};
        const bold = opts.bold ? '<w:b/>' : '';
        const spacing = opts.after ? `<w:spacing w:after="${opts.after}"/>` : '';
        return `<w:p><w:pPr>${spacing}</w:pPr><w:r><w:rPr>${bold}</w:rPr><w:t xml:space="preserve">${esc(cleanXmlText(text || ''))}</w:t></w:r></w:p>`;
    }

    function createDocxPageBreak() {
        return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    }

    function extractDocxTextBlocks(documentXml) {
        const doc = new DOMParser().parseFromString(documentXml || '', 'application/xml');
        const body = getFirstByLocalName(doc, 'body');
        const blocks = [];
        if (!body) return blocks;

        Array.from(body.children || []).forEach(function (node) {
            if (node.localName === 'p') {
                const text = getElementsByLocalName(node, 't').map(function (t) {
                    return t.textContent;
                }).join('').trim();
                if (text) blocks.push(text);
            } else if (node.localName === 'tbl') {
                getElementsByLocalName(node, 'tr').forEach(function (row) {
                    const cells = getElementsByLocalName(row, 'tc').map(function (cell) {
                        return getElementsByLocalName(cell, 't').map(function (t) {
                            return t.textContent;
                        }).join(' ').trim();
                    }).filter(Boolean);
                    if (cells.length) blocks.push(cells.join(' | '));
                });
            }
        });

        return blocks;
    }

    async function createMergedDocxBlob(files, title) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.docx$/i.test(file.name);
        });
        const parts = [
            createDocxParagraph(title || 'Объединенный DOCX', { bold: true, after: 240 })
        ];

        for (let index = 0; index < validFiles.length; index++) {
            const file = validFiles[index];
            if (index > 0) parts.push(createDocxPageBreak());
            parts.push(createDocxParagraph(file.name, { bold: true, after: 180 }));

            try {
                const entries = await readZipEntries(file);
                const blocks = extractDocxTextBlocks(entries['word/document.xml']);
                if (blocks.length) {
                    blocks.forEach(function (block) {
                        parts.push(createDocxParagraph(block));
                    });
                } else {
                    parts.push(createDocxParagraph('Текстовое содержимое не найдено.'));
                }
            } catch (error) {
                parts.push(createDocxParagraph('Не удалось прочитать DOCX: ' + error.message));
            }
        }

        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${parts.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
        const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
        const relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

        return createStoredZipFromEntries([
            { path: '[Content_Types].xml', data: contentTypes },
            { path: '_rels/.rels', data: relationships },
            { path: 'word/document.xml', data: documentXml }
        ], MIME_TYPES.docx);
    }

    async function triggerMergedDocxDownload(filename, files) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.docx$/i.test(file.name);
        });
        if (!validFiles.length) {
            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
            return;
        }
        const docxBlob = await createMergedDocxBlob(validFiles, filename.replace(/\.docx$/i, ''));
        downloadBlob(filename, docxBlob);
    }

    function createXmlCdata(text) {
        return '<![CDATA[' + cleanXmlText(text || '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
    }

    async function createMergedXmlBlob(files, title) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.xml$/i.test(file.name);
        });
        const serializer = new XMLSerializer();
        const parts = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            `<merged-files name="${esc(title || 'merged.xml')}">`
        ];

        for (const file of validFiles) {
            parts.push(`<file name="${esc(file.name)}">`);
            try {
                const text = await file.text();
                const doc = new DOMParser().parseFromString(text || '', 'application/xml');
                const hasParseError = getElementsByLocalName(doc, 'parsererror').length > 0;
                if (hasParseError || !doc.documentElement) {
                    parts.push('<parse-error>XML не удалось разобрать</parse-error>');
                    parts.push(`<content>${createXmlCdata(text)}</content>`);
                } else {
                    parts.push(serializer.serializeToString(doc.documentElement));
                }
            } catch (error) {
                parts.push(`<parse-error>${esc(error.message)}</parse-error>`);
            }
            parts.push('</file>');
        }

        parts.push('</merged-files>');
        return new Blob([parts.join('\n')], { type: MIME_TYPES.xml + ';charset=utf-8' });
    }

    async function triggerMergedXmlDownload(filename, files) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.xml$/i.test(file.name);
        });
        if (!validFiles.length) {
            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
            return;
        }
        const xmlBlob = await createMergedXmlBlob(validFiles, filename);
        downloadBlob(filename, xmlBlob);
    }

    function cleanXmlText(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    }

    function getXlsxColumnName(index) {
        let col = '';
        let n = index;
        while (n > 0) {
            const mod = (n - 1) % 26;
            col = String.fromCharCode(65 + mod) + col;
            n = Math.floor((n - 1) / 26);
        }
        return col || 'A';
    }

    function createXlsxCell(value, rowIndex, colIndex) {
        const ref = getXlsxColumnName(colIndex) + rowIndex;
        return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(cleanXmlText(value))}</t></is></c>`;
    }

    function createXlsxRow(values, rowIndex) {
        const cells = (values || []).map(function (value, index) {
            return createXlsxCell(value, rowIndex, index + 1);
        }).join('');
        return `<row r="${rowIndex}">${cells}</row>`;
    }

    function getXlsxColumnIndex(ref) {
        const match = String(ref || '').match(/^([A-Z]+)/i);
        if (!match) return 0;
        return match[1].toUpperCase().split('').reduce(function (sum, letter) {
            return sum * 26 + letter.charCodeAt(0) - 64;
        }, 0);
    }

    function getXlsxCellText(cell, sharedStrings) {
        const value = getFirstByLocalName(cell, 'v');
        const inlineNode = getFirstByLocalName(cell, 'is');
        const inline = inlineNode ? getFirstByLocalName(inlineNode, 't') : null;
        if (inline) return inline.textContent.trim();
        if (!value) return '';
        const raw = value.textContent.trim();
        return cell.getAttribute('t') === 's' ? (sharedStrings[Number(raw)] || '') : raw;
    }

    function parseXlsxRowsForMerge(sheetXml, sharedStrings) {
        const doc = new DOMParser().parseFromString(sheetXml || '', 'application/xml');
        return getElementsByLocalName(doc, 'row').map(function (row) {
            const values = [];
            let nextCol = 1;
            getElementsByLocalName(row, 'c').forEach(function (cell) {
                const explicitCol = getXlsxColumnIndex(cell.getAttribute('r'));
                const colIndex = explicitCol || nextCol;
                values[colIndex - 1] = getXlsxCellText(cell, sharedStrings);
                nextCol = colIndex + 1;
            });
            return values.map(function (value) {
                return value === undefined ? '' : value;
            });
        }).filter(function (row) {
            return row.some(function (value) { return String(value).trim().length > 0; });
        });
    }

    async function createMergedXlsxBlob(files, title) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.xlsx$/i.test(file.name);
        });
        const sheetRows = [];
        let rowIndex = 1;

        function appendRow(values) {
            sheetRows.push(createXlsxRow(values, rowIndex));
            rowIndex++;
        }

        appendRow(['Объединенный XLSX', title || 'merged.xlsx']);
        appendRow([]);

        for (const file of validFiles) {
            appendRow(['Файл', file.name]);
            try {
                const entries = await readZipEntries(file);
                const sharedStrings = parseSharedStrings(entries['xl/sharedStrings.xml']);
                const sheetName = Object.keys(entries).find(function (name) {
                    return /^xl\/worksheets\/sheet\d+\.xml$/i.test(name);
                });
                if (!sheetName) {
                    appendRow(['Ошибка', 'В XLSX не найден лист с данными']);
                } else {
                    const rows = parseXlsxRowsForMerge(entries[sheetName], sharedStrings);
                    if (rows.length) {
                        rows.forEach(function (row) {
                            appendRow(row);
                        });
                    } else {
                        appendRow(['Данные не найдены']);
                    }
                }
            } catch (error) {
                appendRow(['Ошибка чтения XLSX', error.message]);
            }
            appendRow([]);
        }

        const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows.join('')}</sheetData></worksheet>`;
        const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Merged" sheetId="1" r:id="rId1"/></sheets></workbook>`;
        const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
        const relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
        const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

        return createStoredZipFromEntries([
            { path: '[Content_Types].xml', data: contentTypes },
            { path: '_rels/.rels', data: relationships },
            { path: 'xl/workbook.xml', data: workbookXml },
            { path: 'xl/_rels/workbook.xml.rels', data: workbookRels },
            { path: 'xl/worksheets/sheet1.xml', data: sheetXml }
        ], MIME_TYPES.xlsx);
    }

    async function triggerMergedXlsxDownload(filename, files) {
        const validFiles = (files || []).filter(function (file) {
            return file && /\.xlsx$/i.test(file.name);
        });
        if (!validFiles.length) {
            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
            return;
        }
        const xlsxBlob = await createMergedXlsxBlob(validFiles, filename.replace(/\.xlsx$/i, ''));
        downloadBlob(filename, xlsxBlob);
    }

    async function analyzeXlsxFile(file, filename) {
        try {
            const entries = await readZipEntries(file);
            const sharedStrings = parseSharedStrings(entries['xl/sharedStrings.xml']);
            const sheetName = Object.keys(entries).find(function (name) {
                return /^xl\/worksheets\/sheet\d+\.xml$/i.test(name);
            });
            if (!sheetName) {
                throw new Error('В XLSX не найден лист с данными');
            }
            const rows = parseXlsxRows(entries[sheetName], sharedStrings);
            if (rows.length === 0) {
                return makeAnalysisResult('xlsx', filename, [
                    makeImportEntry(0, [filename, 'В XLSX не найдено строк данных'], 'skipped', 'Нет данных для импорта', { locked: true })
                ], ['XLSX файл прочитан, но строки данных не найдены.']);
            }
            if (looksLikeTaskListXlsx(rows)) {
                return makeAnalysisResult('xlsx', filename, [
                    makeImportEntry(0, [filename, 'Файл похож на таблицу задач, а не на файл импорта'], 'skipped', 'Неверный формат XLSX для выбранного типа импорта', { locked: true })
                ], ['XLSX прочитан, но его заголовки похожи на таблицу задач, а не на файл импорта.']);
            }
            const dataRows = rows.length > 1 ? rows.slice(1) : rows;
            const logEntries = dataRows.map(function (fields, index) {
                const detected = detectImportStatus(fields);
                return makeImportEntry(index, fields.slice(0, 8), detected.status, detected.reason);
            });
            return makeAnalysisResult('xlsx', filename, logEntries, []);
        } catch (error) {
            return makeAnalysisResult('xlsx', filename, [
                makeImportEntry(0, [filename, 'XLSX выбран, но содержимое не удалось прочитать'], 'skipped', 'XLSX не удалось разобрать: ' + error.message, { locked: true })
            ], ['XLSX не удалось разобрать в статике без внешних библиотек: ' + error.message]);
        }
    }

    async function analyzeDocxFile(file, filename) {
        try {
            const entries = await readZipEntries(file);
            const documentXml = entries['word/document.xml'];
            const doc = new DOMParser().parseFromString(documentXml || '', 'application/xml');
            const tableRows = getElementsByLocalName(doc, 'tr').map(function (row) {
                return getElementsByLocalName(row, 'tc').map(function (cell) {
                    return getElementsByLocalName(cell, 't').map(function (t) { return t.textContent; }).join(' ').trim();
                }).filter(Boolean);
            }).filter(function (row) { return row.length > 0; });
            const paragraphRows = tableRows.length > 0
                ? tableRows
                : getElementsByLocalName(doc, 'p').map(function (p) {
                    return [getElementsByLocalName(p, 't').map(function (t) { return t.textContent; }).join('').trim()];
                }).filter(function (row) { return row[0]; });
            const dataRows = paragraphRows.length > 1 ? paragraphRows.slice(1) : paragraphRows;
            const logEntries = dataRows.map(function (fields, index) {
                const detected = detectImportStatus(fields);
                return makeImportEntry(index, fields.slice(0, 8), detected.status, detected.reason);
            });
            return makeAnalysisResult('docx', filename, logEntries, []);
        } catch (error) {
            return makeAnalysisResult('docx', filename, [
                makeImportEntry(0, [filename, 'DOCX выбран, но содержимое не удалось прочитать'], 'skipped', 'DOCX не удалось разобрать: ' + error.message, { locked: true })
            ], ['DOCX не удалось разобрать в статике без внешних библиотек: ' + error.message]);
        }
    }

    async function analyzeDocxFolder(files, filename) {
        const docxFiles = (files || []).filter(function (file) {
            return /\.docx$/i.test(file.name);
        });

        if (!docxFiles.length) {
            return makeAnalysisResult('docx', filename, [
                makeImportEntry(0, [filename, 'В выбранной папке не найдено DOCX файлов'], 'skipped', 'DOCX файлы не выбраны')
            ], ['В выбранной папке не найдено файлов .docx.']);
        }

        const combinedEntries = [];
        const notes = [`Найдено DOCX файлов: ${docxFiles.length}.`];

        for (const file of docxFiles) {
            const result = await analyzeDocxFile(file, file.name);
            if (result.notes && result.notes.length) {
                result.notes.forEach(function (note) {
                    notes.push(`${file.name}: ${note}`);
                });
            }
            result.entries.forEach(function (entry) {
                combinedEntries.push({
                    name: `${file.name}: ${entry.name}`,
                    status: entry.status,
                    statusClass: entry.statusClass,
                    reason: entry.reason
                });
            });
        }

        return makeAnalysisResult('docx', filename, combinedEntries, notes);
    }

    async function analyzeFolderFiles(typeValue, files, filename) {
        const cfg = typeConfig[typeValue];
        const ext = cfg.fileExt.toLowerCase();
        const re = new RegExp('\\.' + ext + '$', 'i');
        const matched = (files || []).filter(function (file) { return re.test(file.name); });

        if (!matched.length) {
            return makeAnalysisResult(cfg.type, filename, [
                makeImportEntry(0, [filename, 'В выбранной папке не найдено ' + ext.toUpperCase() + ' файлов'], 'skipped', ext.toUpperCase() + ' файлы не выбраны')
            ], ['В выбранной папке не найдено файлов .' + ext + '.']);
        }

        const combinedEntries = [];
        const extLabel = ext.toUpperCase();
        const notes = [
            'Найдено ' + extLabel + ' файлов: ' + matched.length + '.',
            'Оригинальные файлы папки доступны в ZIP.'
        ];

        for (const file of matched) {
            let result;
            try {
                if (cfg.type === 'xml') {
                    result = analyzeXmlText(await file.text(), file.name);
                } else if (cfg.type === 'xlsx') {
                    result = await analyzeXlsxFile(file, file.name);
                } else {
                    result = await analyzeDocxFile(file, file.name);
                }
            } catch (error) {
                result = makeAnalysisResult(cfg.type, file.name, [
                    makeImportEntry(0, [file.name, cfg.type.toUpperCase() + ' выбран, но содержимое не удалось прочитать'], 'skipped', cfg.type.toUpperCase() + ' не удалось разобрать: ' + error.message, { locked: true })
                ], [file.name + ': ' + error.message]);
            }
            if (result.notes && result.notes.length) {
                result.notes.forEach(function (note) {
                    notes.push(file.name + ': ' + note);
                });
            }
            result.entries.forEach(function (entry) {
                combinedEntries.push({
                    name: file.name + ': ' + entry.name,
                    status: entry.status,
                    statusClass: entry.statusClass,
                    reason: entry.reason
                });
            });
        }

        return makeAnalysisResult(cfg.type, filename, combinedEntries, notes);
    }

    async function analyzeImportSource(typeValue, filename, fileObject, isFolder, folderFiles) {
        const cfg = typeConfig[typeValue];
        if (isFolder && folderFiles && folderFiles.length) return analyzeFolderFiles(typeValue, folderFiles, filename);
        if (isFolder) return makeManualPathAnalysis(cfg.type, filename, true);
        if (!fileObject) return makeManualPathAnalysis(cfg.type, filename, isFolder);

        if (cfg.type === 'xml') {
            try {
                return analyzeXmlText(await fileObject.text(), filename);
            } catch (error) {
                return makeAnalysisResult('xml', filename, [
                    makeImportEntry(0, [filename, 'XML выбран, но чтение файла завершилось ошибкой'], 'skipped', 'Ошибка чтения XML', { locked: true })
                ], [error.message]);
            }
        }
        if (cfg.type === 'xlsx') return analyzeXlsxFile(fileObject, filename);
        if (cfg.type === 'docx') return analyzeDocxFile(fileObject, filename);
        return makeManualPathAnalysis(cfg.type, filename, isFolder);
    }

    function isPathCompatibleWithType(value, cfg) {
        const trimmed = String(value || '').trim();
        if (!cfg) return false;
        if (!trimmed) return true;

        const extension = getPathExtension(trimmed);
        if (!extension) return true;
        return extension === cfg.fileExt.toLowerCase();
    }

    function setFilePathInvalid(isInvalid) {
        const wrapper = document.querySelector('.filepath-input-wrapper');
        if (wrapper) wrapper.classList.toggle('is-invalid', Boolean(isInvalid));
    }

    function setFilePathInputEnabled(isEnabled) {
        const enabled = Boolean(isEnabled);
        const input = document.getElementById('filepathInput');
        const wrapper = document.querySelector('.filepath-input-wrapper');

        if (input) {
            input.disabled = !enabled;
            input.setAttribute('aria-disabled', String(!enabled));
            if (!enabled) input.blur();
        }
        if (wrapper) {
            wrapper.classList.toggle('is-disabled', !enabled);
            wrapper.setAttribute('aria-disabled', String(!enabled));
            if (!enabled) hideTooltip(wrapper.querySelector('.filepath-full-tooltip'));
        }
    }

    function clearFilePathControl() {
        const input = document.getElementById('filepathInput');
        const clearWrapper = document.getElementById('filepathClearWrapper');
        const filePicker = document.getElementById('filePickerInput');
        const folderPicker = document.getElementById('folderPickerInput');

        if (input) {
            input.value = '';
            input.removeAttribute('title');
            input.dataset.fullText = '';
            input.setAttribute('placeholder', '');
            delete input.dataset.errorActive;
            renderFilePathValue(input);
        }
        const inputWrapper = document.querySelector('.filepath-input-wrapper');
        if (inputWrapper) {
            inputWrapper.removeAttribute('title');
            inputWrapper.dataset.fullText = '';
            hideTooltip(inputWrapper.querySelector('.filepath-full-tooltip'));
        }
        if (clearWrapper) clearWrapper.style.display = 'none';
        if (filePicker) filePicker.value = '';
        if (folderPicker) folderPicker.value = '';
        clearSourceError();
        setFilePathInvalid(false);
        state.filePath = '';
        state.isFolder = false;
        state.pickedFileObject = null;
        state.pickedFolderFiles = [];
        state.pickedFolderName = '';
    }

    function syncSelectedTypeControls(typeValue) {
        const cfg = typeValue ? typeConfig[typeValue] : null;
        const valueText = document.getElementById('selectValueText');
        const clearWrapper = document.getElementById('selectClearWrapper');
        const paperclipWrapper = document.getElementById('paperclipWrapper');
        const paperclipBtn = document.getElementById('paperclipBtn');
        const filePickerInput = document.getElementById('filePickerInput');
        const sourceChoiceMenu = document.getElementById('sourceChoiceMenu');
        const dropdown = document.getElementById('selectDropdown');

        state.selectedType = cfg;
        setFilePathInputEnabled(Boolean(cfg));

        if (valueText) {
            valueText.classList.toggle('has-value', Boolean(cfg));
            renderSelectValueText(cfg ? cfg.label : 'Выбрать тип файла');
        }
        if (clearWrapper) clearWrapper.style.display = cfg ? 'flex' : 'none';
        renderFilepathLabel(cfg ? cfg.pathLabel : 'Укажите путь к файлу');

        if (paperclipWrapper) {
            paperclipWrapper.classList.toggle('disabled', !cfg);
            hideTooltip(paperclipWrapper.querySelector('.tooltip'));
        }
        if (paperclipBtn) paperclipBtn.disabled = !cfg;
        if (filePickerInput) filePickerInput.accept = cfg ? '.' + cfg.fileExt : '';
        // if (sourceChoiceMenu) sourceChoiceMenu.hidden = true;

        const filepathInput = document.getElementById('filepathInput');
        if (!cfg) {
            clearFilePathControl();
        } else if (filepathInput && !isPathCompatibleWithType(filepathInput.value, cfg)) {
            clearFilePathControl();
        } else {
            clearSourceError();
            if (filepathInput) {
                filepathInput.setAttribute('placeholder', '');
                delete filepathInput.dataset.errorActive;
                renderFilePathValue(filepathInput);
            }
            setFilePathInvalid(false);
        }

        if (dropdown) {
            dropdown.querySelectorAll('.select-option').forEach(function (option) {
                option.classList.toggle('is-selected', Boolean(cfg) && option.dataset.value === cfg.value);
            });
        }

        updateImportButtonText();
        if (cfg && state.filePath && !state.hasSourceError) {
            enableImportButton();
        } else {
            disableImportButton();
        }
    }

    function ensureLogType(typeValue) {
        if (!state.logsByType[typeValue]) {
            state.logsByType[typeValue] = [];
        }
        if (!state.logTypeOrder.includes(typeValue)) {
            state.logTypeOrder.push(typeValue);
        }
    }

    function pruneEmptyLogType(typeValue) {
        if (!state.logsByType[typeValue] || state.logsByType[typeValue].length > 0) return;

        delete state.logsByType[typeValue];
        state.logTypeOrder = state.logTypeOrder.filter(function (value) {
            return value !== typeValue;
        });
    }

    function applyInitialControls() {
        const filepathInput = document.getElementById('filepathInput');
        const filepathClearWrapper = document.getElementById('filepathClearWrapper');
        const paperclipWrapper = document.getElementById('paperclipWrapper');

        state.filePath = INITIAL_FILE_PATH;
        state.isFolder = false;
        state.pickedFileObject = null;
        syncSelectedTypeControls(INITIAL_TYPE_VALUE);

        if (filepathInput) {
            filepathInput.value = INITIAL_FILE_PATH;
            filepathInput.removeAttribute('title');
            filepathInput.dataset.fullText = INITIAL_FILE_PATH;
            renderFilePathValue(filepathInput);
        }
        const filepathInputWrapper = document.querySelector('.filepath-input-wrapper');
        if (filepathInputWrapper) {
            filepathInputWrapper.removeAttribute('title');
            filepathInputWrapper.dataset.fullText = INITIAL_FILE_PATH;
        }
        if (filepathClearWrapper) filepathClearWrapper.style.display = INITIAL_FILE_PATH ? 'flex' : 'none';
        if (paperclipWrapper) {
            const tooltip = paperclipWrapper.querySelector('.tooltip');
            if (tooltip) renderTooltipText(tooltip, PAPERCLIP_TOOLTIP_TEXT);
        }
    }

    function initPageState() {
        state.logsByType = {};
        state.logTypeOrder = [];
        applyInitialControls();
    }

    function disableImportButton() {
        const btn = document.getElementById('importBtn');
        if (!btn) return;

        btn.classList.add('disabled');
        state.importButtonDisabled = true;
    }

    function enableImportButton() {
        const btn = document.getElementById('importBtn');
        if (!btn) return;

        btn.classList.remove('disabled');
        state.importButtonDisabled = false;
    }

    function initCustomSelect() {
        const selectEl  = document.getElementById('typeSelect');
        const trigger   = document.getElementById('selectTrigger');
        const valueText = document.getElementById('selectValueText');
        const clearBtn  = document.getElementById('selectClearBtn');
        const clearWrapper = document.getElementById('selectClearWrapper');
        const dropdown  = document.getElementById('selectDropdown');
        if (!selectEl || !trigger || !dropdown) return;
        const options   = dropdown.querySelectorAll('.select-option');

        function positionDropdown() {
            dropdown.style.left = '';
            dropdown.style.top = '';
            dropdown.style.width = '';
        }

        function openDropdown() {
            positionDropdown();
            options.forEach(opt => {
                opt.classList.toggle('is-selected', state.selectedType !== null && opt.dataset.value === state.selectedType.value);
            });
            selectEl.classList.add('open');
            selectEl.classList.remove('is-preparing');
        }

        function closeDropdown() {
            selectEl.classList.remove('open', 'is-preparing');
        }

        function selectOption(typeValue) {
            syncSelectedTypeControls(typeValue);
            closeDropdown();
        }

        function clearSelection() {
            syncSelectedTypeControls(null);
        }

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            selectEl.classList.contains('open') ? closeDropdown() : openDropdown();
        });
        trigger.addEventListener('mousedown', function (e) {
            if (e.button === 0) e.preventDefault();
        });

        clearBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            clearSelection();
        });

        options.forEach(opt => opt.addEventListener('click', function (e) {
            e.stopPropagation();
            selectOption(opt.dataset.value);
        }));

        document.addEventListener('click', closeDropdown);
        dropdown.addEventListener('click', e => e.stopPropagation());

        window.addEventListener('resize', function () {
            if (selectEl.classList.contains('open')) positionDropdown();
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function () {
                if (selectEl.classList.contains('open')) positionDropdown();
            });
        }

        window.addEventListener('scroll', function () {
            if (selectEl.classList.contains('open')) positionDropdown();
        }, true);
    }

    function initFilePath() {
        const input      = document.getElementById('filepathInput');
        if (!input) return;
        const clearWrapper = document.getElementById('filepathClearWrapper');
        const clearBtn   = document.getElementById('filepathClearBtn');
        const paperclip  = document.getElementById('paperclipBtn');
        const filePicker = document.getElementById('filePickerInput');
        const folderPicker = document.getElementById('folderPickerInput');
        const paperclipWrapper = document.getElementById('paperclipWrapper');
        const sourceChoiceMenu = document.getElementById('sourceChoiceMenu');   
        const inputWrapper = document.querySelector('.filepath-input-wrapper');
        const fullTextTooltip = inputWrapper ? createTextTooltip(inputWrapper, 'filepath-full-tooltip') : null;

        function syncClearBtn() {
            clearWrapper.style.display = input.value.length > 0 ? 'flex' : 'none';
        }

        function syncFilePathTitle(value) {
            const title = String(value || '');
            input.removeAttribute('title');
            input.dataset.fullText = title;
            if (inputWrapper) {
                inputWrapper.removeAttribute('title');
                inputWrapper.dataset.fullText = title;
            }
            if (!title) hideTooltip(fullTextTooltip);
            renderFilePathValue(input);
            updateFilePathCaret(input);
        }

        function showFilePathTooltip(event) {
            if (!inputWrapper || !fullTextTooltip) return;
            if (event && event.target.closest('.filepath-clear-wrapper')) {
                hideTooltip(fullTextTooltip);
                return;
            }
            const staticValue = inputWrapper.querySelector('.filepath-static-value');
            if (!isElementTextOverflowing(staticValue || input)) {
                hideTooltip(fullTextTooltip);
                return;
            }

            const text = input.dataset.fullText || input.value;
            if (!text) return;
            renderTooltipText(fullTextTooltip, text);
            positionTooltipByElement(fullTextTooltip, inputWrapper);
        }

        // function hideSourceChoiceMenu() {
        //     if (sourceChoiceMenu) sourceChoiceMenu.hidden = true;
        // }

        // function showSourceChoiceMenu() {
        //     if (!sourceChoiceMenu) return;
        //     sourceChoiceMenu.hidden = false;
        //     hideTooltip(paperclipWrapper.querySelector('.tooltip'));
        // }

        function setFilePath(value, isFolder, fileObject, folderFiles, folderName) {
            input.value = value;
            syncFilePathTitle(value);
            state.filePath = value;
            state.isFolder = Boolean(isFolder);
            state.pickedFileObject = fileObject || null;
            state.pickedFolderFiles = Array.isArray(folderFiles) ? folderFiles : [];
            state.pickedFolderName = folderName || '';
            syncClearBtn();
            const isValid = isPathCompatibleWithType(value, state.selectedType);
            setFilePathInvalid(!isValid);
            if (isValid) {
                clearFileTypeError();
                clearSourceError();
            }
            if (state.selectedType && state.filePath && !state.hasSourceError) {
                enableImportButton();
            } else {
                disableImportButton();
            }
        }

        input.addEventListener('input', function () {
            const val = input.value;
            const hasValue = val.trim().length > 0;
            const hasSelectedType = Boolean(state.selectedType);
            state.filePath = val;
            const isFolderPath = isManualFolderPath(val);
            state.isFolder = Boolean(hasSelectedType && isFolderPath);
            state.pickedFileObject = null;
            state.pickedFolderFiles = [];
            state.pickedFolderName = '';
            syncFilePathTitle(val);
            hideTooltip(fullTextTooltip);
            syncClearBtn();

            const isValid = hasSelectedType ? isPathCompatibleWithType(val, state.selectedType) : true;
            setFilePathInvalid(!isValid && hasValue);

            if (!isValid && hasValue && hasSelectedType) {
                input.setAttribute('placeholder', FILE_TYPE_MISMATCH_MESSAGE);
                input.dataset.errorActive = '1';
                state.hasSourceError = true;
                state.sourceErrorMessage = FILE_TYPE_MISMATCH_MESSAGE;
                showImportToast(FILE_TYPE_MISMATCH_MESSAGE, 'error');
                disableImportButton();
                return;
            }

            if (isValid) {
                clearFileTypeError();
                clearSourceError();
            }

            if (hasSelectedType && hasValue && !state.hasSourceError) {
                enableImportButton();
            } else {
                disableImportButton();
            }
            updateFilePathCaret(input);
        });

        input.addEventListener('focus', function () {
            updateFilePathCaret(input);
        });

        input.addEventListener('click', function () {
            updateFilePathCaret(input);
        });

        input.addEventListener('keyup', function () {
            updateFilePathCaret(input);
        });

        clearBtn.addEventListener('click', function () {
            hideAllTooltips();
            // hideSourceChoiceMenu();
            clearFileTypeError();
            setFilePath('', false, null, [], '');
            filePicker.value = '';
            if (folderPicker) folderPicker.value = '';
            if (!input.disabled) input.focus();
        });

        input.addEventListener('blur', function () {
            input.scrollLeft = 0;
        });

        document.addEventListener('selectionchange', function () {
            if (document.activeElement === input) updateFilePathCaret(input);
        });

        if (inputWrapper) {
            inputWrapper.addEventListener('mouseover', showFilePathTooltip);
            inputWrapper.addEventListener('mouseout', function (event) {
                if (!inputWrapper.contains(event.relatedTarget)) {
                    hideTooltip(fullTextTooltip);
                }
            });
            inputWrapper.addEventListener('click', function () {
                hideTooltip(fullTextTooltip);
            });
        }

        function isDocxTypeSelected() {
            return state.selectedType && state.selectedType.type === 'docx';
        }

        function selectedExtRegex() {
            const cfg = state.selectedType;
            if (!cfg) return null;
            return new RegExp('\\.' + cfg.fileExt.toLowerCase() + '$', 'i');
        }

        function markRelativePath(file, relativePath) {
            try {
                Object.defineProperty(file, '__relativePath', {
                    value: relativePath,
                    configurable: true
                });
            } catch (error) {
                file.__relativePath = relativePath;
            }
            return file;
        }

        function filterFilesByType(files) {
            const re = selectedExtRegex();
            if (!re) return [];
            return Array.from(files || []).filter(function (file) {
                return re.test(file.name);
            });
        }

        function setFolderPath(folderName, files) {
            if (!state.selectedType) {
                input.value = '';
                syncFilePathTitle('');
                state.filePath = '';
                state.isFolder = false;
                state.pickedFileObject = null;
                state.pickedFolderFiles = [];
                state.pickedFolderName = '';
                syncClearBtn();
                if (folderPicker) folderPicker.value = '';
                showFileTypeError(FILE_TYPE_MISMATCH_MESSAGE);
                disableImportButton();
                return;
            }
            const matched = filterFilesByType(files);
            if (!matched.length) {
                input.value = '';
                syncFilePathTitle('');
                state.filePath = '';
                state.isFolder = false;
                state.pickedFileObject = null;
                state.pickedFolderFiles = [];
                state.pickedFolderName = '';
                syncClearBtn();
                if (folderPicker) folderPicker.value = '';
                showFileTypeError(EMPTY_FOLDER_MESSAGE);
                disableImportButton();
                return;
            }
            const displayName = folderName || 'Выбранная папка';
            clearFileTypeError();
            setFilePath(displayName, true, null, matched, displayName);
        }

        async function collectDirectoryFilesByType(directoryHandle, prefix) {
            const files = [];
            const re = selectedExtRegex();
            if (!re) return files;
            for await (const entry of directoryHandle.values()) {
                const relativePath = `${prefix}${entry.name}`;
                if (entry.kind === 'file') {
                    if (re.test(entry.name)) {
                        files.push(markRelativePath(await entry.getFile(), relativePath));
                    }
                } else if (entry.kind === 'directory') {
                    const nested = await collectDirectoryFilesByType(entry, `${relativePath}/`);
                    files.push.apply(files, nested);
                }
            }
            return files;
        }

        function chooseFolder() {
            if (!state.selectedType) return;
            if (window.showDirectoryPicker && window.isSecureContext) {
                window.showDirectoryPicker({ mode: 'read' })
                    .then(async function (directoryHandle) {
                        const files = await collectDirectoryFilesByType(directoryHandle, `${directoryHandle.name}/`);
                        setFolderPath(directoryHandle.name, files);
                    })
                    .catch(function (error) {
                        if (error && error.name === 'AbortError') return;
                        if (folderPicker) folderPicker.click();
                    });
                return;
            }
            if (folderPicker) folderPicker.click();
        }

        paperclip.addEventListener('click', function () {
            hideAllTooltips();
            paperclip.blur();
           if (filePicker) filePicker.click();
        });

        function showFileTypeError(message) {
            if (input) {
                input.setAttribute('placeholder', message);
                input.dataset.errorActive = '1';
                renderFilePathValue(input);
            }
            markSourceError(message);
        }

        function clearFileTypeError() {
            if (input) {
                input.setAttribute('placeholder', '');
                delete input.dataset.errorActive;
                renderFilePathValue(input);
            }
        }

        filePicker.addEventListener('change', function () {
            hideAllTooltips();
            // hideSourceChoiceMenu();
            if (filePicker.files && filePicker.files[0]) {
                const file = filePicker.files[0];
                if (!isPathCompatibleWithType(file.name, state.selectedType)) {
                    filePicker.value = '';
                    input.value = '';
                    syncFilePathTitle('');
                    state.filePath = '';
                    state.isFolder = false;
                    state.pickedFileObject = null;
                    state.pickedFolderFiles = [];
                    state.pickedFolderName = '';
                    syncClearBtn();
                    showFileTypeError(FILE_TYPE_MISMATCH_MESSAGE);
                    disableImportButton();
                    return;
                }
                clearFileTypeError();
                setFilePath(file.name, false, file, [], '');
            }
        });

        if (folderPicker) {
            folderPicker.addEventListener('change', function () {
                hideAllTooltips();
                // hideSourceChoiceMenu();
                const files = Array.from(folderPicker.files || []);
                const firstPath = files[0] && files[0].webkitRelativePath ? files[0].webkitRelativePath : '';
                const folderName = firstPath ? firstPath.split('/')[0] : 'Выбранная папка';
                setFolderPath(folderName, files);
            });
        }

        // if (sourceChoiceMenu) {
        //     sourceChoiceMenu.addEventListener('click', function (event) {
        //         const choice = event.target.closest('[data-source-choice]');
        //         if (!choice) return;
        //         event.preventDefault();
        //         event.stopPropagation();
        //         hideSourceChoiceMenu();
        //         if (choice.dataset.sourceChoice === 'folder') {
        //             chooseFolder();
        //         } else {
        //             filePicker.click();
        //         }
        //     });
        // }

        // document.addEventListener('mousedown', function (event) {
        //     if (!paperclipWrapper.contains(event.target)) hideSourceChoiceMenu();
        // });

        // document.addEventListener('keydown', function (event) {
        //     if (event.key === 'Escape') hideSourceChoiceMenu();
        // });

        paperclip.addEventListener('mouseenter', function () {
            if (paperclip.disabled || paperclipWrapper.classList.contains('disabled')) return;
        const tooltip = paperclipWrapper.querySelector('.tooltip');
        if (tooltip) {
            positionTooltipByElement(tooltip, paperclip);
            const currentTop = parseFloat(tooltip.style.top) || 0;
            tooltip.style.top = (currentTop + 1) + 'px';
        }
    });
    paperclip.addEventListener('mouseleave', function () {
        hideTooltip(paperclipWrapper.querySelector('.tooltip'));
    });
    }

    function initImportButton() {
        const btn = document.getElementById('importBtn');
        if (!btn) return;

        btn.addEventListener('click', async function () {
            if (!state.selectedType) return;

            const input = document.getElementById('filepathInput');

            if (state.hasSourceError) {
                btn.blur();
                setFilePathInvalid(true);
                showImportToast(state.sourceErrorMessage || EMPTY_FOLDER_MESSAGE, 'error');
                disableImportButton();
                return;
            }

            if (btn.classList.contains('disabled')) return;

            if (state.filePath && !isPathCompatibleWithType(state.filePath, state.selectedType)) {
                if (input) {
                    input.setAttribute('placeholder', FILE_TYPE_MISMATCH_MESSAGE);
                    input.dataset.errorActive = '1';
                }
                btn.blur();
                setFilePathInvalid(true);
                showImportToast(FILE_TYPE_MISMATCH_MESSAGE, 'error');
                return;
            }

            const hasRealSource = state.isFolder
                ? Array.isArray(state.pickedFolderFiles) && state.pickedFolderFiles.length > 0
                : Boolean(state.pickedFileObject);
            if (!hasRealSource && !String(state.filePath || '').trim()) {
                btn.blur();
                setFilePathInvalid(true);
                showImportToast(MANUAL_PATH_REQUIRED_MESSAGE, 'error');
                return;
            }

            const typeValue = state.selectedType.value;
            disableImportButton();
            const row = await generateLogRow(typeValue, state.filePath);

            ensureLogType(typeValue);
            state.logsByType[typeValue].push(row);
            state.currentPage = 1;

            renderLogTables();
            attachLogAreaHandlers();

            const clearWrapper = document.getElementById('filepathClearWrapper');
            if (input) {
                input.value = '';
                input.removeAttribute('title');
                input.dataset.fullText = '';
                input.setAttribute('placeholder', '');
                delete input.dataset.errorActive;
                renderFilePathValue(input);
                requestAnimationFrame(function () {
                    renderFilePathValue(input);
                });
            }
            const inputWrapper = document.querySelector('.filepath-input-wrapper');
            if (inputWrapper) {
                inputWrapper.removeAttribute('title');
                inputWrapper.dataset.fullText = '';
                hideTooltip(inputWrapper.querySelector('.filepath-full-tooltip'));
            }
            state.filePath = '';
            state.isFolder = false;
            state.pickedFileObject = null;
            state.pickedFolderFiles = [];
            state.pickedFolderName = '';
            clearSourceError();
            const filePicker = document.getElementById('filePickerInput');
            if (filePicker) filePicker.value = '';
            const folderPicker = document.getElementById('folderPickerInput');
            if (folderPicker) folderPicker.value = '';
            if (clearWrapper) clearWrapper.style.display = 'none';
            setFilePathInvalid(false);
        });
    }

    let logAreaHandlerAttached = false;

    function positionTooltip(tooltip, event) {
        if (areTooltipsSuppressed()) {
            hideTooltip(tooltip);
            return;
        }
        renderTooltipText(tooltip);
        tooltip.classList.add('is-visible');
        const frame = tooltip.closest('#zoomFrame');
        if (frame) {
            const frameRect = frame.getBoundingClientRect();
            const frameScale = frameRect.width && frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
            const safeScale = frameScale || 1;
            const left = (event.clientX - frameRect.left) / safeScale - tooltip.offsetWidth / 2;
            const top = (event.clientY - frameRect.top) / safeScale + 25;
            tooltip.style.left = Math.max(8, left) + 'px';
            tooltip.style.top = Math.max(8, top) + 'px';
            return;
        }

        tooltip.style.left = (event.clientX - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (event.clientY + designPxToViewportPx(25)) + 'px';
    }

    function positionTooltipByElement(tooltip, element) {
        if (areTooltipsSuppressed()) {
            hideTooltip(tooltip);
            return;
        }
        renderTooltipText(tooltip);
        tooltip.classList.add('is-visible');
        const rect = element.getBoundingClientRect();
        
        const frame = tooltip.closest('#zoomFrame');
        let safeScale = 1;
        if (frame) {
            const frameRect = frame.getBoundingClientRect();
            safeScale = frameRect.width && frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
        }

        const tooltipW = tooltip.offsetWidth;
        const tooltipH = tooltip.offsetHeight;
        
        const gap = designPxToViewportPx(8);
        const viewportPadding = designPxToViewportPx(8);

        const parent = tooltip.offsetParent;
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

        let viewportLeft = rect.left + rect.width / 2 - (tooltipW * safeScale) / 2;
        let viewportTop = rect.bottom + gap;

        const maxLeft = window.innerWidth - (tooltipW * safeScale) - viewportPadding;
        viewportLeft = Math.min(Math.max(viewportPadding, viewportLeft), Math.max(viewportPadding, maxLeft));

        if (viewportTop + (tooltipH * safeScale) > window.innerHeight - viewportPadding) {
            viewportTop = rect.top - (tooltipH * safeScale) - gap;
            viewportTop = Math.max(viewportPadding, viewportTop);
        }

        const left = (viewportLeft - parentRect.left) / safeScale;
        const top = (viewportTop - parentRect.top) / safeScale;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip(tooltip) {
        if (tooltip) tooltip.classList.remove('is-visible');
    }

    function hideAllTooltips() {
        document.querySelectorAll('.tooltip.is-visible').forEach(hideTooltip);
    }

    function createTextTooltip(container, className) {
        if (!container) return null;
        let tooltip = container.querySelector('.tooltip.' + className);
        if (!tooltip) {
            tooltip = document.createElement('span');
            tooltip.className = 'tooltip ' + className;
            container.appendChild(tooltip);
        }
        return tooltip;
    }

    function isElementTextOverflowing(element) {
        return Boolean(element && (element.dataset.truncated === 'true' || element.scrollWidth > element.clientWidth + 1));
    }

    function canShowIconTooltip(wrapper) {
        const button = wrapper.querySelector('button');
        if (!button) return false;
        return !button.disabled && !button.classList.contains('is-unavailable') && !wrapper.classList.contains('disabled');
    }

    function initControlTooltips() {
        document.querySelectorAll('.select-clear-wrapper, .filepath-clear-wrapper').forEach(function (wrapper) {
            wrapper.addEventListener('mouseover', function () {
                const tooltip = wrapper.querySelector('.tooltip');
                if (tooltip) positionTooltipByElement(tooltip, wrapper);
            });
            wrapper.addEventListener('mouseout', function (event) {
                if (!wrapper.contains(event.relatedTarget)) {
                    hideTooltip(wrapper.querySelector('.tooltip'));
                }
            });
            wrapper.addEventListener('click', hideAllTooltips);
        });
    }

    function initGlobalTooltipDismiss() {
        window.addEventListener('blur', hideAllTooltips);
        window.addEventListener('scroll', hideAllTooltips, true);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideAllTooltips();
        });
        document.addEventListener('pointerdown', function (event) {
            if (!event.target.closest('.icon-wrapper, .paperclip-wrapper')) {
                hideAllTooltips();
            }
        }, true);
    }

    function attachLogAreaHandlers() {
        if (logAreaHandlerAttached) return;
        logAreaHandlerAttached = true;

        const logArea = document.getElementById('logArea');
        if (!logArea) return;

        logArea.addEventListener('mouseover', function (e) {
            const wrapper = e.target.closest('.delete-wrapper, .file-icon-wrapper, .rollback-wrapper');
            if (wrapper && canShowIconTooltip(wrapper)) {
                const tooltip = wrapper.querySelector('.tooltip');
                if (tooltip) {
                    positionTooltipByElement(tooltip, wrapper);
                }
                return;
            }

            const filenameLink = e.target.closest('.filename-link');
            if (filenameLink && isElementTextOverflowing(filenameLink)) {
                const cell = filenameLink.closest('td') || filenameLink.parentElement;
                const tooltip = createTextTooltip(cell, 'filename-full-tooltip');
                const text = filenameLink.dataset.fullText || filenameLink.textContent.trim();
                if (tooltip && text) {
                    renderTooltipText(tooltip, text);
                    positionTooltipByElement(tooltip, filenameLink);
                }
            }
        });

        logArea.addEventListener('mouseout', function (e) {
            const wrapper = e.target.closest('.delete-wrapper, .file-icon-wrapper, .rollback-wrapper');
            if (wrapper && !wrapper.contains(e.relatedTarget)) {
                hideTooltip(wrapper.querySelector('.tooltip'));
                return;
            }

            const filenameLink = e.target.closest('.filename-link');
            if (filenameLink && !filenameLink.contains(e.relatedTarget)) {
                const cell = filenameLink.closest('td') || filenameLink.parentElement;
                hideTooltip(cell && cell.querySelector('.filename-full-tooltip'));
            }
        });

        logArea.addEventListener('mousedown', function (e) {
            const btn = e.target.closest('.delete-btn');
            if (btn) {
                btn.classList.add('is-pressed');
                setTimeout(() => btn.classList.remove('is-pressed'), 200);
            }
        });

        logArea.addEventListener('click', function (e) {
            const rollbackBtn = e.target.closest('.rollback-btn');
            if (rollbackBtn && !rollbackBtn.disabled && !rollbackBtn.classList.contains('is-rolled')) {
                hideAllTooltips();
                const typeValue = rollbackBtn.dataset.type;
                const idx = parseInt(rollbackBtn.dataset.idx, 10);
                const row = state.logsByType[typeValue] && state.logsByType[typeValue][idx];
                if (row && row.status === 'loaded') {
                    const { full } = getCurrentDatetime();
                    row.status = 'rolled_back';
                    row.rollbackDate = full.trim().replace(/\s+/, ' ');
                    recalculateTypeTotals(typeValue);
                    renderLogTables();
                }
                return;
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                hideAllTooltips();
                const typeValue = deleteBtn.dataset.type;
                const idx = parseInt(deleteBtn.dataset.idx, 10);
                if (state.logsByType[typeValue]) {
                    state.logsByType[typeValue].splice(idx, 1);
                    recalculateTypeTotals(typeValue);
                    pruneEmptyLogType(typeValue);
                }
                renderLogTables();
                return;
            }

            const fileBtn = e.target.closest('.file-icon-btn');
            if (fileBtn) {
                hideAllTooltips();
                if (fileBtn.disabled || fileBtn.classList.contains('is-unavailable')) return;
                const dlName    = fileBtn.dataset.dlName;
                const dlType    = fileBtn.dataset.dlType;
                const typeValue = fileBtn.dataset.type;
                const idx       = fileBtn.dataset.idx !== undefined ? parseInt(fileBtn.dataset.idx, 10) : NaN;
                const row       = (typeValue && !isNaN(idx)) ? (state.logsByType[typeValue] && state.logsByType[typeValue][idx]) : null;

                if (dlType === 'html' && row && typeValue) {
                    const html = generateHtmlLog(row, typeValue);
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    const url  = URL.createObjectURL(blob);
                    const a    = document.createElement('a');
                    a.href     = url;
                    a.download = dlName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } else if (dlName && dlType) {
                    if (dlType === 'xml' && row && row.isFolder && row.folderFiles && row.folderFiles.length) {
                        triggerMergedXmlDownload(dlName, row.folderFiles).catch(function () {
                            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
                        });
                    } else if (dlType === 'xlsx' && row && row.isFolder && row.folderFiles && row.folderFiles.length) {
                        triggerMergedXlsxDownload(dlName, row.folderFiles).catch(function () {
                            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
                        });
                    } else if (dlType === 'docx' && row && row.isFolder && row.folderFiles && row.folderFiles.length) {
                        triggerMergedDocxDownload(dlName, row.folderFiles).catch(function () {
                            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
                        });
                    } else if (dlType === 'zip' && row && row.folderFiles && row.folderFiles.length) {
                        triggerFolderZipDownload(dlName, row.folderFiles).catch(function () {
                            showImportToast(ORIGINAL_FILE_UNAVAILABLE_MESSAGE, 'error');
                        });
                    } else {
                        const folderFile = row && row.folderFiles && row.folderFiles.length ? row.folderFiles[0] : null;
                        const fileObject = row ? (row.fileObject || folderFile) : null;
                        triggerGeneratedDownload(dlName, dlType, fileObject);
                    }
                }
                return;
            }

            const filenameLink = e.target.closest('.filename-link');
            if (filenameLink) {
                e.preventDefault();
                hideAllTooltips();
                const typeValue = filenameLink.dataset.type;
                const idx = parseInt(filenameLink.dataset.idx, 10);
                const row = state.logsByType[typeValue] && state.logsByType[typeValue][idx];
                if (row) openHtmlLog(row, typeValue);
                return;
            }
        });
    }

    function initNavTabs() {
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach(function (item) {
            item.addEventListener('mouseenter', function () {
                renderNavIcon(item, true);
            });
            item.addEventListener('mouseleave', function () {
                renderNavIcon(item);
            });
            item.addEventListener('click', function (e) {
                e.preventDefault();
                navItems.forEach(function (i) {
                    i.classList.remove('active');
                    renderNavIcon(i);
                    renderNavText(i);
                });
                item.classList.add('active');
                renderNavIcon(item);
                renderNavText(item);
            });
        });
    }

    let bitmapTextFontRefreshBound = false;

    function bindBitmapTextFontRefresh() {
        if (!document.fonts || !document.fonts.ready || bitmapTextFontRefreshBound) return;
        bitmapTextFontRefreshBound = true;
        document.fonts.ready.then(function () {
            if (textRenderMode !== 'bitmap') return;
            bitmapTextFontVersion += 1;
            bitmapTextMaskCache.clear();
            renderStaticText();
            if (dateCalendarState.field) renderDateCalendar();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateZoomAwareLines();
        bindBitmapTextFontRefresh();
        initNavTabs();
        initCustomSelect();
        initFilePath();
        initImportButton();
        initImportCheckboxes();
        initControlTooltips();
        initGlobalTooltipDismiss();
        initLogPreview();
        initDateFilterDefaults();
        updateImportButtonText();
        attachLogAreaHandlers();
        initPageState();

        // const params = new URLSearchParams(window.location.search || '');
        // const hash = (window.location.hash || '').toLowerCase();
        // const isMockEnabled =
        //     params.has('mock') ||
        //     hash.includes('mock') ||
        //     (function () {
        //         try { return localStorage.getItem('mock') === '1'; }
        //         catch (e) { return false; }
        //     })();

        // if (isMockEnabled) loadMockData();

        renderLogTables();
        renderStaticText();
    });
