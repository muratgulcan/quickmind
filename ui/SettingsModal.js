/** Settings modal — ports showSettings from ViewController */
import { GameMode } from '../src/GameMode.js';
import { MathOperation } from '../src/MathOperation.js';
import { Language, ALL_LANGUAGES, languageDisplayName } from '../src/Language.js';
import { el } from '../utils/helpers.js';

const MODE_ORDER = [
  GameMode.math,
  GameMode.color,
  GameMode.shapes,
  GameMode.minMax,
  GameMode.memory,
];

const MODE_LABELS = {
  [GameMode.math]: ['mathMode', 'mathDescription'],
  [GameMode.color]: ['colorMode', 'colorDescription'],
  [GameMode.shapes]: ['emojiMode', 'emojiDescription'],
  [GameMode.minMax]: ['minMaxMode', 'minMaxDescription'],
  [GameMode.memory]: ['memoryMode', 'memoryDescription'],
};

const OP_ORDER = [
  MathOperation.addition,
  MathOperation.subtraction,
  MathOperation.multiplication,
  MathOperation.division,
];

const OP_LABELS = {
  [MathOperation.addition]: 'addition',
  [MathOperation.subtraction]: 'subtraction',
  [MathOperation.multiplication]: 'multiplication',
  [MathOperation.division]: 'division',
};

const PRIVACY_URL = 'https://github.com/muratgulcan/quick-mind';

export function openSettingsModal(root, { localization, settingsManager, onClose, onLanguageChange }) {
  settingsManager.loadSettings();

  const selectedModes = new Set(
    settingsManager.selectedGameModes.size > 0
      ? settingsManager.selectedGameModes
      : MODE_ORDER,
  );
  const selectedOps = new Set(
    settingsManager.selectedMathOperations.size > 0
      ? settingsManager.selectedMathOperations
      : OP_ORDER,
  );
  let language = settingsManager.currentLanguage;

  const backdrop = el('div', { className: 'modal-backdrop' });
  const modal = el('div', { className: 'modal' });
  const header = el('div', { className: 'modal-header' }, [
    el('h2', { text: localization.localizedString('settingsTitle') }),
    el('p', {
      className: 'modal-desc',
      text: localization.localizedString('settingsDescription'),
    }),
  ]);

  const body = el('div', { className: 'modal-body' });

  // Language
  const langBlock = el('div', { className: 'setting-block' }, [
    el('div', { className: 'setting-name', text: localization.localizedString('language') }),
    el('p', {
      className: 'setting-help',
      text: localization.localizedString('languageDescription'),
    }),
  ]);
  const langToggle = el('div', { className: 'lang-toggle' });
  for (const lang of ALL_LANGUAGES) {
    const btn = el('button', {
      type: 'button',
      className: lang === language ? 'active' : '',
      text: languageDisplayName(lang),
      onClick: () => {
        language = lang;
        localization.currentLanguage = lang;
        settingsManager.currentLanguage = lang;
        persist();
        onLanguageChange?.(lang);
        // Rebuild to refresh labels
        close(false);
        openSettingsModal(root, {
          localization,
          settingsManager,
          onClose,
          onLanguageChange,
        });
      },
    });
    langToggle.appendChild(btn);
  }
  langBlock.appendChild(langToggle);
  body.appendChild(langBlock);

  const modeSwitches = new Map();
  let mathOpsWrap = null;

  for (const mode of MODE_ORDER) {
    const [nameKey, descKey] = MODE_LABELS[mode];
    const row = el('div', { className: 'setting-row' });
    const left = el('div', {}, [
      el('div', { className: 'setting-name', text: localization.localizedString(nameKey) }),
    ]);
    const sw = makeSwitch(selectedModes.has(mode));
    modeSwitches.set(mode, sw.input);
    row.append(left, sw.root);

    const block = el('div', { className: 'setting-block' }, [
      row,
      el('p', { className: 'setting-help', text: localization.localizedString(descKey) }),
    ]);

    if (mode === GameMode.math) {
      mathOpsWrap = el('div', {
        className: `sub-settings${selectedModes.has(GameMode.math) ? '' : ' disabled'}`,
      });
      for (const op of OP_ORDER) {
        const opRow = el('div', { className: 'setting-row', style: { marginTop: '8px' } });
        opRow.append(
          el('div', { className: 'setting-name', text: localization.localizedString(OP_LABELS[op]) }),
          makeSwitch(selectedOps.has(op), (checked) => {
            if (checked) selectedOps.add(op);
            else selectedOps.delete(op);
          }).root,
        );
        mathOpsWrap.appendChild(opRow);
      }
      block.appendChild(mathOpsWrap);

      sw.input.addEventListener('change', () => {
        if (sw.input.checked) {
          selectedModes.add(GameMode.math);
          mathOpsWrap.classList.remove('disabled');
          if (![...selectedOps].length) {
            OP_ORDER.forEach((op) => selectedOps.add(op));
          }
        } else {
          selectedModes.delete(GameMode.math);
          mathOpsWrap.classList.add('disabled');
        }
      });
    } else {
      sw.input.addEventListener('change', () => {
        if (sw.input.checked) selectedModes.add(mode);
        else selectedModes.delete(mode);
      });
    }

    body.appendChild(block);
  }

  const footer = el('div', { className: 'modal-footer' });
  const privacyBtn = el('button', {
    className: 'linkish',
    type: 'button',
    text: localization.localizedString('privacyPolicy'),
    onClick: () => {
      try {
        window.open(PRIVACY_URL, '_blank', 'noopener,noreferrer');
      } catch {
        /* restricted in some embeds */
      }
    },
  });
  const closeBtn = el('button', {
    className: 'btn btn-red',
    type: 'button',
    text: localization.localizedString('close'),
    onClick: () => close(true),
  });
  footer.append(privacyBtn, closeBtn);

  modal.append(header, body, footer);
  backdrop.appendChild(modal);
  root.appendChild(backdrop);

  function persist() {
    const modes = new Set();
    for (const mode of MODE_ORDER) {
      if (modeSwitches.get(mode)?.checked) modes.add(mode);
    }
    settingsManager.saveSettings(modes, selectedOps, language);
  }

  function close(save) {
    if (save) persist();
    backdrop.remove();
    onClose?.(save);
  }

  return { close: () => close(true) };
}

function makeSwitch(checked, onChange) {
  const input = el('input', { type: 'checkbox' });
  input.checked = checked;
  if (onChange) {
    input.addEventListener('change', () => onChange(input.checked));
  }
  const root = el('label', { className: 'switch' }, [input, el('span')]);
  return { root, input };
}
