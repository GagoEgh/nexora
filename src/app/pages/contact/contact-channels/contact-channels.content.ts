import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';
import { ORGANIZATION } from '../../../core/seo/organization';
export const CONTACT_EMAIL = ORGANIZATION.email;

const contactChannelsContent = {
  key: 'contact-channels',
  content: {
    title: t({
      en: 'Other ways to reach us',
      hy: 'Մեզ հետ կապվելու այլ եղանակներ',
      ru: 'Другие способы связаться с нами',
    }),
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
