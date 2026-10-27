import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const PENDING_NOTE = t({
  en: 'add when approved',
  hy: 'ավելացնել հաստատումից հետո',
  ru: 'добавить после согласования',
});

export const CONTACT_EMAIL = 'info@nexoratechnology.org';

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
        detail: CONTACT_EMAIL,
        href: `mailto:${CONTACT_EMAIL}`,
      },
      {
        icon: 'smartphone' satisfies AppIconName,
        label: t({ en: 'Phone', hy: 'Հեռախոս', ru: 'Телефон' }),
        detail: '{CONTACT_PHONE}',
        href: '',
      },
      // {
      //   icon: 'globe' satisfies AppIconName,
      //   label: t({ en: 'Office address', hy: 'Գրասենյակի հասցե', ru: 'Адрес офиса' }),
      //   detail: '{CONTACT_ADDRESS}',
      //   href: '',
      // },
    ],
  },
} as const satisfies Dictionary;

export default contactChannelsContent;
