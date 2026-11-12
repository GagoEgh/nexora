import { t, type Dictionary } from 'intlayer';
import type { AppIconName } from '../../../core/icons/icons';

const productContent = {
  key: 'expertise',
  content: {
    eyebrow: t({
      en: 'What we do',
      hy: 'Ինչ ենք մենք անում',
      ru: 'Чем мы занимаемся',
    }),
    title: t({
      en: 'End-to-end engineering, under one roof.',
      hy: 'Ինժեներական լուծումների ամբողջական ցիկլ՝ մեկ թիմում։',
      ru: 'Полный цикл инженерной разработки — в одной команде.',
    }),
    intro: t({
      en: 'Six capability areas that can work on their own or together within a single project — from first interface sketch to production infrastructure.',
      hy: 'Վեց մասնագիտական ուղղություն, որոնք կարող են գործել առանձին կամ համատեղ՝ մեկ նախագծի շրջանակում՝ ինտերֆեյսի առաջին էսքիզից մինչև արտադրական ենթակառուցվածքի պատրաստումն ու գործարկումը։',
      ru: 'Шесть направлений экспертизы, которые можно использовать по отдельности или объединить в рамках одного проекта — от первого эскиза интерфейса до готовой к эксплуатации инфраструктуры.',
    }),
    viewAll: t({
      en: 'View all 15 services',
      hy: 'Դիտել բոլոր 15 ծառայությունները',
      ru: 'Все 15 услуг',
    }),
    explore: t({
      en: 'Acquaint',
      hy: 'Ծանոթանալ',
      ru: 'Познакомиться',
    }),

    services: [
      {
        icon: 'smartphone' satisfies AppIconName,
        path: 'https://www.sellmewatch.com/',
        image: '/images/infiniti.png',
        title: t({
          en: 'Connected Car & Vehicle Management Mobile App',
          hy: 'Խելացի մեքենաների կառավարման հավելված',
          ru: 'Приложение для управления автомобилем',
        }),
        description: t({
          en: 'A premium mobile app for luxury vehicle owners, featuring remote control, GPS tracking, real-time monitoring, security alerts, and maintenance management.',
          hy: 'Շքեղ մեքենաների սեփականատերերի համար նախատեսված հավելված՝ մեքենայի հեռակառավարման, GPS հետևման, անվտանգության և սպասարկման կառավարման հնարավորություններով։',
          ru: 'Мобильное приложение для владельцев премиальных автомобилей с функциями удалённого управления, GPS-отслеживания, мониторинга и контроля обслуживания.',
        }),
      },
      {
        icon: 'smartphone' satisfies AppIconName,
        path: 'https://play.google.com/store/apps/details?id=org.mezave&pcampaignid=web_share',
        image: '/images/meal.jpeg',
        title: t({
          en: 'Community Food Sharing Mobile App',
          hy: 'Համայնքային սննդի փոխանակման բջջային հավելված',
          ru: 'Приложение для обмена продуктами питания',
        }),
        description: t({
          en: 'A community-driven mobile application designed to connect people through food sharing and social support, making it easier to provide meals to individuals and families in need.',
          hy: 'Համայնքային աջակցության և սննդի փոխանակման համար նախատեսված բջջային հավելված, որը միավորում է մարդկանց՝ հեշտացնելով սննդի տրամադրումը օգնության կարիք ունեցող անձանց և ընտանիքներին։',
          ru: 'Мобильное приложение, ориентированное на развитие сообщества и объединение людей посредством обмена продуктами питания и социальной поддержки, упрощающее предоставление питания нуждающимся людям и семьям.',
        }),
      },
      {
        icon: 'smartphone' satisfies AppIconName,
        path: 'https://apps.apple.com/us/app/draculai/id6744846504',
        image: '/images/medical.png',
        title: t({
          en: 'Health & Substance Tracking Mobile Application',
          hy: 'Բջջային հավելված ՝ առողջության և նյութերի հետևման համար',
          ru: 'Мобильное приложение для отслеживания состояния здоровья и психоактивных веществ',
        }),
        description: t({
          en: 'A secure mobile app for researching and tracking supplements and other substances, with detailed profiles, intake monitoring, and personalized health insights.',
          hy: 'Գաղտնիության վրա հիմնված հավելված՝ դեղամիջոցների և հավելումների ուսումնասիրման, հետևման ու կառավարման համար՝ առողջության տվյալների վերլուծությամբ։',
          ru: 'Конфиденциальное мобильное приложение для изучения и отслеживания лекарств, добавок и других веществ с персональной аналитикой здоровья.',
        }),
      },

      {
        icon: 'code' satisfies AppIconName,
        path: 'https://dresslav.com/',
        image: '/images/lave.jpg',
        title: t({
          en: 'LAV — E-commerce Website',
          hy: 'LAV — էլեկտրոնային առևտրի Կայք',
          ru: 'LAV — Сайт электронной коммерции',
        }),
        description: t({
          en: 'A modern e-commerce platform for LAV, featuring Armenian-inspired dressings, online shopping, and subscription options.',
          hy: 'LAV բրենդի e-commerce հարթակ՝ հայկական խոհանոցից ոգեշնչված սոուսների ներկայացման, առցանց վաճառքի և բաժանորդագրության հնարավորություններով։',
          ru: 'E-commerce платформа LAV для продажи соусов с онлайн-покупками и подпиской',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://abletonremakes.com/',
        image: '/images/muzic.jpeg',
        title: t({
          en: 'Digital Music Production E-commerce & Subscription Platform',
          hy: 'Երաժշտական նյութերի վաճառքի հարթակ',
          ru: 'Платформа электронной коммерции и подписки для производства цифровой музыки',
        }),
        description: t({
          en: 'A specialized e-commerce platform for music producers and DJs, offering premium Ableton templates, MIDI files, samples, presets, and instant digital downloads.',
          hy: 'Երաժշտական պրոդյուսերների և DJ-ների համար նախատեսված e-commerce հարթակ՝ պրեմիում սեմփլների, MIDI ֆայլերի, պրեսեթների և երաժշտական նախագծերի վաճառքով։',
          ru: 'Платформа электронной коммерции для музыкальных продюсеров и диджеев с продажей шаблонов Ableton, MIDI-файлов, сэмплов и пресетов.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.libraanalytics.com/',
        image: '/images/power.jpeg',
        title: t({
          en: 'Data Analytics & Business Consulting Website',
          hy: 'Տվյալների վերլուծության և բիզնես խորհրդատվության կայք',
          ru: 'Веб-сайт для анализа данных и бизнес-консалтинга',
        }),
        description: t({
          en: 'A corporate website for a data analytics and business consulting firm, showcasing its services, expertise, and team.',
          hy: 'Տվյալների վերլուծության և բիզնես խորհրդատվության ընկերության կորպորատիվ կայք՝ ծառայությունների և փորձագիտական թիմի ներկայացմամբ։',
          ru: 'Корпоративный сайт компании в сфере аналитики данных и бизнес-консалтинга, представляющий её услуги и экспертную команду.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.rijewelers.com/',
        image: '/images/je.jpeg',
        title: t({
          en: 'Robert Irwin Jewelers — E-commerce Website',
          hy: 'Robert Irwin Jewelers-էլեկտրոնային առևտրի Կայք',
          ru: 'Robert Irwin Jewelers — Сайт электронной коммерции',
        }),
        description: t({
          en: 'A premium jewelry e-commerce platform featuring fine jewelry, engagement rings, wedding bands, and diamonds.',
          hy: 'Պրեմիում զարդերի e-commerce հարթակ՝ մատանիների, ադամանդների և շքեղ աքսեսուարների առցանց վաճառքի համար։',
          ru: 'Премиальная e-commerce платформа Robert Irwin Jewelers для продажи ювелирных изделий, обручальных колец и украшений с бриллиантами.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://klinikeurope.co.uk/',
        image: '/images/klinik.jpeg',
        title: t({
          en: 'Medical Tourism & Healthcare Services Platform',
          hy: 'Բժշկական զբոսաշրջության հարթակ',
          ru: 'Платформа медицинского туризма и медицинских услуг',
        }),
        description: t({
          en: 'A medical tourism platform for an international clinic, featuring aesthetic and surgical treatments, personalized care plans, and online consultation booking.',
          hy: 'Միջազգային կլինիկայի բժշկական հարթակ՝ բուժծառայությունների, անհատական բուժման ծրագրերի և առցանց խորհրդատվության ամրագրման հնարավորություններով։',
          ru: 'Платформа медицинского туризма международной клиники с каталогом эстетических и хирургических услуг, персональными программами лечения и онлайн-записью на консультации.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.taiping.co.nz/',
        image: '/images/market.jpeg',
        title: t({
          en: 'Asian Supermarket & Wholesale Business Website',
          hy: 'Ասիական սուպերմարկետի և մեծածախ բիզնեսի կայք',
          ru: 'Веб-сайт Азиатского супермаркета и оптового бизнеса',
        }),
        description: t({
          en: 'A corporate website for an Asian supermarket and food distributor, showcasing its products, promotions, store locations, and wholesale services.',
          hy: 'Ասիական մթերքների սուպերմարկետների և բաշխման ընկերության կորպորատիվ կայք՝ ապրանքատեսականու, հատուկ առաջարկների և մեծածախ ծառայությունների ներկայացմամբ։',
          ru: 'Корпоративный сайт сети азиатских супермаркетов с каталогом товаров, акциями, адресами магазинов и услугами оптовых поставок.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://mertel.agency/sk/en/',
        image: '/images/mertal.jpeg',
        title: t({
          en: 'Corporate Website for a Global Experiential Marketing Agency',
          hy: 'Միջազգային մարքեթինգային գործակալության կայք',
          ru: 'Корпоративный сайт для Глобального агентства эмпирического маркетинга',
        }),
        description: t({
          en: 'A modenes compr the agency’s global reach, creative capabilities, and industry expertise.',
          hy: 'Միջազգային մարքեթինգային գործակալության կորպորատիվ կայք՝ միջոցառումների, բրենդային փորձառությունների և մարքեթինգային նախագծերի ներկայացմամբ։',
          ru: 'Корпоративный сайт международного маркетингового агентства, представляющий мероприятия, брендовые проекты и креативные маркетинговые решения.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.mastercraftjewelers.com/',
        image: '/images/master.jpeg',
        title: t({
          en: 'Luxury Jewelry E-commerce Platform',
          hy: 'Luxury Jewelry էլեկտրոնային առևտրի Կայք',
          ru: 'Luxury Jewelry Сайт электронной коммерции',
        }),
        description: t({
          en: 'An e-commerce platform designed for a premium jewelry brand, combining online jewelry sales, custom design capabilities, and personalized customer service.',
          hy: 'Պրեմիում դասի ոսկերչական ապրանքանիշի համար նախատեսված էլեկտրոնային առևտրի հարթակ, որը միավորում է զարդերի առցանց վաճառքը, անհատական դիզայնի հնարավորությունները և հաճախորդների անհատական սպասարկումը։',
          ru: 'Платформа электронной коммерции, разработанная для премиального ювелирного бренда, объединяющая онлайн-продажу ювелирных изделий, возможности индивидуального дизайна и персонализированное обслуживание клиентов.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.gotmatcha.com/',
        image: '/images/got.jpeg',
        title: t({
          en: 'Got Matcha E-commerce Platform',
          hy: 'Got Matcha էլեկտրոնային առևտրի Կայք',
          ru: 'Got Matcha Сайт электронной коммерции',
        }),
        description: t({
          en: 'A modern e-commerce platform designed for a premium matcha tea brand, combining online product sales, brand identity presentation, and a seamless digital shopping experience for customers.',
          hy: 'Պրեմիում դասի Matcha թեյի բրենդի համար նախատեսված ժամանակակից էլեկտրոնային առևտրի հարթակ, որը միավորում է արտադրանքի առցանց վաճառքը, բրենդի ինքնության ներկայացումը և հաճախորդների համար հարմարավետ թվային գնումների փորձառությունը։',
          ru: 'Современная платформа электронной коммерции, разработанная для премиального бренда чая матча, объединяющая онлайн-продажу продукции, презентацию идентичности бренда и удобный цифровой опыт совершения покупок для клиентов.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://roar-organic.myshopify.com/',
        image: '/images/organic.jpeg',
        title: t({
          en: 'Organic Beverage E-commerce Platform',
          hy: 'Organic Beverage էլեկտրոնային առևտրի Կայք',
          ru: 'Organic Beverage Сайт электронной коммерции',
        }),
        description: t({
          en: 'A modern e-commerce platform designed for an organic beverage brand, combining online product sales, product presentation, and an engaging digital shopping experience for customers.',
          hy: 'Օրգանական ըմպելիքների բրենդի համար նախատեսված ժամանակակից էլեկտրոնային առևտրի հարթակ, որը միավորում է արտադրանքի առցանց վաճառքը, ապրանքների ներկայացումը և հաճախորդների համար գրավիչ թվային գնումների փորձառությունը։',
          ru: 'Современная платформа электронной коммерции, разработанная для бренда органических напитков, объединяющая онлайн-продажу продукции, презентацию товаров и привлекательный цифровой опыт совершения покупок для клиентов.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.sellmewatch.com/',
        image: '/images/watch.jpeg',
        title: t({
          en: 'Luxury Watch Trading & Valuation Platform',
          hy: 'Շքեղ ժամացույցների առևտրի և գնահատման հարթակ',
          ru: 'Платформа для торговли и оценки роскошных часов',
        }),
        description: t({
          en: 'A premium digital platform designed for a luxury watch trading business, combining professional watch valuation, online purchase requests, and personalized customer services.',
          hy: 'Շքեղ ժամացույցների առևտրով զբաղվող ընկերության համար նախատեսված պրեմիում թվային հարթակ, որը միավորում է ժամացույցների մասնագիտական գնահատումը, առցանց գնման հայտերի ընդունումը և հաճախորդների անհատական սպասարկումը։',
          ru: 'Премиальная цифровая платформа, разработанная для компании, специализирующейся на торговле элитными часами. Она объединяет профессиональную оценку часов, приём онлайн-заявок на их покупку и персонализированное обслуживание клиентов.',
        }),
      },

      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.jdmwestcoast.com/',
        image: '/images/car.jpeg',
        title: t({
          en: 'Automotive Parts E-commerce Platform',
          hy: 'Automotive Parts էլեկտրոնային առևտրի Կայք',
          ru: 'Automotive Parts Сайт электронной коммерции',
        }),
        description: t({
          en: 'A specialized e-commerce platform designed for an automotive parts retailer, providing a comprehensive online marketplace for Japanese Domestic Market (JDM) engines, transmissions, and automotive components',
          hy: 'Ավտոմոբիլային պահեստամասերի վաճառքով զբաղվող ընկերության համար նախատեսված մասնագիտացված էլեկտրոնային առևտրի հարթակ, որն ապահովում է ճապոնական ներքին շուկայի (JDM) շարժիչների, փոխանցման տուփերի և ավտոմոբիլային բաղադրիչների առցանց վաճառքի ամբողջական միջավայր։',
          ru: 'Специализированная платформа электронной коммерции, разработанная для компании, занимающейся продажей автомобильных запчастей. Платформа предоставляет полноценную онлайн-площадку для продажи двигателей, коробок передач и автомобильных компонентов японского внутреннего рынка (JDM).',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://shopzadehmdskin.com/ ',
        image: '/images/zadeh.jpeg',
        title: t({
          en: 'Medical-Grade Skincare E-commerce Platform',
          hy: 'Medical-Grade Skincare էլեկտրոնային առևտրի Կայք',
          ru: 'Medical-Grade Skincare Сайт электронной коммерции',
        }),
        description: t({
          en: 'A premium e-commerce platform designed for a professional skincare brand, combining online sales of medical-grade skincare products, detailed product presentations, and a seamless digital shopping experience.',
          hy: 'Պրոֆեսիոնալ մաշկի խնամքի բրենդի համար նախատեսված պրեմիում դասի էլեկտրոնային առևտրի հարթակ, որը միավորում է բժշկական մակարդակի մաշկի խնամքի միջոցների առցանց վաճառքը, արտադրանքի մանրամասն ներկայացումը և գնումների հարմարավետ թվային փորձառությունը։',
          ru: 'Премиальная платформа электронной коммерции, разработанная для профессионального бренда по уходу за кожей. Она объединяет онлайн-продажу средств медицинского класса по уходу за кожей, подробную презентацию продукции и удобный цифровой процесс совершения покупок.',
        }),
      },

      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.drinkhydrant.com/',
        image: '/images/juce.jpeg',
        title: t({
          en: 'Functional Beverage E-commerce Platform',
          hy: 'Functional Beverage էլեկտրոնային առևտրի Կայք',
          ru: 'Functional Beverage Сайт электронной коммерции',
        }),
        description: t({
          en: 'A modern e-commerce platform designed for a functional beverage brand, combining online product sales, customizable product bundle options, and flexible subscription services.',
          hy: 'Ֆունկցիոնալ ըմպելիքների բրենդի համար նախատեսված ժամանակակից էլեկտրոնային առևտրի հարթակ, որը միավորում է արտադրանքի առցանց վաճառքը, անհատական փաթեթների ձևավորման հնարավորությունը և ճկուն բաժանորդագրության ծառայությունները։',
          ru: 'Современная платформа электронной коммерции, разработанная для бренда функциональных напитков. Она объединяет онлайн-продажу продукции, возможность создания индивидуальных наборов товаров и гибкие сервисы подписки.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.casamance.com/en/',
        image: '/images/interier.jpeg',
        title: t({
          en: 'Luxury Interior Design & Home Decor Platform',
          hy: 'Ինտերիերի շքեղ դիզայնի և տան ձևավորման հարթակ',
          ru: 'Платформа роскошного дизайна интерьера и домашнего декора',
        }),
        description: t({
          en: 'A premium interior design platform showcasing luxury fabrics, designer wallpapers, wallcoverings, and home accessories.',
          hy: 'Պրեմիում ինտերիերի դիզայնի հարթակ՝ շքեղ գործվածքների, պաստառների և տան դեկորի ներկայացմամբ։',
          ru: 'Премиальная платформа интерьерного дизайна с каталогом элитных тканей, обоев, настенных покрытий и аксессуаров.',
        }),
      },
      {
        icon: 'code' satisfies AppIconName,
        path: 'https://www.skinome.com/',
        image: '/images/skay.jpeg',
        title: t({
          en: 'Premium Skincare E-commerce & Personalized Beauty Platform',
          hy: 'Պրեմիում մաշկի խնամքի էլեկտրոնային առևտրի և անհատականացված գեղեցկության հարթակ',
          ru: 'Платформа электронной коммерции и персонализированной красоты премиум-класса по уходу за кожей',
        }),
        description: t({
          en: 'A premium skincare e-commerce platform featuring microbiome-focused products, personalized recommendations, curated kits, and online consultations.',
          hy: 'Գիտական մոտեցմամբ մաշկի խնամքի բրենդի e-commerce հարթակ՝ անհատականացված առաջարկներով, խնամքի միջոցներով և առցանց խորհրդատվությամբ։',
          ru: 'Премиальная e-commerce платформа бренда по уходу за кожей с персональными рекомендациями, наборами средств и онлайн-консультациями.',
        }),
      },
    ],
  },
} as const satisfies Dictionary;

export default productContent;
