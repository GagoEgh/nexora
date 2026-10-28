import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const relatedServicesContent = {
  key: 'ai-agent-related-services',
  content: {
    eyebrow: t({
      en: 'Related services',
      hy: 'Առնչվող ծառայություններ',
      ru: 'Сопутствующие услуги',
    }),
    title: t({
      en: 'Often combined with this service.',
      hy: 'Այս ծառայության հետ հաճախ առաջարկվող լուծումներ։',
      ru: 'Услуги, которые часто дополняют это решение.',
    }),
    engage: {
      eyebrow: t({
        en: 'How to engage',
        hy: 'Համագործակցության ձևաչափեր',
        ru: 'Форматы сотрудничества',
      }),
      title: t({
        en: 'Usually delivered as',
        hy: 'Հիմնական ձևաչափերը',
        ru: 'Основные форматы работы',
      }),
      models: [
        {
          icon: 'target' satisfies AppIconName,
          title: t({
            en: 'Project-Based',
            hy: 'Նախագծային համագործակցություն',
            ru: 'Проектный формат',
          }),
          text: t({
            en: 'Scoped first automation',
            hy: 'Հստակ սահմանված ծավալով առաջին ավտոմատացման լուծում',
            ru: 'Первая автоматизация с чётко определённым объёмом работ',
          }),
        },
        {
          icon: 'handshake' satisfies AppIconName,
          title: t({
            en: 'Long-Term Partnership',
            hy: 'Երկարաժամկետ գործընկերություն',
            ru: 'Долгосрочное партнёрство',
          }),
          text: t({
            en: 'Expanding automation over time',
            hy: 'Ավտոմատացման լուծումների աստիճանական ընդլայնում',
            ru: 'Постепенное расширение автоматизации',
          }),
        },
        {
          icon: 'wrench' satisfies AppIconName,
          title: t({
            en: 'Maintenance & Support',
            hy: 'Տեխնիկական սպասարկում և աջակցություն',
            ru: 'Техническое сопровождение и поддержка',
          }),
          text: t({
            en: 'Monitoring and improvements',
            hy: 'Աշխատանքի վերահսկում և շարունակական բարելավումներ',
            ru: 'Мониторинг работы и постоянное совершенствование',
          }),
        },
      ],
    },
  },
} as const satisfies Dictionary;

export default relatedServicesContent;
