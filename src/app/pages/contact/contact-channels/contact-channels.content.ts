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
        label: t({
          en: 'Email',
          hy: 'Էլեկտրոնային փոստ',
          ru: 'Электронная почта',
        }),
        detail: CONTACT_EMAIL,
        href: `mailto:${CONTACT_EMAIL}`,
      },
    ],
  },
} as const satisfies Dictionary;

export default contactChannelsContent;
