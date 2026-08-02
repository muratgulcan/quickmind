/** Scoreboard modal — ports ScoreboardViewController */
import { el, formatDate } from '../utils/helpers.js';

export function openScoreboardModal(root, { localization, gameResults, onClose }) {
  const backdrop = el('div', { className: 'modal-backdrop' });
  const modal = el('div', { className: 'modal' });

  const header = el('div', { className: 'modal-header' }, [
    el('h2', { text: localization.localizedString('scoreboardTitle') }),
  ]);

  const body = el('div', { className: 'modal-body' });
  const sorted = [...gameResults].sort((a, b) => b.score - a.score).slice(0, 3);

  if (sorted.length === 0) {
    body.appendChild(
      el('p', {
        className: 'empty-state',
        text: localization.localizedString('noGamesYet'),
      }),
    );
  } else {
    sorted.forEach((result, index) => {
      body.appendChild(
        el('div', { className: 'result-card' }, [
          el('div', { className: 'result-pos', text: `#${index + 1}` }),
          el('div', {}, [
            el('div', {
              className: 'result-score',
              text: `${localization.localizedString('score')}: ${result.score}`,
            }),
            el('div', {
              className: 'result-meta',
              text: `${localization.localizedString('round')}: ${result.rounds}`,
            }),
            el('div', {
              className: 'result-meta',
              text: `${localization.localizedString('difficulty')}: ${result.difficulty}`,
            }),
          ]),
          el('div'),
          el('div', {
            className: 'result-date',
            text: formatDate(result.date, localization.currentLanguage),
          }),
        ]),
      );
    });
  }

  const footer = el('div', { className: 'modal-footer' }, [
    el('button', {
      className: 'btn btn-red',
      type: 'button',
      text: localization.localizedString('close'),
      onClick: () => {
        backdrop.remove();
        onClose?.();
      },
    }),
  ]);

  modal.append(header, body, footer);
  backdrop.appendChild(modal);
  root.appendChild(backdrop);

  return {
    close: () => {
      backdrop.remove();
      onClose?.();
    },
  };
}
