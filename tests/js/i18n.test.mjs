/**
 * Tests for the dashboard i18n helper: dictionary completeness, language
 * detection, fallbacks, persistence and static-attribute application.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  LANGUAGES, LANGUAGE_LABELS, MESSAGES, detectLanguage, isLanguage,
  readStoredLanguage, storeLanguage, translate, applyStaticMessages, createI18n,
} from '../../static/i18n.js';

test('every t() key referenced by dashboard modules exists in the dictionary', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const name of ['app.js', 'scene.js']) {
    const source = readFileSync(join(here, '..', '..', 'static', name), 'utf8');
    const keys = [...source.matchAll(/\b(?:i18n\.)?t\(\s*'([A-Za-z0-9_]+)'/g)].map((match) => match[1]);
    assert.ok(keys.length > 0, `no t() calls found in ${name}`);
    for (const key of keys) {
      assert.ok(key in MESSAGES, `${name} uses missing key: ${key}`);
    }
  }
});

test('every message key exists in all four languages and is non-empty', () => {
  for (const [key, entry] of Object.entries(MESSAGES)) {
    assert.deepStrictEqual(Object.keys(entry).sort(), [...LANGUAGES].sort(), key);
    for (const language of LANGUAGES) {
      assert.ok(entry[language].trim().length > 0, `${key} (${language}) is empty`);
    }
  }
});

test('language labels cover exactly the supported languages', () => {
  assert.deepStrictEqual(Object.keys(LANGUAGE_LABELS).sort(), [...LANGUAGES].sort());
});

test('isLanguage', () => {
  assert.ok(isLanguage('zh-HK'));
  assert.ok(!isLanguage('zh'));
  assert.ok(!isLanguage(undefined));
});

test('detectLanguage maps browser tags with Chinese subtag fallbacks', () => {
  assert.equal(detectLanguage(['zh-TW', 'en']), 'zh-Hant');
  assert.equal(detectLanguage(['zh-HK']), 'zh-HK');
  assert.equal(detectLanguage(['zh-MO', 'en']), 'zh-HK');
  assert.equal(detectLanguage(['zh-CN']), 'zh-Hans');
  assert.equal(detectLanguage(['zh']), 'zh-Hans');
  assert.equal(detectLanguage(['en-GB']), 'en');
  assert.equal(detectLanguage(['fr', 'zh-Hant']), 'zh-Hant');
  assert.equal(detectLanguage([]), 'en');
  assert.equal(detectLanguage(undefined), 'en');
});

test('translate falls back to English then to the key', () => {
  assert.equal(translate('zh-Hans', 'card_events'), '事件');
  assert.equal(translate('zh-Hant', 'value_unknown'), '未知');
  assert.equal(translate('zh-HK', 'value_unknown'), 'Unknown');
  assert.equal(translate('en', 'card_twin'), 'Digital Twin');
  assert.equal(translate('fr', 'card_twin'), 'Digital Twin');
  assert.equal(translate('en', 'definitely_not_a_key'), 'definitely_not_a_key');
});

test('translate substitutes {vars} and leaves unknown placeholders intact', () => {
  const text = translate('en', 'replay_points', { index: 3, total: 40 });
  assert.equal(text, '3 / 40 points');
  assert.equal(
    translate('en', 'jump_alert', { j: 2, deg: 30 }),
    '⚠ J2 jumped 30° in one sample (threshold {threshold}°, {count} total). Possible RTDE packet loss.',
  );
});

test('stored language round-trips and invalid stored values are ignored at read time', () => {
  const storage = fakeStorage();
  assert.equal(readStoredLanguage(storage), null);
  storeLanguage(storage, 'zh-Hant');
  assert.equal(readStoredLanguage(storage), 'zh-Hant');
  // storeLanguage persists raw values (matching theme.js); the validation
  // happens on read, so a corrupted value degrades to the detected default
  // instead of breaking the dashboard.
  storeLanguage(storage, 'klingon');
  assert.equal(readStoredLanguage(storage), null);
});

test('createI18n applies attributes, persists changes and notifies subscribers', () => {
  const doc = fakeDoc({
    'greeting': { dataset: { i18n: 'card_events' }, textContent: '' },
    'theme-btn': { dataset: { i18nTitle: 'theme_title' }, attributes: {} },
  });
  const storage = fakeStorage();
  const seen = [];
  const i18n = createI18n({ doc, storage });
  i18n.subscribe((language) => seen.push(language));

  i18n.init();
  assert.equal(doc.documentElement.getAttribute('data-lang'), 'en');
  assert.equal(doc.elements.greeting.textContent, 'Events');
  assert.equal(doc.elements['theme-btn'].attributes.title, 'Toggle light/dark theme (T)');

  assert.equal(i18n.set('klingon'), 'en');
  assert.equal(i18n.set('zh-HK'), 'zh-HK');
  assert.deepEqual(seen, ['zh-HK']);
  assert.equal(doc.documentElement.getAttribute('data-lang'), 'zh-HK');
  assert.equal(doc.documentElement.getAttribute('lang'), 'zh-HK');
  assert.equal(doc.elements.greeting.textContent, '事件');
  assert.equal(storage._data['ur-monitor-language'], 'zh-HK');
  assert.equal(i18n.t('label_mode'), '模式');
  assert.equal(i18n.t('replay_points', { index: 0, total: 9 }), '0 / 9 點');
});

test('stored language wins over browser detection', () => {
  const storage = fakeStorage({ 'ur-monitor-language': 'zh-Hans' });
  const i18n = createI18n({ doc: fakeDoc(), storage });
  assert.equal(i18n.language, 'zh-Hans');
});

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    _data: data,
  };
}

function fakeDoc(elements = {}) {
  const attributes = {};
  for (const element of Object.values(elements)) {
    element.attributes ??= {};
    element.dataset ??= {};
    element.setAttribute = (name, value) => { element.attributes[name] = value; };
  }
  return {
    elements,
    documentElement: {
      setAttribute: (name, value) => { attributes[name] = value; },
      getAttribute: (name) => attributes[name] ?? null,
      style: {},
    },
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') {
        return Object.entries(elements)
          .filter(([, element]) => element.dataset.i18n)
          .map(([key, element]) => {
            element.dataset.i18n ??= key;
            return element;
          });
      }
      if (selector === '[data-i18n-title]') {
        return Object.entries(elements)
          .filter(([, element]) => element.dataset.i18nTitle)
          .map(([key, element]) => {
            element.dataset.i18nTitle ??= key;
            return element;
          });
      }
      return [];
    },
  };
}
