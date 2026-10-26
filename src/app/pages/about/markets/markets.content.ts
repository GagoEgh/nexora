import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const marketsContent = {
  key: 'about-markets',
  content: [
    {
      icon: 'globe' satisfies AppIconName,
      title: t({ en: 'Armenia', hy: 'Հայաստան', ru: 'Армения' }),
      text: t({
        en: 'We work with startups, growing businesses and established companies in Armenia’s technology and business community.',
        hy: 'Մենք աշխատում ենք ստարտափների, աճող բիզնեսների և կայացած ընկերությունների հետ՝ Հայաստանի տեխնոլոգիական և բիզնես համայնքում։',
        ru: 'Мы работаем со стартапами, растущим бизнесом и состоявшимися компаниями в технологическом и деловом сообществе Армении.',
      }),
    },
    {
      icon: 'globe' satisfies AppIconName,
      title: t({
        en: 'International markets',
        hy: 'Միջազգային շուկաներ',
        ru: 'Международные рынки',
      }),
      text: t({
        en: 'We partner with clients and agencies abroad, from early-stage product teams to software companies extending their capacity.',
        hy: 'Մենք գործընկերություն ենք կառուցում արտասահմանյան հաճախորդների և գործակալությունների հետ՝ վաղ փուլի պրոդուկտային թիմերից մինչև ծրագրային ընկերություններ, որոնք ընդլայնում են իրենց հզորությունը։',
        ru: 'Мы сотрудничаем с клиентами и агентствами за рубежом — от продуктовых команд на ранней стадии до софтверных компаний, расширяющих свои возможности.',
      }),
    },
  ],
} as const satisfies Dictionary;

export default marketsContent;
