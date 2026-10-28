import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const engagementModelsContent = {
  key: 'engagement-models',
  content: {
    eyebrow: t({
      en: 'Engagement models',
      hy: 'Համագործակցության ձևաչափեր',
      ru: 'Форматы сотрудничества',
    }),
    title: t({
      en: 'Collaboration that fits your situation.',
      hy: 'Համագործակցության ձևաչափեր՝ ձեր կարիքներին համապատասխան։',
      ru: 'Форматы сотрудничества под ваши задачи.',
    }),
    intro: t({
      en: 'Choose how we work together. Scope, terms and responsibilities are agreed individually for every engagement.',
      hy: 'Ընտրեք համագործակցության ձեզ հարմար ձևաչափը։ Աշխատանքի ծավալը, պայմաններն ու պատասխանատվության շրջանակը համաձայնեցվում են անհատապես՝ յուրաքանչյուր համագործակցության համար։',
      ru: 'Выберите подходящий формат сотрудничества. Объём работ, условия и зоны ответственности согласовываются индивидуально для каждого проекта.',
    }),
    compare: t({
      en: 'Compare engagement models',
      hy: 'Համեմատել համագործակցության ձևաչափերը',
      ru: 'Сравнить форматы сотрудничества',
    }),
    bestFor: t({
      en: 'Best for',
      hy: 'Հարմար է',
      ru: 'Подходит для',
    }),
    models: [
      {
        icon: 'target' satisfies AppIconName,
        title: t({
          en: 'Project-Based Development',
          hy: 'Նախագծային մշակում',
          ru: 'Проектная разработка',
        }),
        description: t({
          en: 'Scoped projects with agreed requirements and deliverables.',
          hy: 'Հստակ սահմանված ծավալով նախագծեր՝ համաձայնեցված պահանջներով և ակնկալվող արդյունքներով։',
          ru: 'Проекты с чётко определённым объёмом работ, согласованными требованиями и ожидаемыми результатами.',
        }),
        bestFor: t({
          en: 'A defined product, feature or modernization.',
          hy: 'Հստակ սահմանված արտադրանքի կամ ֆունկցիոնալի մշակման, ինչպես նաև համակարգի արդիականացման համար։',
          ru: 'Разработка конкретного продукта или функциональности, а также модернизация существующей системы.',
        }),
      },
      {
        icon: 'users' satisfies AppIconName,
        title: t({
          en: 'Dedicated Development Teams',
          hy: 'Նախագծին նվիրված մշակման թիմեր',
          ru: 'Выделенные команды разработки',
        }),
        description: t({
          en: 'Senior specialists integrated into your project or assigned to agreed work.',
          hy: 'Senior մասնագետներ, որոնք ներգրավվում են ձեր նախագծում կամ իրականացնում նախապես համաձայնեցված աշխատանքները։',
          ru: 'Senior-специалисты, которые подключаются к вашему проекту или выполняют заранее согласованные задачи.',
        }),
        bestFor: t({
          en: 'Extending your team with senior capacity.',
          hy: 'Ձեր թիմն ընդլայնելու և փորձառու մասնագետների ներգրավմամբ տեխնիկական կարողություններն ավելացնելու համար։',
          ru: 'Расширение команды за счёт опытных специалистов и усиление технических компетенций.',
        }),
      },
      {
        icon: 'handshake' satisfies AppIconName,
        title: t({
          en: 'Long-Term Technical Partnership',
          hy: 'Երկարաժամկետ տեխնիկական գործընկերություն',
          ru: 'Долгосрочное техническое партнёрство',
        }),
        description: t({
          en: 'Ongoing product evolution and technical collaboration.',
          hy: 'Արտադրանքի շարունակական զարգացում և երկարաժամկետ տեխնիկական համագործակցություն։',
          ru: 'Постоянное развитие продукта и долгосрочное техническое сотрудничество.',
        }),
        bestFor: t({
          en: 'Products that keep evolving over years.',
          hy: 'Այն արտադրանքների համար, որոնք շարունակաբար զարգանում և կատարելագործվում են տարիների ընթացքում։',
          ru: 'Продукты, которые постоянно развиваются и совершенствуются на протяжении многих лет.',
        }),
      },
      {
        icon: 'tag' satisfies AppIconName,
        title: t({
          en: 'White-Label Development',
          hy: 'White-label մշակում',
          ru: 'White-label-разработка',
        }),
        description: t({
          en: 'Engineering execution for agencies and partners under agreed branding.',
          hy: 'Տեխնիկական լուծումների մշակում գործակալությունների և գործընկերների համար՝ նրանց ապրանքանիշով և նախապես համաձայնեցված պայմաններով։',
          ru: 'Разработка технических решений для агентств и партнёров под их брендом и на заранее согласованных условиях.',
        }),
        bestFor: t({
          en: 'Agencies delivering technical work to clients.',
          hy: 'Այն գործակալությունների համար, որոնք հաճախորդներին առաջարկում են տեխնիկական ծառայություններ և լուծումներ։',
          ru: 'Агентства, которые предоставляют клиентам услуги по разработке и реализации технических решений.',
        }),
      },
      {
        icon: 'wrench' satisfies AppIconName,
        title: t({
          en: 'Maintenance & Technical Support',
          hy: 'Տեխնիկական սպասարկում և աջակցություն',
          ru: 'Техническое сопровождение и поддержка',
        }),
        description: t({
          en: 'Continuous support, improvements and agreed technical responsibilities.',
          hy: 'Շարունակական տեխնիկական աջակցություն, համակարգի բարելավումներ և համաձայնեցված պարտավորությունների կատարում։',
          ru: 'Постоянная техническая поддержка, улучшение системы и выполнение согласованных технических обязательств.',
        }),
        bestFor: t({
          en: 'Live systems that need steady care.',
          hy: 'Գործող համակարգերի համար, որոնք կանոնավոր սպասարկման և շարունակական բարելավումների կարիք ունեն։',
          ru: 'Работающие системы, которым необходимы регулярное сопровождение и постоянное совершенствование.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default engagementModelsContent;
