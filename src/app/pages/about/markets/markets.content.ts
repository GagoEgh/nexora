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
        hy: 'Մենք համագործակցում ենք ստարտափների, զարգացող բիզնեսների և կայացած ընկերությունների հետ՝ Հայաստանի տեխնոլոգիական և գործարար միջավայրում։',
        ru: 'Мы сотрудничаем со стартапами, развивающимися компаниями и состоявшимся бизнесом в технологической и деловой среде Армении.',
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
        hy: 'Մենք համագործակցում ենք արտասահմանյան հաճախորդների և գործակալությունների հետ՝ վաղ փուլում գտնվող արտադրանքների թիմերից մինչև ծրագրային ապահովման ընկերություններ, որոնք ցանկանում են ընդլայնել իրենց զարգացման կարողությունները։',
        ru: 'Мы сотрудничаем с зарубежными клиентами и агентствами — от продуктовых команд на ранних этапах развития до IT-компаний, которым необходимо расширить свои возможности разработки.',
      }),
    },
  ],
} as const satisfies Dictionary;

export default marketsContent;
