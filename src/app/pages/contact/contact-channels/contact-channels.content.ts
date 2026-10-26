import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const PENDING_NOTE = t({
  en: 'add when approved',
  hy: 'ավելացնել հաստատումից հետո',
  ru: 'добавить после согласования',
});

const contactChannelsContent = {
  key: 'contact-channels',
  content: {
    title: t({
      en: 'Other ways to reach us',
      hy: 'Մեզ հետ կապվելու այլ եղանակներ',
      ru: 'Другие способы связаться с нами',
    }),
    pendingNote: PENDING_NOTE,
    items: [
      {
        icon: 'mail' satisfies AppIconName,
        label: t({ en: 'Email', hy: 'Էլ. փոստ', ru: 'Эл. почта' }),
        token: '{CONTACT_EMAIL}',
      },
      {
        icon: 'message-square' satisfies AppIconName,
        label: t({ en: 'Phone', hy: 'Հեռախոս', ru: 'Телефон' }),
        token: '{CONTACT_PHONE}',
      },
      {
        icon: 'globe' satisfies AppIconName,
        label: t({ en: 'Office address', hy: 'Գրասենյակի հասցե', ru: 'Адрес офиса' }),
        token: '{CONTACT_ADDRESS}',
      },
    ],
  },
} as const satisfies Dictionary;

export default contactChannelsContent;
