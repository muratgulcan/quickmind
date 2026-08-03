/** Apply light / dark / system theme to document */
import { Theme } from '../src/Theme.js';

export function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme || Theme.system;

  if (theme === Theme.system) {
    root.removeAttribute('data-theme-forced');
  } else {
    root.setAttribute('data-theme-forced', theme);
  }
}

export function resolveTheme(theme) {
  if (theme === Theme.light || theme === Theme.dark) return theme;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.dark
      : Theme.light;
  } catch {
    return Theme.light;
  }
}
