import dayjs, { extend, locale } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

extend(relativeTime);

export const useRelativeDateString = (from: Date, to: Date = new Date()) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  locale(language);
  return dayjs(from).from(to);
};
