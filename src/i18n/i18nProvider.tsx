import { IntlProvider } from 'react-intl';
import { useAppSelector } from 'redux/index';
import { locales, LocaleType } from 'i18n';

export const I18nProvider = ({ children }: { children: JSX.Element }) => {
  const locale = useAppSelector<LocaleType>((state) => state.user.locale);
  const messages = locales[locale];

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};
