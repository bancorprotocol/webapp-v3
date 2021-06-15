import en from 'i18n/en.json';
import he from 'i18n/he.json';

export type LocaleType = 'en' | 'he';

export const locales = {
  en,
  he,
};

//To add a new locale check this list https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes in the 639-1 coulmn
export const getLanguageByLocale = (locale: string): string => {
  switch (locale) {
    case 'en':
      return 'English';
    case 'he':
      return 'עברית';
    default:
      return 'English';
  }
};
