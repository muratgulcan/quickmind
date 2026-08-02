/** Mirrors Language.swift */
export const Language = Object.freeze({
  turkish: 'tr',
  english: 'en',
});

export const ALL_LANGUAGES = [Language.english, Language.turkish];

export function languageDisplayName(language) {
  switch (language) {
    case Language.turkish: return 'Türkçe';
    case Language.english: return 'English';
    default: return language;
  }
}
