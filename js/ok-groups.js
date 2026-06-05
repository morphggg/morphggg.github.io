'use strict';

const DESIGN_VP = 1920;
function updateDpx() {
    const w = document.documentElement.clientWidth || window.innerWidth || DESIGN_VP;
    const scale = w / DESIGN_VP;
    // --dpx используется в ok-groups.css
    document.documentElement.style.setProperty('--dpx', scale.toFixed(6) + 'px');
    // --fvw используется в style.css (1vw дизайн-вьюпорта = 1/1920 ширины)
    document.documentElement.style.setProperty('--fvw', (w / 100).toFixed(4) + 'px');
}
window.addEventListener('resize', updateDpx);
updateDpx();

const GROUP_FIELDS = [
    { key: 'link',     label: 'Ссылка на сообщество',    required: true },
    { key: 'altName',  label: 'Дополнительное название', required: false },
    { key: 'groupId',  label: 'ID группы',               required: true },
    { key: 'appId',    label: 'ID приложения',           required: true },
    { key: 'key',      label: 'Публичный ключ',          required: true },
    { key: 'login',    label: 'Логин',                   required: true },
    { key: 'password', label: 'Пароль',                  required: true }
];
// Top-10 РФ-рейтинг — показывается сразу после @
const EMAIL_DOMAINS_TOP = [
    'mail.ru', 'yandex.ru', 'gmail.com', 'bk.ru', 'inbox.ru',
    'list.ru', 'rambler.ru', 'ya.ru', 'outlook.com', 'icloud.com'
];
// Полный список — фильтруется при наборе после @
const EMAIL_DOMAINS_ALL = [
    'mail.ru', 'yandex.ru', 'gmail.com', 'bk.ru', 'inbox.ru',
    'list.ru', 'rambler.ru', 'ya.ru', 'outlook.com', 'icloud.com',
    'mail.com', 'hotmail.com', 'internet.ru', 'vk.com', 'mailfence.com',
    'protonmail.com', 'proton.me', 'tutanota.com', 'tutamail.com',
    'zoho.com', 'zohomail.com', 'yahoo.com', 'ymail.com', 'aol.com',
    'live.com', 'live.ru', 'msn.com', 'me.com', 'mac.com',
    'ukr.net', 'i.ua', 'meta.ua', 'email.ua',
    'ro.ru', 'nm.ru', 'front.ru', 'rbcmail.ru',
    'corp.mail.ru', 'e1.ru', 'ngs.ru', 'mail.yandex.ru',
    'gmail.ru', 'googlemail.com', 'gmx.com', 'gmx.de', 'gmx.net',
    'fastmail.com', 'fastmail.fm', 'pm.me', 'skiff.com',
    'disroot.org', 'runbox.com', 'cock.li', 'airmail.cc',
    'inbox.lv', 'mail.kz', 'mail.by', 'tut.by'
];
let editingCard = null;
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addGroupBtn');
    const modal = document.getElementById('groupModal');
    const modalClose = document.getElementById('groupModalClose');
    const form = document.getElementById('groupForm');
    const fieldsBox = document.getElementById('modalFields');
    const submitBtn = document.getElementById('groupSubmit');
    const list = document.getElementById('groupsList');
    const title = document.getElementById('groupModalTitle');
    const modeRow = document.getElementById('modeRow');
    const updateModeVisibility = () => { modeRow.hidden = list.children.length === 0; };
    updateModeVisibility();
    buildModalFields(fieldsBox);
    addBtn.addEventListener('click', () => openModal('add'));
    modalClose.addEventListener('click', closeModal);
    document.getElementById('groupCancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    form.addEventListener('input', () => { submitBtn.disabled = !isFormValid(); });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isFormValid()) return;
        const data = collectForm();
        if (editingCard) {
            fillCard(editingCard, data);
        } else {
            const card = createCard(data);
            list.appendChild(card);
            renumber(list);
        }
        updateModeVisibility();
        persistGroups();
        closeModal();
    });
    restoreGroups(list);
    updateModeVisibility();
    list.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-pick]');
        if (pick) { pick.closest('.file-field').querySelector('.hidden-file').click(); return; }
    });
    list.addEventListener('change', async (e) => {
        const inp = e.target.closest('.hidden-file');
        if (!inp || !inp.files.length) return;
        const ff = inp.closest('.file-field');
        const file = inp.files[0];
        const fileInput = ff.querySelector('.file-input');
        fileInput.value = file.name;
        toggleClearBtn(ff);
        if (ff.dataset.file === 'upload') {
            const qty = ff.closest('.group-right').querySelector('[data-qty]');
            if (!qty) return;
            qty.value = 'считаю...';
            try {
                const rows = await countXlsxVacancies(file);
                qty.value = rows > 0 ? ('Количество вакансий ' + rows) : '';
            } catch (err) {
                qty.value = '';
                console.warn('xlsx count failed', err);
            }
        }
    });
    list.addEventListener('click', (e) => {
        const clr = e.target.closest('[data-clear]');
        if (!clr) return;
        const ff = clr.closest('.file-field');
        if (!ff) return;
        ff.querySelector('.file-input').value = '';
        const hidden = ff.querySelector('.hidden-file');
        if (hidden) hidden.value = '';
        // п.13: при очистке крестика в блоке с paperclip — очищать ТАКЖЕ поле qty
        if (ff.dataset.file === 'upload') {
            const qty = ff.closest('.group-right').querySelector('[data-qty]');
            if (qty) qty.value = '';
        }
        toggleClearBtn(ff);
    });
    list.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const card = btn.closest('[data-group]');
        const action = btn.dataset.action;
        if (action === 'remove') {
            const num = card.querySelector('[data-group-number]')?.textContent || '';
            const ok = await confirmAction({
                title: 'Удалить группу?',
                text: `Группа ${num} будет удалена безвозвратно. Продолжить?`,
                yes: 'Удалить',
            });
            if (!ok) return;
            card.remove();
            renumber(list);
            updateModeVisibility();
            persistGroups();
        } else if (action === 'toggle') {
            const details = card.querySelector('[data-group-details]');
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            details.hidden = expanded;
        } else if (action === 'edit') {
            openModal('edit', card);
        }
    });
    function openModal(mode, card) {
        editingCard = mode === 'edit' ? card : null;
        title.textContent = mode === 'edit' ? 'Редактировать группу в ОК' : 'Добавить группу в ОК';
        submitBtn.textContent = mode === 'edit' ? 'Сохранить' : 'Добавить';
        resetForm(fieldsBox);
        if (editingCard) loadCardIntoForm(editingCard, fieldsBox);
        submitBtn.disabled = !isFormValid();
        modal.hidden = false;
        const first = fieldsBox.querySelector('input');
        if (first) first.focus();
    }
    function closeModal() {
        modal.hidden = true;
        editingCard = null;
    }
    function isFormValid() {
        return GROUP_FIELDS.filter(f => f.required)
            .every(f => fieldsBox.querySelector(`[name="${f.key}"]`).value.trim() !== '');
    }
    function collectForm() {
        const d = {};
        GROUP_FIELDS.forEach(f => { d[f.key] = fieldsBox.querySelector(`[name="${f.key}"]`).value.trim(); });
        return d;
    }
    function loadCardIntoForm(card, box) {
        const data = JSON.parse(card.dataset.payload || '{}');
        GROUP_FIELDS.forEach(f => {
            const input = box.querySelector(`[name="${f.key}"]`);
            input.value = data[f.key] || '';
            syncField(input);
        });
    }
});
function buildModalFields(box) {
    box.innerHTML = '';
    GROUP_FIELDS.forEach(f => {
        const wrap = document.createElement('label');
        wrap.className = 'field';
        wrap.innerHTML =
            `<input class="field-input" type="text" name="${f.key}" autocomplete="off"${f.required ? ' data-required' : ''}>` +
            `<span class="field-label">${f.label}</span>` +
            `<button type="button" class="field-clear" aria-label="Очистить поле" tabindex="-1"></button>` +
            `<span class="field-tip" role="tooltip">Очистить поле</span>`;
        const input = wrap.querySelector('input');
        const clear = wrap.querySelector('.field-clear');
        input.addEventListener('input', () => syncField(input));
        input.addEventListener('blur', () => syncField(input));
        clear.addEventListener('click', () => { input.value = ''; syncField(input); input.focus();
            input.dispatchEvent(new Event('input', { bubbles: true })); });
        box.appendChild(wrap);
    });
}
function syncField(input) {
    input.closest('.field').classList.toggle('is-filled', input.value.trim() !== '');
}
function resetForm(box) {
    box.querySelectorAll('input').forEach(i => { i.value = ''; syncField(i); });
}
function createCard(data) {
    const tpl = document.getElementById('groupTemplate');
    const card = tpl.content.firstElementChild.cloneNode(true);
    fillCard(card, data);
    card.querySelectorAll('.inline-num[data-numeric]').forEach(attachNumericOnly);
    card.querySelectorAll('.inline-email[data-email]').forEach(attachEmailSuggest);
    return card;
}
function fillCard(card, data) {
    card.querySelector('[data-field="key"]').textContent = data.key || '';
    card.querySelector('[data-field="appId"]').textContent = data.appId || '';
    card.querySelector('[data-field="groupId"]').textContent = data.groupId || '';
    card.querySelector('[data-field="password"]').textContent = data.password || '';
    card.querySelector('[data-field="login"]').textContent = data.login || '';
    const link = card.querySelector('[data-group-link]');
    link.textContent = data.link || '—';
    link.href = data.link || '#';
    const alt = card.querySelector('[data-group-altname]');
    if (alt) alt.textContent = data.altName ? `(${data.altName})` : '';
    card.dataset.payload = JSON.stringify(data);
}
function attachNumericOnly(input) {
    input.addEventListener('input', () => {
        const cleaned = input.value.replace(/\D+/g, '');
        if (cleaned !== input.value) input.value = cleaned;
    });
    input.addEventListener('keydown', (e) => {
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/\d/.test(e.key)) e.preventDefault();
    });
}
let _ghostSpan = null;
function autoSizeEmail(input) {
    if (!_ghostSpan) {
        _ghostSpan = document.createElement('span');
        _ghostSpan.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
        document.body.appendChild(_ghostSpan);
    }
    const cs = getComputedStyle(input);
    _ghostSpan.style.font = cs.font;
    _ghostSpan.style.letterSpacing = cs.letterSpacing;
    _ghostSpan.textContent = input.value || input.placeholder || ' ';
    input.style.width = (_ghostSpan.offsetWidth + 16) + 'px';
}
function attachEmailSuggest(input) {
    autoSizeEmail(input);
    input.addEventListener('input', () => autoSizeEmail(input));
    const menu = document.createElement('div');
    menu.className = 'email-suggest';
    menu.hidden = true;
    input.insertAdjacentElement('afterend', menu);
    input.addEventListener('input', () => {
        const val = input.value;
        const at = val.indexOf('@');
        if (at === -1) { menu.hidden = true; return; }
        const local = val.slice(0, at);
        const part = val.slice(at + 1).toLowerCase();
        const pool = part === '' ? EMAIL_DOMAINS_TOP : EMAIL_DOMAINS_ALL;
        const matches = pool.filter(d => part === '' || d.startsWith(part)).slice(0, 10);
        if (!matches.length) { menu.hidden = true; return; }
        menu.innerHTML = matches.map(d => `<div class="email-suggest-item">${local}@${d}</div>`).join('');
        menu.hidden = false;
    });
    menu.addEventListener('mousedown', (e) => {
        const item = e.target.closest('.email-suggest-item');
        if (!item) return;
        e.preventDefault();
        input.value = item.textContent;
        menu.hidden = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('blur', () => { setTimeout(() => { menu.hidden = true; }, 120); });
}
function confirmAction({ title = 'Подтвердить?', text = '', yes = 'Да', no = 'Отменить' } = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        if (!modal) { resolve(window.confirm(text)); return; }
        modal.querySelector('#confirmTitle').textContent = title;
        modal.querySelector('#confirmText').textContent = text;
        const yesBtn = modal.querySelector('#confirmYes');
        const noBtn = modal.querySelector('#confirmNo');
        const closeBtn = modal.querySelector('#confirmModalClose');
        yesBtn.textContent = yes;
        noBtn.textContent = no;
        modal.hidden = false;
        yesBtn.focus();
        const finish = (ok) => {
            modal.hidden = true;
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            closeBtn.removeEventListener('click', onNo);
            modal.removeEventListener('click', onOverlay);
            document.removeEventListener('keydown', onKey);
            resolve(ok);
        };
        const onYes = () => finish(true);
        const onNo = () => finish(false);
        const onOverlay = (e) => { if (e.target === modal) finish(false); };
        const onKey = (e) => {
            if (e.key === 'Escape') finish(false);
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
        };
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        closeBtn.addEventListener('click', onNo);
        modal.addEventListener('click', onOverlay);
        document.addEventListener('keydown', onKey);
    });
}
const STORAGE_KEY = 'vsevn_ok_groups_v1';
function persistGroups() {
    try {
        const cards = document.querySelectorAll('.group-card');
        const arr = [...cards].map((c) => {
            try { return JSON.parse(c.dataset.payload || '{}'); } catch (e) { return {}; }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        console.warn('persist failed', e);
    }
}
function restoreGroups(list) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr) || !arr.length) return;
        arr.forEach((data) => {
            const card = createCard(data);
            list.appendChild(card);
        });
        renumber(list);
    } catch (e) {
        console.warn('restore failed', e);
    }
}
function toggleClearBtn(fileField) {
    const inp = fileField.querySelector('.file-input');
    const btn = fileField.querySelector('[data-clear]');
    if (!inp || !btn) return;
    btn.hidden = inp.value.trim() === '';
}
function renumber(list) {
    if (!list) return;
    [...list.querySelectorAll('[data-group]')].forEach((card, i) => {
        const n = card.querySelector('[data-group-number]');
        if (n) n.textContent = '№' + (i + 1);
    });
}
async function countXlsxVacancies(file) {
    const buf = await file.arrayBuffer();
    const xml = await readXlsxSheet1(buf);
    if (!xml) return 0;
    const rowMatches = xml.match(/<row[\s>]/g) || [];
    return Math.max(0, rowMatches.length - 1);
}
async function readXlsxSheet1(buf) {
    const view = new DataView(buf);
    const u8 = new Uint8Array(buf);
    const td = new TextDecoder('utf-8', { fatal: false });
    let eocd = -1;
    const maxScan = Math.max(0, u8.length - 65557);
    for (let i = u8.length - 22; i >= maxScan; i--) {
        if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd === -1) return null;
    const cdSize = view.getUint32(eocd + 12, true);
    const cdOff = view.getUint32(eocd + 16, true);
    let ptr = cdOff, lhOff = -1, method = 0, compSize = 0;
    while (ptr < cdOff + cdSize) {
        if (view.getUint32(ptr, true) !== 0x02014b50) break;
        method = view.getUint16(ptr + 10, true);
        compSize = view.getUint32(ptr + 20, true);
        const fnLen = view.getUint16(ptr + 28, true);
        const exLen = view.getUint16(ptr + 30, true);
        const cmLen = view.getUint16(ptr + 32, true);
        const localOff = view.getUint32(ptr + 42, true);
        const name = td.decode(u8.subarray(ptr + 46, ptr + 46 + fnLen));
        if (name === 'xl/worksheets/sheet1.xml') {
            lhOff = localOff;
            break;
        }
        ptr += 46 + fnLen + exLen + cmLen;
    }
    if (lhOff === -1) return null;
    if (view.getUint32(lhOff, true) !== 0x04034b50) return null;
    const lhFnLen = view.getUint16(lhOff + 26, true);
    const lhExLen = view.getUint16(lhOff + 28, true);
    const dataStart = lhOff + 30 + lhFnLen + lhExLen;
    const dataEnd = dataStart + compSize;
    const compData = u8.subarray(dataStart, dataEnd);
    if (method === 0) return td.decode(compData);
    if (method === 8) {
        const ds = new DecompressionStream('deflate-raw');
        const stream = new Blob([compData]).stream().pipeThrough(ds);
        const ab = await new Response(stream).arrayBuffer();
        return td.decode(new Uint8Array(ab));
    }
    return null;
}
