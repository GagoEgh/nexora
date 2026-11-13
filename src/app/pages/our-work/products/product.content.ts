import { t, type Dictionary } from 'intlayer';

/**
 * Copy for the portfolio grid and for every product's card and detail page.
 *
 * Two rules govern what is written here, and both come from what the published products
 * actually show.
 *
 * Describe the work, not the byline. Several of these products credit other studios in their
 * footers, which is what white-label delivery looks like from the outside. So nothing here
 * claims authorship or ownership; every sentence is about what the product does.
 *
 * Nothing is invented. Each `highlights` entry names a capability that is visible in the
 * published product. Where something could not be established - a platform, a figure - it is
 * left out rather than guessed at, which is why `platform` is absent for several products in
 * `product-meta.ts`.
 *
 * The length budgets in `product-content.spec.ts` are what keep a row of cards even. `hook` is
 * the one that still governs the card: it is the last line on the front, and every card in a
 * row is as tall as the longest hook in the current locale. `summary` and `advantage` now only
 * reach the detail page - their budgets stay because the sections there are laid out in pairs,
 * not because a card depends on them.
 */
const productContent = {
  key: 'our-work-products',
  content: {
    eyebrow: t({
      en: 'Selected work',
      hy: 'Ընտրված աշխատանքներ',
      ru: 'Избранные работы',
    }),
    title: t({
      en: 'Nineteen products, and what makes each one different.',
      hy: 'Տասնինը արտադրանք՝ յուրաքանչյուրն իր առանձնահատկությամբ։',
      ru: 'Девятнадцать продуктов — и то, чем каждый из них отличается.',
    }),
    intro: t({
      en: 'Mobile apps, storefronts, configurators and lead funnels across automotive, healthcare, beauty, food and luxury retail — each one summarised by the capability that sets it apart.',
      hy: 'Բջջային հավելվածներ, առցանց խանութներ, կոնֆիգուրատորներ և հաճախորդների ներգրավման հարթակներ՝ ավտոմոբիլային, բժշկական, գեղեցկության, սննդի և շքեղ մանրածախ ոլորտներում. յուրաքանչյուրը ներկայացված է այն հատկությամբ, որը նրան տարբերում է մյուսներից։',
      ru: 'Мобильные приложения, интернет-магазины, конфигураторы и воронки привлечения клиентов в автомобильной, медицинской, бьюти-, пищевой и люксовой рознице — каждый представлен той возможностью, которая его отличает.',
    }),
    cta: t({
      en: 'Start a project',
      hy: 'Սկսել նախագիծ',
      ru: 'Начать проект',
    }),
    // Shared by the card's back face and the detail page. There is no "Details" label: the
    // card is its own control, flipped by hover, tap or focus rather than by a button.
    viewProject: t({ en: 'View project', hy: 'Դիտել նախագիծը', ru: 'Смотреть проект' }),
    visitSite: t({ en: 'Visit site', hy: 'Այցելել կայք', ru: 'Перейти на сайт' }),
    newTab: t({
      en: 'opens in a new tab',
      hy: 'բացվում է նոր ներդիրում',
      ru: 'откроется в новой вкладке',
    }),

    archetypes: {
      app: t({ en: 'Mobile app', hy: 'Բջջային հավելված', ru: 'Мобильное приложение' }),
      configurator: t({ en: 'Configurator', hy: 'Կոնֆիգուրատոր', ru: 'Конфигуратор' }),
      storefront: t({ en: 'Online store', hy: 'Առցանց խանութ', ru: 'Интернет-магазин' }),
      trade: t({ en: 'Trade platform', hy: 'B2B հարթակ', ru: 'B2B-платформа' }),
      'lead-generation': t({
        en: 'Lead generation',
        hy: 'Հաճախորդների ներգրավում',
        ru: 'Привлечение клиентов',
      }),
      corporate: t({
        en: 'Corporate platform',
        hy: 'Կորպորատիվ հարթակ',
        ru: 'Корпоративная платформа',
      }),
    },

    sections: {
      about: t({ en: 'About the product', hy: 'Արտադրանքի մասին', ru: 'О продукте' }),
      features: t({
        en: 'Key capabilities',
        hy: 'Հիմնական հնարավորությունները',
        ru: 'Ключевые возможности',
      }),
      experience: t({ en: 'Product experience', hy: 'Օգտագործման փորձ', ru: 'Опыт использования' }),
      advantage: t({ en: 'What sets it apart', hy: 'Ինչն է այն տարբերում', ru: 'Чем выделяется' }),
      value: t({ en: 'Business value', hy: 'Բիզնես արժեքը', ru: 'Ценность для бизнеса' }),
      platform: t({ en: 'Platform', hy: 'Հարթակ', ru: 'Платформа' }),
      next: t({ en: 'Next project', hy: 'Հաջորդ նախագիծը', ru: 'Следующий проект' }),
    },

    products: {
      draculai: {
        name: t({ en: 'Draculai', hy: 'Draculai', ru: 'Draculai' }),
        category: t({
          en: 'Health & substance tracking',
          hy: 'Առողջության և նյութերի հետևում',
          ru: 'Отслеживание здоровья и веществ',
        }),
        hook: t({
          en: 'FDA-backed substance research and intake tracking, in an app that collects no data at all.',
          hy: 'FDA-ի տվյալների վրա հիմնված նյութերի ուսումնասիրում և ընդունման հետևում՝ հավելվածում, որը ոչ մի տվյալ չի հավաքում։',
          ru: 'Исследование веществ на данных FDA и учёт приёма — в приложении, которое не собирает никаких данных.',
        }),
        summary: t({
          en: 'An iOS app for researching and logging prescriptions, supplements and other substances, built over FDA drug data.',
          hy: 'iOS հավելված՝ դեղերի, հավելումների և այլ նյութերի ուսումնասիրման ու գրանցման համար՝ կառուցված FDA-ի տվյալների հիման վրա։',
          ru: 'iOS-приложение для изучения и учёта лекарств, добавок и других веществ, построенное на данных FDA.',
        }),
        highlights: [
          t({ en: 'FDA drug data lookup', hy: 'FDA տվյալների որոնում', ru: 'Поиск по данным FDA' }),
          t({
            en: 'Intake log with timestamps',
            hy: 'Ընդունման գրանցամատյան ժամանակով',
            ru: 'Журнал приёма с отметками времени',
          }),
          t({
            en: 'Collapsible dosage and warnings',
            hy: 'Ծալվող դեղաչափ և զգուշացումներ',
            ru: 'Сворачиваемые дозировки и предупреждения',
          }),
          t({
            en: 'Declares no data collected',
            hy: 'Հայտարարում է՝ տվյալներ չեն հավաքվում',
            ru: 'Заявлено: данные не собираются',
          }),
        ],
        advantage: t({
          en: 'Seven releases between April and August 2025 — a shipping cadence most health apps never reach.',
          hy: '2025 թ. ապրիլից օգոստոս՝ յոթ թողարկում. ռիթմ, որին առողջապահական հավելվածների մեծ մասը չի հասնում։',
          ru: 'Семь релизов с апреля по август 2025 года — темп, которого большинство health-приложений не достигает.',
        }),
        value: t({
          en: 'Turns scattered medicine-cabinet knowledge into a private, searchable record the user controls.',
          hy: 'Դեղերի մասին ցրված տեղեկությունը վերածում է անձնական, որոնելի գրառումների, որոնք վերահսկում է օգտատերը։',
          ru: 'Превращает разрозненные сведения о лекарствах в личную, доступную для поиска запись под контролем пользователя.',
        }),
        about: t({
          en: 'Medical information is abundant and badly organised: authoritative sources are hard to search, and what a person actually took is usually remembered rather than recorded. Draculai puts a searchable interface over FDA drug data and pairs it with a personal intake log carrying notes, quantities and timestamps. Long ingredient lists, dosage forms and warnings collapse rather than overwhelm, and pagination is built for datasets that run to thousands of entries. The App Store listing declares that no data is collected — an unusually strong position for an application in the Medical category.',
          hy: 'Բժշկական տեղեկատվությունը շատ է, բայց վատ կազմակերպված. հավաստի աղբյուրներում որոնելը դժվար է, իսկ իրականում ընդունած դեղերը սովորաբար հիշվում են, ոչ թե գրանցվում։ Draculai-ն FDA-ի տվյալների վրա կառուցում է որոնելի ինտերֆեյս և այն զուգորդում անձնական գրանցամատյանի հետ՝ նշումներով, քանակով և ժամանակի դրոշմով։ Բաղադրիչների երկար ցանկերը, դեղաչափերն ու զգուշացումները ծալվում են՝ փոխանակ ծանրաբեռնելու, իսկ էջավորումը նախագծված է հազարավոր գրառումների համար։ App Store-ի էջում հայտարարված է, որ տվյալներ չեն հավաքվում՝ բացառիկ ուժեղ դիրքորոշում Medical կատեգորիայի հավելվածի համար։',
          ru: 'Медицинской информации много, но она плохо организована: искать в авторитетных источниках трудно, а то, что человек действительно принимал, обычно запоминается, а не фиксируется. Draculai даёт поисковый интерфейс поверх данных FDA и дополняет его личным журналом приёма с заметками, количеством и отметками времени. Длинные списки ингредиентов, формы выпуска и предупреждения сворачиваются, а не перегружают экран, а пагинация рассчитана на тысячи записей. В карточке App Store заявлено, что данные не собираются, — необычно сильная позиция для приложения категории Medical.',
        }),
      },

      'jdm-west-coast': {
        name: t({ en: 'JDM West Coast', hy: 'JDM West Coast', ru: 'JDM West Coast' }),
        category: t({
          en: 'Automotive parts commerce',
          hy: 'Ավտոպահեստամասերի առևտուր',
          ru: 'Торговля автозапчастями',
        }),
        hook: t({
          en: 'Fitment search that matches imported Japanese drivetrains to a specific year, make, model and displacement.',
          hy: 'Համապատասխանության որոնում, որը ներկրված ճապոնական ագրեգատները կապում է կոնկրետ տարվա, մակնիշի, մոդելի և շարժիչի ծավալի հետ։',
          ru: 'Подбор совместимости, связывающий импортные японские агрегаты с конкретным годом, маркой, моделью и объёмом двигателя.',
        }),
        summary: t({
          en: 'A storefront for a California importer of JDM engines and transmissions, where the hard problem is fitment, not checkout.',
          hy: 'Կալիֆոռնիայի JDM շարժիչների և փոխանցման տուփերի ներկրողի խանութ, որտեղ բարդ խնդիրը համապատասխանությունն է, ոչ թե վճարումը։',
          ru: 'Магазин калифорнийского импортёра двигателей и КПП JDM, где сложная задача — подбор совместимости, а не оформление заказа.',
        }),
        highlights: [
          t({
            en: 'Search by make, model or part number',
            hy: 'Որոնում մակնիշով, մոդելով կամ կոդով',
            ru: 'Поиск по марке, модели или номеру детали',
          }),
          t({
            en: 'Nine manufacturer catalogues',
            hy: 'Ինը արտադրողի կատալոգ',
            ru: 'Каталоги девяти производителей',
          }),
          t({
            en: 'Engines, transmissions, body clips',
            hy: 'Շարժիչներ, փոխանցման տուփեր, կուզովի հավաքածուներ',
            ru: 'Двигатели, КПП, кузовные комплекты',
          }),
          t({
            en: 'Single-unit stock states',
            hy: 'Եզակի միավորի պահեստավիճակ',
            ru: 'Складские статусы для единичных позиций',
          }),
        ],
        advantage: t({
          en: 'Used imported drivetrains are one-of-a-kind items, so every listing is its own inventory problem.',
          hy: 'Ներկրված օգտագործված ագրեգատները եզակի են, ուստի յուրաքանչյուր հայտարարություն առանձին պահեստային խնդիր է։',
          ru: 'Подержанные импортные агрегаты уникальны, поэтому каждая позиция — отдельная складская задача.',
        }),
        value: t({
          en: 'Buyers answer a fitment question themselves that would otherwise take a phone call for every order.',
          hy: 'Գնորդներն ինքնուրույն են պատասխանում համապատասխանության հարցին, որն այլապես կպահանջեր զանգ՝ յուրաքանչյուր պատվերի համար։',
          ru: 'Покупатели сами отвечают на вопрос о совместимости, который иначе требовал бы звонка по каждому заказу.',
        }),
        about: t({
          en: 'Importing Japanese domestic-market drivetrains is not ordinary retail. Stock arrives as individual used units rather than as replenishable lines, and the buyer has to know whether a given engine fits their car before any of the usual commerce mechanics become relevant. The platform leads with that question: search accepts a make, a model or a part number, guidance sets out matching on year, make, model and displacement, and nine manufacturer catalogues organise the inventory beneath it. Engines, transmissions, front clips and interior and exterior components each carry their own stock state, so a sold unit reads as sold rather than as temporarily unavailable.',
          hy: 'Ճապոնական ներքին շուկայի ագրեգատների ներկրումը սովորական մանրածախ առևտուր չէ։ Ապրանքը գալիս է որպես առանձին օգտագործված միավորներ, ոչ թե համալրվող տեսականի, և գնորդը պետք է իմանա՝ տվյալ շարժիչը սազո՞ւմ է իր մեքենային, նախքան առևտրի մնացած մեխանիկան իմաստ ունենա։ Հարթակն սկսում է հենց այդ հարցից. որոնումն ընդունում է մակնիշ, մոդել կամ կոդ, ուղեցույցը բացատրում է տարվա, մակնիշի, մոդելի և ծավալի համապատասխանեցումը, իսկ ինը արտադրողի կատալոգ կազմակերպում է պահեստը։ Շարժիչները, փոխանցման տուփերը, առջևի հավաքածուները և ինտերիերի ու էքստերիերի բաղադրիչներն ունեն իրենց պահեստավիճակը, ուստի վաճառվածը ցուցադրվում է որպես վաճառված, ոչ թե ժամանակավորապես անհասանելի։',
          ru: 'Импорт агрегатов японского внутреннего рынка — не обычная розница. Товар поступает отдельными бывшими в употреблении единицами, а не пополняемыми позициями, и покупателю нужно понять, подойдёт ли конкретный двигатель его машине, прежде чем станет важна остальная механика торговли. Платформа начинает именно с этого вопроса: поиск принимает марку, модель или номер детали, инструкция описывает подбор по году, марке, модели и объёму, а каталоги девяти производителей структурируют склад. Двигатели, коробки передач, передние срезы и компоненты интерьера и экстерьера имеют собственные складские статусы, поэтому проданная единица отображается как проданная, а не как временно отсутствующая.',
        }),
      },

      hydrant: {
        name: t({ en: 'Hydrant', hy: 'Hydrant', ru: 'Hydrant' }),
        category: t({
          en: 'Functional beverage commerce',
          hy: 'Ֆունկցիոնալ ըմպելիքների առևտուր',
          ru: 'Торговля функциональными напитками',
        }),
        hook: t({
          en: 'Build-your-own four-pack bundles and a subscription customers can skip, pause or cancel themselves.',
          hy: 'Անհատական չորսական փաթեթներ և բաժանորդագրություն, որը հաճախորդն ինքը կարող է բաց թողնել, դադարեցնել կամ չեղարկել։',
          ru: 'Собственные наборы из четырёх позиций и подписка, которую клиент сам может пропустить, приостановить или отменить.',
        }),
        summary: t({
          en: 'Direct-to-consumer commerce for an electrolyte drink brand across four product lines, with bundles and self-service subscriptions.',
          hy: 'Էլեկտրոլիտային ըմպելիքների բրենդի ուղիղ վաճառք՝ չորս արտադրանքի գծով, փաթեթներով և ինքնասպասարկման բաժանորդագրությամբ։',
          ru: 'Прямые продажи бренда электролитных напитков по четырём линейкам — с наборами и самостоятельным управлением подпиской.',
        }),
        highlights: [
          t({
            en: 'Pick-any-four bundle builder',
            hy: 'Չորս ըստ ցանկության փաթեթ',
            ru: 'Набор из любых четырёх',
          }),
          t({
            en: 'Subscribe and save 20%',
            hy: 'Բաժանորդագրություն՝ 20% զեղչ',
            ru: 'Подписка со скидкой 20%',
          }),
          t({
            en: 'Self-service skip, pause, cancel',
            hy: 'Ինքնուրույն բաց թողնել, դադարեցնել, չեղարկել',
            ru: 'Самостоятельно пропустить, приостановить, отменить',
          }),
          t({
            en: 'Hydrate, Energy, Sleep, Immunity',
            hy: 'Hydrate, Energy, Sleep, Immunity գծեր',
            ru: 'Линейки Hydrate, Energy, Sleep, Immunity',
          }),
        ],
        advantage: t({
          en: '4.8 out of 5 from more than 12,000 verified reviews — the largest audience in this portfolio.',
          hy: '4.8/5՝ ավելի քան 12 000 հաստատված կարծիքից. այս պորտֆոլիոյի ամենամեծ լսարանը։',
          ru: '4,8 из 5 по более чем 12 000 подтверждённых отзывов — самая большая аудитория в этом портфолио.',
        }),
        value: t({
          en: 'Subscription control customers run themselves removes the support load that recurring orders usually create.',
          hy: 'Բաժանորդագրության ինքնուրույն կառավարումը վերացնում է այն աջակցության բեռը, որը սովորաբար ստեղծում են կրկնվող պատվերները։',
          ru: 'Самостоятельное управление подпиской снимает нагрузку на поддержку, которую обычно создают повторяющиеся заказы.',
        }),
        about: t({
          en: 'Subscription commerce fails in the same place every time: the customer wants to change an order and has to email somebody. This platform puts that control in the customer’s hands — skipping, pausing and cancelling are described plainly and handled without intervention — and pairs it with a bundle builder that lets any four products be combined into one order across the Hydrate, Energy, Sleep and Immunity lines. The discount for subscribing is 20%. Behind it sits a review corpus of more than twelve thousand verified entries averaging 4.8 out of 5, which is the scale at which merchandising decisions stop being guesswork.',
          hy: 'Բաժանորդագրային առևտուրը միշտ ձախողվում է նույն տեղում. հաճախորդն ուզում է փոխել պատվերը, բայց ստիպված է նամակ գրել։ Այս հարթակը այդ վերահսկողությունը տալիս է հաճախորդին՝ բաց թողնելը, դադարեցնելն ու չեղարկելը նկարագրված են պարզ և կատարվում են առանց միջամտության, և զուգորդում է փաթեթի կառուցիչի հետ, որը թույլ է տալիս մեկ պատվերում միավորել ցանկացած չորս ապրանք Hydrate, Energy, Sleep և Immunity գծերից։ Բաժանորդագրության զեղչը 20% է։ Հետևում կանգնած է ավելի քան տասներկու հազար հաստատված կարծիքի զանգված՝ 4.8/5 միջինով, ինչը այն մասշտաբն է, որից սկսած մերչենդայզինգի որոշումները դադարում են ենթադրություն լինելուց։',
          ru: 'Подписочная торговля ломается всегда в одном месте: клиент хочет изменить заказ и вынужден кому-то писать. Эта платформа отдаёт управление самому клиенту — пропуск, пауза и отмена описаны прямо и выполняются без вмешательства — и дополняет это конструктором набора, позволяющим собрать в один заказ любые четыре позиции из линеек Hydrate, Energy, Sleep и Immunity. Скидка за подписку — 20%. За всем этим стоит массив из более чем двенадцати тысяч подтверждённых отзывов со средней оценкой 4,8 из 5 — масштаб, на котором мерчандайзинговые решения перестают быть догадками.',
        }),
      },

      mertel: {
        name: t({ en: 'Mertel', hy: 'Mertel', ru: 'Mertel' }),
        category: t({
          en: 'Experiential marketing agency',
          hy: 'Փորձառական մարքեթինգի գործակալություն',
          ru: 'Агентство событийного маркетинга',
        }),
        hook: t({
          en: 'One platform serving five cities in two languages, carrying EXPO 2025 Osaka and a UEFA final.',
          hy: 'Մեկ հարթակ՝ հինգ քաղաքի և երկու լեզվի համար, EXPO 2025 Osaka-ի և UEFA-ի եզրափակչի նախագծերով։',
          ru: 'Одна платформа на пять городов и два языка — с проектами EXPO 2025 Osaka и финала UEFA.',
        }),
        summary: t({
          en: 'A corporate platform for a European live-events agency operating across Bratislava, Vienna, Prague, London and Riyadh.',
          hy: 'Եվրոպական միջոցառումների գործակալության կորպորատիվ հարթակ՝ Բրատիսլավա, Վիեննա, Պրահա, Լոնդոն և Էր-Ռիադ քաղաքներում։',
          ru: 'Корпоративная платформа европейского event-агентства с присутствием в Братиславе, Вене, Праге, Лондоне и Эр-Рияде.',
        }),
        highlights: [
          t({
            en: 'Five regional editions',
            hy: 'Հինգ տարածաշրջանային տարբերակ',
            ru: 'Пять региональных версий',
          }),
          t({
            en: 'Slovak and English',
            hy: 'Սլովակերեն և անգլերեն',
            ru: 'Словацкий и английский',
          }),
          t({
            en: 'Case studies with project counts',
            hy: 'Քեյսեր՝ նախագծերի քանակով',
            ru: 'Кейсы с числом проектов',
          }),
          t({
            en: 'Franchise partner enquiry',
            hy: 'Ֆրանշիզային գործընկերոջ հայտ',
            ru: 'Заявка франчайзи-партнёра',
          }),
        ],
        advantage: t({
          en: 'Regional and language switching on one content model, instead of five separate websites.',
          hy: 'Տարածաշրջանի և լեզվի փոխարկում մեկ բովանդակային մոդելի վրա՝ հինգ առանձին կայքի փոխարեն։',
          ru: 'Переключение региона и языка в одной контентной модели вместо пяти отдельных сайтов.',
        }),
        value: t({
          en: 'An agency can open a new city on the platform it already has, without commissioning a new build.',
          hy: 'Գործակալությունը կարող է նոր քաղաք բացել արդեն գործող հարթակի վրա՝ առանց նոր կայք պատվիրելու։',
          ru: 'Агентство может открыть новый город на уже существующей платформе, не заказывая новую разработку.',
        }),
        about: t({
          en: 'An agency that works across five cities has a structural problem before it has a design problem: the same organisation has to present differently in Bratislava, Vienna, Prague, London and Riyadh without fragmenting into five disconnected websites. The platform solves it with a region switcher sitting alongside a Slovak and English language switch, so the regional edition and the reading language are separate choices. The work itself is presented as case studies — the Czech Pavilion at EXPO 2025 Osaka and the UEFA Conference League Final 2023 among them — and the services listing carries project counts across six categories. A franchise programme for local owner-partners runs on the same structure, which is what makes adding a city an editorial act rather than an engineering one.',
          hy: 'Հինգ քաղաքում գործող գործակալությունը դիզայնի խնդրից առաջ ունի կառուցվածքային խնդիր. նույն կազմակերպությունը պետք է տարբեր կերպ ներկայանա Բրատիսլավայում, Վիեննայում, Պրահայում, Լոնդոնում և Էր-Ռիադում՝ առանց հինգ անկապ կայքի բաժանվելու։ Հարթակը դա լուծում է տարածաշրջանի փոխարկիչով, որը գործում է սլովակերեն-անգլերեն լեզվի փոխարկիչի կողքին, այնպես որ տարածաշրջանային տարբերակը և ընթերցման լեզուն առանձին ընտրություններ են։ Աշխատանքը ներկայացված է քեյսերով՝ ներառյալ Չեխիայի տաղավարը EXPO 2025 Osaka-ում և UEFA Conference League-ի 2023 թ. եզրափակիչը, իսկ ծառայությունների ցանկը պարունակում է նախագծերի քանակը վեց կատեգորիայում։ Նույն կառուցվածքի վրա է աշխատում տեղական գործընկերների ֆրանշիզային ծրագիրը, ինչի շնորհիվ նոր քաղաք ավելացնելը դառնում է խմբագրական, ոչ թե ինժեներական գործողություն։',
          ru: 'У агентства, работающего в пяти городах, структурная проблема возникает раньше дизайнерской: одна и та же организация должна по-разному представляться в Братиславе, Вене, Праге, Лондоне и Эр-Рияде, не распадаясь на пять несвязанных сайтов. Платформа решает это переключателем регионов, который работает рядом с переключением словацкого и английского, так что региональная версия и язык чтения — независимые выборы. Сама работа подана кейсами: среди них Чешский павильон на EXPO 2025 Osaka и финал Лиги конференций UEFA 2023 года, — а перечень услуг содержит число проектов по шести категориям. На той же структуре работает франчайзинговая программа для локальных партнёров, благодаря чему добавление города становится редакторским, а не инженерным действием.',
        }),
      },

      skinome: {
        name: t({ en: 'Skinome', hy: 'Skinome', ru: 'Skinome' }),
        category: t({
          en: 'Personalised skincare commerce',
          hy: 'Անհատականացված մաշկի խնամքի առևտուր',
          ru: 'Персонализированный уход за кожей',
        }),
        hook: t({
          en: 'A skin test that turns answers into a routine, a kit and a subscription.',
          hy: 'Մաշկի թեստ, որը պատասխանները վերածում է խնամքի ծրագրի, հավաքածուի և բաժանորդագրության։',
          ru: 'Тест кожи, превращающий ответы в уход, набор и подписку.',
        }),
        summary: t({
          en: 'Commerce for a Swedish research-led skincare brand, where a diagnostic test drives recommendations, kits and consultations.',
          hy: 'Շվեդական գիտահենք մաշկի խնամքի բրենդի առևտուր, որտեղ ախտորոշիչ թեստը որոշում է առաջարկները, հավաքածուներն ու խորհրդատվությունը։',
          ru: 'Коммерция шведского научно-ориентированного бренда ухода, где диагностический тест определяет рекомендации, наборы и консультации.',
        }),
        highlights: [
          t({ en: 'Guided skin test', hy: 'Ուղղորդվող մաշկի թեստ', ru: 'Пошаговый тест кожи' }),
          t({
            en: 'Recommended routines and kits',
            hy: 'Առաջարկվող ծրագրեր և հավաքածուներ',
            ru: 'Рекомендованные программы и наборы',
          }),
          t({
            en: 'Subscription at 20% off',
            hy: 'Բաժանորդագրություն՝ 20% զեղչով',
            ru: 'Подписка со скидкой 20%',
          }),
          t({
            en: 'Booked skin consultations',
            hy: 'Ամրագրվող խորհրդատվություն',
            ru: 'Запись на консультацию',
          }),
        ],
        advantage: t({
          en: 'The most complete funnel here: test, recommendation, kit, subscription, consultation, membership.',
          hy: 'Այստեղ ամենաամբողջական ձագարը՝ թեստ, առաջարկ, հավաքածու, բաժանորդագրություն, խորհրդատվություն, ակումբ։',
          ru: 'Самая полная воронка здесь: тест, рекомендация, набор, подписка, консультация, клуб.',
        }),
        value: t({
          en: 'Personalisation replaces the shelf-browsing that makes skincare difficult to buy online.',
          hy: 'Անհատականացումը փոխարինում է դարակ զննելուն, որը դժվարացնում է մաշկի խնամքի առցանց գնումը։',
          ru: 'Персонализация заменяет разглядывание полки, из-за которого уход трудно покупать онлайн.',
        }),
        about: t({
          en: 'Skincare is hard to sell online because the customer does not know what they need, and a catalogue cannot tell them. This platform inverts the usual order: a guided skin test comes first, and its result produces a routine, a set of recommended products and a ready-made kit. From there the customer can move to a subscription at twenty per cent off, book a consultation with a specialist, or read into the brand’s Skin Academy material. A membership area sits behind it. Each of those is a conventional commerce feature on its own; arranged in this sequence they form a single diagnostic path from "I don’t know what my skin needs" to a recurring order.',
          hy: 'Մաշկի խնամքն առցանց վաճառելը դժվար է, որովհետև հաճախորդը չգիտի՝ ինչ է իրեն պետք, իսկ կատալոգը չի կարող դա ասել։ Այս հարթակը շրջում է սովորական հերթականությունը. նախ ուղղորդվող մաշկի թեստն է, և դրա արդյունքը ձևավորում է խնամքի ծրագիր, առաջարկվող ապրանքների շարք և պատրաստի հավաքածու։ Այնուհետև հաճախորդը կարող է անցնել բաժանորդագրության՝ քսան տոկոս զեղչով, ամրագրել մասնագետի խորհրդատվություն կամ ծանոթանալ բրենդի Skin Academy նյութերին։ Դրանց հետևում ակումբային բաժինն է։ Սրանցից յուրաքանչյուրն առանձին սովորական առևտրային գործառույթ է. այս հաջորդականությամբ դասավորված՝ դրանք կազմում են մեկ ախտորոշիչ ուղի՝ «չգիտեմ ինչ է պետք իմ մաշկին»-ից մինչև կրկնվող պատվեր։',
          ru: 'Уход за кожей трудно продавать онлайн, потому что клиент не знает, что ему нужно, а каталог ему этого не скажет. Платформа переворачивает привычный порядок: сначала идёт пошаговый тест кожи, и его результат формирует программу ухода, набор рекомендованных средств и готовый кит. Дальше клиент может перейти на подписку со скидкой двадцать процентов, записаться на консультацию к специалисту или углубиться в материалы бренда Skin Academy. За этим расположен клубный раздел. Каждая из этих функций по отдельности обычна для электронной коммерции; выстроенные в такой последовательности, они образуют единый диагностический путь от «не знаю, что нужно моей коже» до регулярного заказа.',
        }),
      },

      mastercraft: {
        name: t({
          en: 'Mastercraft Jewelers',
          hy: 'Mastercraft Jewelers',
          ru: 'Mastercraft Jewelers',
        }),
        category: t({
          en: 'Luxury jewellery commerce',
          hy: 'Շքեղ զարդերի առևտուր',
          ru: 'Торговля ювелирными изделиями',
        }),
        hook: t({
          en: 'A ring builder that carries setting, diamond and a running total through every step.',
          hy: 'Մատանու կառուցիչ, որը յուրաքանչյուր քայլում պահում է ամրակալումը, ադամանդը և ընթացիկ գումարը։',
          ru: 'Конструктор кольца, который ведёт оправу, бриллиант и текущую сумму через каждый шаг.',
        }),
        summary: t({
          en: 'Commerce for a Michigan jeweller and Swiss watch dealer, pairing a five-axis filter with a step-by-step ring configurator.',
          hy: 'Միչիգանի ոսկերչի և շվեյցարական ժամացույցների դիլերի առևտուր՝ հինգ չափանիշով ֆիլտր և քայլ առ քայլ մատանու կոնֆիգուրատոր։',
          ru: 'Коммерция ювелира из Мичигана и дилера швейцарских часов: фильтр по пяти осям и пошаговый конфигуратор кольца.',
        }),
        highlights: [
          t({
            en: 'Filter by style, shape, metal, designer, price',
            hy: 'Ֆիլտր՝ ոճ, ձև, մետաղ, դիզայներ, գին',
            ru: 'Фильтр: стиль, форма, металл, дизайнер, цена',
          }),
          t({
            en: 'Setting and diamond builder',
            hy: 'Ամրակալման և ադամանդի ընտրություն',
            ru: 'Подбор оправы и бриллианта',
          }),
          t({
            en: 'Running configuration total',
            hy: 'Ընթացիկ հաշվարկ',
            ru: 'Текущая сумма конфигурации',
          }),
          t({
            en: 'In-store appointment booking',
            hy: 'Խանութում հանդիպման ամրագրում',
            ru: 'Запись в салон',
          }),
        ],
        advantage: t({
          en: 'A configurator and an appointment flow in one journey — selected online, finished in the showroom.',
          hy: 'Կոնֆիգուրատոր և հանդիպման ամրագրում մեկ ուղու մեջ՝ ընտրվում է առցանց, ավարտվում՝ սրահում։',
          ru: 'Конфигуратор и запись в одном пути: выбор онлайн, завершение в салоне.',
        }),
        value: t({
          en: 'High-consideration purchases get a guided path instead of a product grid.',
          hy: 'Երկար մտածված գնումները ստանում են ուղղորդված ուղի՝ ապրանքային ցանցի փոխարեն։',
          ru: 'Покупки с долгим выбором получают ведомый путь вместо сетки товаров.',
        }),
        about: t({
          en: 'Nobody buys an engagement ring from a product grid. The decision is made over several sessions, usually involves two people, and almost always ends in a shop. The platform is built around that: filtering works across five axes at once — style, shape, metal, designer and price — so a long catalogue narrows quickly, and a build-your-ring flow then tracks the chosen setting, the chosen diamond and the running total as the configuration develops. Swiss watches and fashion jewellery sit alongside under the same filters. The journey does not insist on ending at checkout: appointment booking is offered throughout, which matches how this category actually converts.',
          hy: 'Ոչ ոք նշանադրության մատանի չի գնում ապրանքային ցանցից։ Որոշումը կայացվում է մի քանի այցից, սովորաբար ներգրավում է երկու մարդու և գրեթե միշտ ավարտվում խանութում։ Հարթակը կառուցված է հենց դրա շուրջ. ֆիլտրումն աշխատում է միաժամանակ հինգ առանցքով՝ ոճ, ձև, մետաղ, դիզայներ և գին, ուստի երկար կատալոգն արագ նեղանում է, իսկ մատանու կառուցման ընթացքը հետևում է ընտրված ամրակալմանը, ադամանդին և ընթացիկ գումարին։ Շվեյցարական ժամացույցները և նորաձև զարդերը նույն ֆիլտրերի տակ են։ Ուղին չի պարտադրում ավարտվել վճարմամբ. հանդիպման ամրագրումն առաջարկվում է ամբողջ ընթացքում, ինչը համապատասխանում է այս կատեգորիայի իրական վարքին։',
          ru: 'Никто не покупает помолвочное кольцо из сетки товаров. Решение принимается за несколько заходов, обычно вовлекает двоих и почти всегда завершается в магазине. Платформа построена вокруг этого: фильтрация работает сразу по пяти осям — стиль, форма, металл, дизайнер и цена, — поэтому длинный каталог быстро сужается, а конструктор кольца ведёт выбранную оправу, выбранный бриллиант и текущую сумму по мере сборки. Швейцарские часы и модные украшения доступны под теми же фильтрами. Путь не обязан заканчиваться оплатой: запись в салон предлагается на всём протяжении, что соответствует тому, как эта категория конвертируется на самом деле.',
        }),
      },

      'robert-irwin': {
        name: t({
          en: 'Robert Irwin Jewelers',
          hy: 'Robert Irwin Jewelers',
          ru: 'Robert Irwin Jewelers',
        }),
        category: t({
          en: 'Fine jewellery retail',
          hy: 'Ոսկերչական մանրածախ',
          ru: 'Ювелирная розница',
        }),
        hook: t({
          en: 'Design-your-own rings across five showrooms, with appointments booked per location.',
          hy: 'Անհատական մատանու ձևավորում հինգ սրահում՝ ամրագրում ըստ կոնկրետ վայրի։',
          ru: 'Создание кольца на заказ для пяти салонов — с записью в конкретный салон.',
        }),
        summary: t({
          en: 'Commerce for a five-showroom Memphis jeweller: rings, diamonds and bands, with a custom builder and per-location booking.',
          hy: 'Մեմֆիսի հինգ սրահով ոսկերչի առևտուր՝ մատանիներ, ադամանդներ և օղեր, անհատական կառուցիչով և ըստ վայրի ամրագրմամբ։',
          ru: 'Коммерция ювелира из Мемфиса с пятью салонами: кольца, бриллианты, обручальные кольца, конструктор и запись по салонам.',
        }),
        highlights: [
          t({
            en: 'Design Your Own ring builder',
            hy: '«Ստեղծիր քո մատանին» կառուցիչ',
            ru: 'Конструктор «создай своё кольцо»',
          }),
          t({
            en: 'Shape, style and metal filters',
            hy: 'Ֆիլտրեր՝ ձև, ոճ, մետաղ',
            ru: 'Фильтры формы, стиля и металла',
          }),
          t({ en: 'Five showroom locator', hy: 'Հինգ սրահի որոնիչ', ru: 'Поиск по пяти салонам' }),
          t({ en: 'Financing options', hy: 'Ֆինանսավորման տարբերակներ', ru: 'Варианты рассрочки' }),
        ],
        advantage: t({
          en: 'Multi-location retail and online configuration inside one funnel.',
          hy: 'Բազմավայր մանրածախն ու առցանց կոնֆիգուրացիան մեկ ձագարում։',
          ru: 'Мультисалонная розница и онлайн-конфигурация в одной воронке.',
        }),
        value: t({
          en: 'Online browsing converts into a booked showroom visit instead of ending at an abandoned cart.',
          hy: 'Առցանց դիտումը վերածվում է ամրագրված այցի՝ լքված զամբյուղի փոխարեն։',
          ru: 'Онлайн-просмотр превращается в записанный визит в салон, а не в брошенную корзину.',
        }),
        about: t({
          en: 'Five showrooms across one metropolitan area is a different commerce problem from a single warehouse: the customer needs to know not only what is available but where, and the business needs the visit as much as the order. The platform carries a full engagement and bridal catalogue with filtering on shape, style and metal, a Design Your Own flow for custom work, and clear sale pricing alongside regular pricing. Financing is presented as a first-class option rather than a checkout afterthought. Each showroom has its own locator entry with appointment booking attached, so the path from a filtered catalogue page to a specific store on a specific day stays short.',
          hy: 'Մեկ քաղաքային տարածքում հինգ սրահը առևտրի այլ խնդիր է, քան մեկ պահեստը. հաճախորդին պետք է իմանալ ոչ միայն ինչ կա, այլև որտեղ, իսկ բիզնեսին այցն անհրաժեշտ է նույնքան, որքան պատվերը։ Հարթակը պարունակում է նշանադրության և հարսանեկան ամբողջական կատալոգ՝ ձևի, ոճի և մետաղի ֆիլտրերով, «Ստեղծիր քո մատանին» ընթացք անհատական պատվերների համար և հստակ զեղչային գներ՝ սովորականի կողքին։ Ֆինանսավորումը ներկայացված է որպես լիարժեք տարբերակ, ոչ թե վճարման պահի հավելում։ Յուրաքանչյուր սրահ ունի իր գրառումը որոնիչում՝ կցված ամրագրմամբ, ուստի ֆիլտրված կատալոգից մինչև կոնկրետ օրը կոնկրետ խանութ ճանապարհը կարճ է մնում։',
          ru: 'Пять салонов в одной агломерации — другая торговая задача, чем один склад: покупателю важно знать не только что есть, но и где, а бизнесу визит нужен не меньше заказа. Платформа несёт полный помолвочный и свадебный каталог с фильтрами по форме, стилю и металлу, поток «создай своё кольцо» для индивидуальных работ и ясные акционные цены рядом с обычными. Рассрочка подана как полноценная опция, а не как дополнение на этапе оплаты. У каждого салона своя запись в локаторе с привязанной записью на визит, поэтому путь от отфильтрованной страницы каталога до конкретного магазина в конкретный день остаётся коротким.',
        }),
      },

      casamance: {
        name: t({ en: 'Casamance', hy: 'Casamance', ru: 'Casamance' }),
        category: t({
          en: 'Interiors, trade and retail',
          hy: 'Ինտերիեր՝ B2B և մանրածախ',
          ru: 'Интерьеры: B2B и розница',
        }),
        hook: t({
          en: 'A trade login that opens a second pricing tier on a French fabric house’s catalogue.',
          hy: 'B2B մուտք, որը ֆրանսիական գործվածքների տան կատալոգում բացում է գնային երկրորդ մակարդակը։',
          ru: 'B2B-вход, открывающий второй ценовой уровень в каталоге французского дома тканей.',
        }),
        summary: t({
          en: 'An interiors platform for a French publisher of fabrics, wallpapers and wallcoverings, with a separate professional account tier.',
          hy: 'Ֆրանսիական գործվածքների, պաստառների և պատի ծածկույթների արտադրողի ինտերիերային հարթակ՝ առանձին մասնագիտական մակարդակով։',
          ru: 'Интерьерная платформа французского производителя тканей, обоев и настенных покрытий с отдельным профессиональным уровнем доступа.',
        }),
        highlights: [
          t({
            en: 'Professional trade tier',
            hy: 'Մասնագիտական B2B մակարդակ',
            ru: 'Профессиональный B2B-уровень',
          }),
          t({
            en: 'Browse by family, colour, style',
            hy: 'Դիտում ըստ ընտանիքի, գույնի, ոճի',
            ru: 'Просмотр по семейству, цвету, стилю',
          }),
          t({
            en: 'Fabrics, wallpapers, wallpanels',
            hy: 'Գործվածքներ, պաստառներ, պանելներ',
            ru: 'Ткани, обои, стеновые панели',
          }),
          t({
            en: 'English and French editions',
            hy: 'Անգլերեն և ֆրանսերեն',
            ru: 'Английская и французская версии',
          }),
        ],
        advantage: t({
          en: 'Two audiences — specifiers and consumers — on one catalogue, with different permissions.',
          hy: 'Երկու լսարան՝ մասնագետներ և սպառողներ, մեկ կատալոգի վրա՝ տարբեր իրավունքներով։',
          ru: 'Две аудитории — специалисты и потребители — на одном каталоге с разными правами.',
        }),
        value: t({
          en: 'Professional buyers get trade terms without a second website to maintain.',
          hy: 'Մասնագիտական գնորդները ստանում են B2B պայմաններ՝ առանց երկրորդ կայք պահելու։',
          ru: 'Профессиональные покупатели получают B2B-условия без второго сайта, который нужно поддерживать.',
        }),
        about: t({
          en: 'Furnishing fabric is specified before it is bought, usually by an architect or a decorator working to a brief, and sometimes bought directly by the person who will live with it. Those two audiences need the same catalogue and different terms. The platform resolves this with a trade login running alongside ordinary accounts and wishlists, so professional pricing and permissions attach to the account rather than to a separate site. The catalogue itself spans fabrics, wallpapers, wallpanels, wallcoverings and accessories, browsable by family, colour and design style, with a contract-projects route for specification work and an English and French edition of the whole thing.',
          hy: 'Ինտերիերային գործվածքը նախ նախագծվում է, հետո գնվում՝ սովորաբար ճարտարապետի կամ դեկորատորի կողմից, երբեմն էլ ուղղակիորեն այն մարդու, ով ապրելու է դրա հետ։ Այս երկու լսարանին պետք է նույն կատալոգը և տարբեր պայմանները։ Հարթակը դա լուծում է B2B մուտքով, որը գործում է սովորական հաշիվների և ցանկացանկների կողքին, ուստի մասնագիտական գներն ու իրավունքները կապվում են հաշվին, ոչ թե առանձին կայքին։ Կատալոգն ընդգրկում է գործվածքներ, պաստառներ, պանելներ, պատի ծածկույթներ և աքսեսուարներ՝ դիտելի ըստ ընտանիքի, գույնի և ոճի, կոնտրակտային նախագծերի բաժնով և ամբողջի անգլերեն ու ֆրանսերեն տարբերակով։',
          ru: 'Интерьерную ткань сначала закладывают в проект и лишь потом покупают — обычно это делает архитектор или декоратор по заданию, а иногда напрямую тот, кто будет с ней жить. Этим двум аудиториям нужен один каталог и разные условия. Платформа решает это B2B-входом, работающим рядом с обычными аккаунтами и списками желаний, так что профессиональные цены и права привязаны к учётной записи, а не к отдельному сайту. Сам каталог охватывает ткани, обои, стеновые панели, настенные покрытия и аксессуары с просмотром по семейству, цвету и стилю, включает раздел контрактных проектов и существует в английской и французской версиях.',
        }),
      },

      'sell-me-watch': {
        name: t({ en: 'Sell Me Watch', hy: 'Sell Me Watch', ru: 'Sell Me Watch' }),
        category: t({
          en: 'Valuation & lead generation',
          hy: 'Գնահատում և հաճախորդների ներգրավում',
          ru: 'Оценка и привлечение клиентов',
        }),
        hook: t({
          en: 'A valuation funnel for luxury watches — built around quotes and appointments, not a checkout.',
          hy: 'Շքեղ ժամացույցների գնահատման ձագար՝ կառուցված գնանշումների և հանդիպումների, ոչ թե վճարման շուրջ։',
          ru: 'Воронка оценки люксовых часов, построенная вокруг заявок и встреч, а не корзины.',
        }),
        summary: t({
          en: 'A Los Angeles watch buyer’s platform centred on requesting a quote and booking a showroom appointment.',
          hy: 'Լոս Անջելեսի ժամացույցներ գնողի հարթակ՝ կենտրոնացած գնանշման հայտի և սրահում հանդիպման ամրագրման վրա։',
          ru: 'Платформа лос-анджелесского скупщика часов, построенная вокруг запроса оценки и записи в шоурум.',
        }),
        highlights: [
          t({
            en: 'Get-a-quote request flow',
            hy: 'Գնանշման հայտի ընթացք',
            ru: 'Поток запроса оценки',
          }),
          t({
            en: 'Showroom appointment booking',
            hy: 'Սրահում հանդիպման ամրագրում',
            ru: 'Запись в шоурум',
          }),
          t({
            en: 'What-we-buy categories',
            hy: '«Ինչ ենք գնում» բաժիններ',
            ru: 'Разделы «что мы покупаем»',
          }),
          t({
            en: 'Editorial with pagination',
            hy: 'Խմբագրական բաժին՝ էջավորմամբ',
            ru: 'Редакционный раздел с пагинацией',
          }),
        ],
        advantage: t({
          en: 'Selling a watch is a conversation, so the platform optimises for the enquiry rather than the cart.',
          hy: 'Ժամացույց վաճառելը զրույց է, ուստի հարթակը օպտիմալացված է հայտի, ոչ թե զամբյուղի համար։',
          ru: 'Продажа часов — это разговор, поэтому платформа оптимизирована под заявку, а не под корзину.',
        }),
        value: t({
          en: 'High-value, trust-sensitive transactions begin with a qualified lead instead of an order.',
          hy: 'Բարձրարժեք, վստահությունից կախված գործարքները սկսվում են որակյալ հայտից, ոչ թե պատվերից։',
          ru: 'Дорогие сделки, зависящие от доверия, начинаются с квалифицированной заявки, а не с заказа.',
        }),
        about: t({
          en: 'Most commerce platforms assume the visitor wants to buy. Here the visitor wants to sell, which inverts every assumption: there is no cart on the critical path, the product is an offer, and the conversion event is a conversation. The platform leads with a get-a-quote route and an appointment booking, supported by click-to-call and a showroom map for people who would rather not type. A what-we-buy taxonomy covering Rolex, Patek Philippe, Audemars Piguet and Cartier sets expectations before the enquiry, an account area keeps orders and a wishlist, and a paginated editorial section does the slow work of building credibility in a category where trust decides the transaction.',
          hy: 'Առևտրային հարթակների մեծ մասը ենթադրում է, որ այցելուն ուզում է գնել։ Այստեղ այցելուն ուզում է վաճառել, ինչը շրջում է բոլոր ենթադրությունները. կրիտիկական ուղու վրա զամբյուղ չկա, ապրանքը առաջարկ է, իսկ փոխակերպման իրադարձությունը՝ զրույց։ Հարթակն առաջ է մղում գնանշման հայտն ու հանդիպման ամրագրումը՝ լրացված զանգի կոճակով և սրահի քարտեզով նրանց համար, ովքեր նախընտրում են չգրել։ «Ինչ ենք գնում» դասակարգումը՝ Rolex, Patek Philippe, Audemars Piguet և Cartier, ձևավորում է սպասելիքները մինչ հայտը, հաշվի բաժինը պահում է պատվերներն ու ցանկացանկը, իսկ էջավորված խմբագրական բաժինը կատարում է վստահություն կառուցելու դանդաղ աշխատանքը այն կատեգորիայում, որտեղ վստահությունն է որոշում գործարքը։',
          ru: 'Большинство торговых платформ исходит из того, что посетитель хочет купить. Здесь посетитель хочет продать, и это переворачивает все допущения: на критическом пути нет корзины, товар — это предложение, а событие конверсии — разговор. Платформа выводит вперёд запрос оценки и запись на встречу, дополняя их кнопкой звонка и картой шоурума для тех, кто предпочитает не писать. Таксономия «что мы покупаем» — Rolex, Patek Philippe, Audemars Piguet, Cartier — задаёт ожидания до заявки, раздел аккаунта хранит заказы и список желаний, а редакционный блок с пагинацией делает медленную работу по выстраиванию доверия в категории, где именно доверие решает исход сделки.',
        }),
      },

      'klinik-europe': {
        name: t({ en: 'Klinik Europe', hy: 'Klinik Europe', ru: 'Klinik Europe' }),
        category: t({
          en: 'Medical tourism',
          hy: 'Բժշկական զբոսաշրջություն',
          ru: 'Медицинский туризм',
        }),
        hook: t({
          en: 'A multi-step booking flow that turns an international enquiry into a reserved date.',
          hy: 'Բազմաքայլ ամրագրման ընթացք, որը միջազգային հարցումը վերածում է ամրագրված ամսաթվի։',
          ru: 'Многошаговая форма записи, превращающая международный запрос в забронированную дату.',
        }),
        summary: t({
          en: 'A platform marketing surgical and aesthetic packages in Antalya to international patients, built around staged booking.',
          hy: 'Հարթակ, որը միջազգային հիվանդներին ներկայացնում է Անթալիայի վիրաբուժական և գեղագիտական փաթեթները՝ փուլային ամրագրմամբ։',
          ru: 'Платформа, представляющая международным пациентам хирургические и эстетические пакеты в Анталье, с поэтапной записью.',
        }),
        highlights: [
          t({
            en: 'Multi-step booking with procedure choice',
            hy: 'Բազմաքայլ ամրագրում՝ պրոցեդուրայի ընտրությամբ',
            ru: 'Многошаговая запись с выбором процедуры',
          }),
          t({
            en: 'Date reservation field',
            hy: 'Ամսաթվի ամրագրման դաշտ',
            ru: 'Поле бронирования даты',
          }),
          t({
            en: 'Free online consultation',
            hy: 'Անվճար առցանց խորհրդատվություն',
            ru: 'Бесплатная онлайн-консультация',
          }),
          t({
            en: 'Patient testimonial wall',
            hy: 'Հիվանդների կարծիքների պատ',
            ru: 'Стена отзывов пациентов',
          }),
        ],
        advantage: t({
          en: 'Cross-border healthcare needs trust before price, and the flow is built that way round.',
          hy: 'Անդրսահմանային բուժումը նախ վստահություն է պահանջում, հետո՝ գին, և ընթացքը կառուցված է հենց այդպես։',
          ru: 'Трансграничной медицине доверие нужно раньше цены — и поток выстроен именно так.',
        }),
        value: t({
          en: 'International enquiries arrive with the procedure and the date already chosen.',
          hy: 'Միջազգային հայտերը գալիս են արդեն ընտրված պրոցեդուրայով և ամսաթվով։',
          ru: 'Международные заявки приходят с уже выбранной процедурой и датой.',
        }),
        about: t({
          en: 'Choosing surgery in another country is among the highest-anxiety decisions a website can be asked to support. The platform treats the enquiry as a sequence rather than a form: the procedure is chosen first, a date is reserved, and contact details come last, so the commitment grows gradually instead of arriving all at once. A free online consultation offers a lower-stakes entry point for people not ready to book, and WhatsApp provides a familiar channel for international patients who would rather message than fill anything in. Named treatment packages set the scope before the conversation starts, and a testimonial wall carries the social proof the category depends on.',
          hy: 'Այլ երկրում վիրահատություն ընտրելը ամենաբարձր անհանգստությամբ որոշումներից է, որին կայքը կարող է աջակցել։ Հարթակը հայտը դիտարկում է որպես հաջորդականություն, ոչ թե ձև. նախ ընտրվում է պրոցեդուրան, հետո ամրագրվում ամսաթիվը, և միայն վերջում՝ կոնտակտային տվյալները, ուստի պարտավորությունն աճում է աստիճանաբար։ Անվճար առցանց խորհրդատվությունն ավելի ցածր ռիսկով մուտք է առաջարկում նրանց, ովքեր պատրաստ չեն ամրագրելու, իսկ WhatsApp-ը ծանոթ ալիք է միջազգային հիվանդների համար, ովքեր նախընտրում են գրել, քան ձև լրացնել։ Անվանական բուժական փաթեթները սահմանում են շրջանակը մինչ զրույցի սկիզբը, իսկ կարծիքների պատը կրում է այն սոցիալական ապացույցը, որից կախված է այս կատեգորիան։',
          ru: 'Выбор операции в другой стране — одно из самых тревожных решений, которые сайт может сопровождать. Платформа рассматривает заявку как последовательность, а не как форму: сначала выбирается процедура, затем бронируется дата, и только в конце указываются контакты, так что обязательство нарастает постепенно, а не обрушивается сразу. Бесплатная онлайн-консультация даёт вход с меньшей ставкой тем, кто не готов бронировать, а WhatsApp остаётся привычным каналом для международных пациентов, которым проще написать, чем заполнять что-либо. Именованные лечебные пакеты задают рамки до начала разговора, а стена отзывов несёт социальное доказательство, от которого эта категория зависит.',
        }),
      },

      'libra-analytics': {
        name: t({ en: 'Libra Analytics', hy: 'Libra Analytics', ru: 'Libra Analytics' }),
        category: t({
          en: 'Professional services',
          hy: 'Մասնագիտական ծառայություններ',
          ru: 'Профессиональные услуги',
        }),
        hook: t({
          en: 'A consulting platform where the expert team is the product being sold.',
          hy: 'Խորհրդատվական հարթակ, որտեղ վաճառվող արտադրանքը փորձագիտական թիմն է։',
          ru: 'Консалтинговая платформа, где продаваемый продукт — сама экспертная команда.',
        }),
        summary: t({
          en: 'A corporate platform for a labour, employment and data analytics consultancy working in litigation support and expert testimony.',
          hy: 'Աշխատանքային իրավունքի և տվյալների վերլուծության խորհրդատվական ընկերության կորպորատիվ հարթակ՝ դատական աջակցությամբ և փորձագիտական եզրակացություններով։',
          ru: 'Корпоративная платформа консалтинга по трудовому праву и аналитике данных с поддержкой судебных разбирательств и экспертными заключениями.',
        }),
        highlights: [
          t({
            en: 'Litigation support service lines',
            hy: 'Դատական աջակցության ուղղություններ',
            ru: 'Направления судебной поддержки',
          }),
          t({ en: 'Partner profiles', hy: 'Գործընկերների պրոֆիլներ', ru: 'Профили партнёров' }),
          t({
            en: 'Consultation booking',
            hy: 'Խորհրդատվության ամրագրում',
            ru: 'Запись на консультацию',
          }),
          t({
            en: 'News and insights',
            hy: 'Նորություններ և վերլուծություն',
            ru: 'Новости и аналитика',
          }),
        ],
        advantage: t({
          en: 'In expert services the credential is the conversion, so the platform is structured around people.',
          hy: 'Փորձագիտական ծառայություններում որակավորումն է փոխակերպումը, ուստի հարթակը կառուցված է մարդկանց շուրջ։',
          ru: 'В экспертных услугах конверсию делает квалификация, поэтому платформа выстроена вокруг людей.',
        }),
        value: t({
          en: 'Prospective clients can assess expertise before making contact, which filters the enquiries that arrive.',
          hy: 'Պոտենցիալ հաճախորդները կարող են գնահատել փորձառությունը մինչ կապ հաստատելը, ինչը զտում է մուտքային հայտերը։',
          ru: 'Потенциальные клиенты оценивают экспертизу до обращения, и это фильтрует входящие заявки.',
        }),
        about: t({
          en: 'When a law firm retains an analytics consultancy for wage-and-hour litigation or pay-equity work, it is retaining named individuals whose findings may be tested in court. The platform is organised accordingly: service lines are specific enough to recognise a matter in — wage and hour litigation, pay equity analysis, business data analytics — and partner profiles carry the credentials that make the testimony admissible in practice. Consultation booking is offered next to a short contact form, client statistics and a testimonial give third-party weight, and a news and insights stream demonstrates current thinking in a field where the regulation moves.',
          hy: 'Երբ իրավաբանական ընկերությունը ներգրավում է վերլուծական խորհրդատու աշխատաժամանակի կամ վարձատրության հավասարության գործով, այն ներգրավում է կոնկրետ մարդկանց, որոնց եզրակացությունները կարող են ստուգվել դատարանում։ Հարթակը կազմակերպված է դրան համապատասխան. ծառայությունների ուղղությունները բավական կոնկրետ են՝ աշխատաժամանակի դատավարություն, վարձատրության հավասարության վերլուծություն, բիզնես-տվյալների վերլուծություն, իսկ գործընկերների պրոֆիլները կրում են այն որակավորումները, որոնք գործնականում ընդունելի են դարձնում եզրակացությունը։ Խորհրդատվության ամրագրումն առաջարկվում է կարճ կոնտակտային ձևի կողքին, հաճախորդների վիճակագրությունն ու կարծիքը տալիս են երրորդ կողմի կշիռ, իսկ նորությունների ու վերլուծության հոսքը ցույց է տալիս արդի մոտեցումը ոլորտում, որտեղ կարգավորումը փոխվում է։',
          ru: 'Когда юридическая фирма привлекает аналитический консалтинг по делам об оплате труда или о равенстве вознаграждения, она привлекает конкретных людей, чьи выводы могут проверяться в суде. Платформа организована соответственно: направления услуг достаточно конкретны, чтобы узнать в них своё дело — споры об оплате рабочего времени, анализ равенства оплаты, бизнес-аналитика данных, — а профили партнёров несут квалификацию, которая на практике делает заключение приемлемым. Запись на консультацию предложена рядом с короткой контактной формой, статистика клиентов и отзыв дают вес третьей стороны, а поток новостей и аналитики показывает актуальность мышления в области, где регулирование меняется.',
        }),
      },

      'remake-templates': {
        name: t({ en: 'Remake Templates', hy: 'Remake Templates', ru: 'Remake Templates' }),
        category: t({
          en: 'Digital goods commerce',
          hy: 'Թվային ապրանքների առևտուր',
          ru: 'Торговля цифровыми товарами',
        }),
        hook: t({
          en: 'Digital-only fulfilment, genre browsing and multi-currency pricing for music producers.',
          hy: 'Միայն թվային առաքում, դիտում ըստ ժանրի և բազմարժութային գներ՝ երաժշտական պրոդյուսերների համար։',
          ru: 'Только цифровая доставка, просмотр по жанрам и мультивалютные цены для музыкальных продюсеров.',
        }),
        summary: t({
          en: 'Commerce for producer templates, presets, MIDI and samples, with no physical fulfilment and a subscriber tier.',
          hy: 'Պրոդյուսերական նախագծերի, պրեսեթների, MIDI-ի և սեմփլների առևտուր՝ առանց ֆիզիկական առաքման, բաժանորդային մակարդակով։',
          ru: 'Торговля продюсерскими проектами, пресетами, MIDI и сэмплами — без физической доставки, с уровнем подписчика.',
        }),
        highlights: [
          t({
            en: 'Instant digital delivery',
            hy: 'Ակնթարթային թվային առաքում',
            ru: 'Мгновенная цифровая доставка',
          }),
          t({ en: 'Genre-based browsing', hy: 'Դիտում ըստ ժանրի', ru: 'Просмотр по жанрам' }),
          t({ en: 'Currency selector', hy: 'Արժույթի ընտրիչ', ru: 'Выбор валюты' }),
          t({ en: 'Subscriber area', hy: 'Բաժանորդների բաժին', ru: 'Раздел подписчиков' }),
        ],
        advantage: t({
          en: 'A catalogue with no shipping, no stock and worldwide pricing.',
          hy: 'Կատալոգ առանց առաքման, առանց պահեստի, համաշխարհային գնագոյացմամբ։',
          ru: 'Каталог без доставки, без склада и с мировым ценообразованием.',
        }),
        value: t({
          en: 'Margin and reach that physical goods commerce cannot match.',
          hy: 'Մարժա և հասանելիություն, որոնց ֆիզիկական ապրանքների առևտուրը չի հասնում։',
          ru: 'Маржа и охват, недостижимые для торговли физическими товарами.',
        }),
        about: t({
          en: 'A store selling only digital goods removes most of the machinery conventional commerce is built around — there is no stock, no shipping, no fulfilment window — and replaces it with problems of discovery and licensing. The catalogue is organised by genre, so a producer working in Afro House or Deep House can find material by the sound rather than by the title, and search covers the rest. Sale and regular pricing run side by side, a currency selector handles an audience that is international by default, and a subscriber area sits alongside one-off purchases. The shipping policy says it plainly: digital products only.',
          hy: 'Միայն թվային ապրանք վաճառող խանութը հեռացնում է այն մեխանիկայի մեծ մասը, որի շուրջ կառուցված է սովորական առևտուրը՝ չկա պահեստ, չկա առաքում, չկա առաքման ժամկետ, և փոխարինում է այն հայտնաբերման ու լիցենզավորման խնդիրներով։ Կատալոգը կազմակերպված է ըստ ժանրի, ուստի Afro House կամ Deep House ոճում աշխատող պրոդյուսերը կարող է գտնել նյութը ըստ հնչողության, ոչ թե անվան, իսկ որոնումը ծածկում է մնացածը։ Զեղչային և սովորական գները գործում են կողք կողքի, արժույթի ընտրիչը սպասարկում է լսարան, որը լռելյայն միջազգային է, իսկ բաժանորդների բաժինը գոյակցում է միանվագ գնումների հետ։ Առաքման քաղաքականությունն ասում է ուղիղ՝ միայն թվային ապրանքներ։',
          ru: 'Магазин, торгующий только цифровыми товарами, убирает большую часть механики, вокруг которой построена обычная торговля — нет склада, нет доставки, нет срока отгрузки — и заменяет её задачами поиска и лицензирования. Каталог организован по жанрам, поэтому продюсер, работающий в Afro House или Deep House, находит материал по звучанию, а не по названию, а поиск покрывает остальное. Акционные и обычные цены идут рядом, переключатель валют обслуживает аудиторию, международную по умолчанию, а раздел подписчиков соседствует с разовыми покупками. Политика доставки формулирует это прямо: только цифровые продукты.',
        }),
      },

      'got-matcha': {
        name: t({ en: 'Got Matcha', hy: 'Got Matcha', ru: 'Got Matcha' }),
        category: t({
          en: 'Specialty tea commerce',
          hy: 'Հատուկ թեյի առևտուր',
          ru: 'Торговля специальным чаем',
        }),
        hook: t({
          en: 'Subscribe-and-save and gift bundles, priced in the customer’s own currency.',
          hy: 'Բաժանորդագրություն զեղչով և նվերների փաթեթներ՝ հաճախորդի արժույթով։',
          ru: 'Подписка со скидкой и подарочные наборы — в валюте самого покупателя.',
        }),
        summary: t({
          en: 'International direct-to-consumer commerce for a premium matcha brand spanning ceremonial grades, blends and teaware.',
          hy: 'Պրեմիում matcha բրենդի միջազգային ուղիղ վաճառք՝ արարողակարգային տեսակներ, խառնուրդներ և թեյի պարագաներ։',
          ru: 'Международные прямые продажи премиального бренда матча: церемониальные сорта, купажи и чайная утварь.',
        }),
        highlights: [
          t({
            en: 'Subscribe and save',
            hy: 'Բաժանորդագրություն՝ զեղչով',
            ru: 'Подписка со скидкой',
          }),
          t({
            en: 'Multi-jar gift bundles',
            hy: 'Նվերների բազմաբանկա փաթեթներ',
            ru: 'Подарочные наборы из нескольких банок',
          }),
          t({
            en: 'Country and currency selector',
            hy: 'Երկրի և արժույթի ընտրիչ',
            ru: 'Выбор страны и валюты',
          }),
          t({
            en: 'Reviewed product pages',
            hy: 'Կարծիքներով ապրանքէջեր',
            ru: 'Страницы товаров с отзывами',
          }),
        ],
        advantage: t({
          en: 'Sells into multiple countries without a separate storefront for each market.',
          hy: 'Վաճառում է մի քանի երկրում՝ առանց յուրաքանչյուր շուկայի համար առանձին խանութի։',
          ru: 'Продаёт в нескольких странах без отдельной витрины под каждый рынок.',
        }),
        value: t({
          en: 'A specialty brand reaches an international audience from one catalogue.',
          hy: 'Հատուկ բրենդը հասնում է միջազգային լսարանին մեկ կատալոգից։',
          ru: 'Нишевый бренд выходит на международную аудиторию из одного каталога.',
        }),
        about: t({
          en: 'Specialty tea has a small audience in any one country and a substantial one across many, which makes international selling a requirement rather than an ambition. The platform handles it with a country and currency selector, so a visitor sees prices they can act on without converting anything themselves. The catalogue spans ceremonial grades, flavoured blends, mushroom-matcha products, a protein meal and teaware — a range wide enough to need structure, which arrives as collections, search and a collapsible FAQ for the questions grade and preparation always raise. Subscribe-and-save covers repeat purchase, while multi-jar gift sets cover the other half of this category’s demand.',
          hy: 'Հատուկ թեյն ունի փոքր լսարան յուրաքանչյուր առանձին երկրում և զգալի լսարան շատերի մեջ, ինչը միջազգային վաճառքը դարձնում է պահանջ, ոչ թե հավակնություն։ Հարթակը դա լուծում է երկրի և արժույթի ընտրիչով, ուստի այցելուն տեսնում է գներ, որոնցով կարող է գործել՝ առանց ինքնուրույն փոխարկելու։ Կատալոգն ընդգրկում է արարողակարգային տեսակներ, համեմված խառնուրդներ, սնկով matcha, սպիտակուցային արտադրանք և թեյի պարագաներ՝ բավական լայն շարք, որը կառուցվածք է պահանջում և ստանում է այն հավաքածուների, որոնման և ծալվող FAQ-ի տեսքով այն հարցերի համար, որոնք միշտ առաջանում են տեսակի ու պատրաստման շուրջ։ Բաժանորդագրությունը ծածկում է կրկնվող գնումը, իսկ բազմաբանկա նվերների հավաքածուները՝ այս կատեգորիայի պահանջարկի մյուս կեսը։',
          ru: 'У специального чая небольшая аудитория в каждой отдельной стране и существенная — суммарно, поэтому международные продажи здесь требование, а не амбиция. Платформа решает это выбором страны и валюты, так что посетитель видит цены, с которыми может действовать, ничего не пересчитывая. Каталог охватывает церемониальные сорта, ароматизированные купажи, матчу с грибами, протеиновый продукт и чайную утварь — диапазон, достаточно широкий, чтобы требовать структуры, и она приходит в виде коллекций, поиска и сворачиваемого FAQ для вопросов о сорте и приготовлении, которые возникают всегда. Подписка закрывает повторную покупку, а подарочные наборы из нескольких банок — вторую половину спроса в этой категории.',
        }),
      },

      lav: {
        name: t({ en: 'LAV', hy: 'LAV', ru: 'LAV' }),
        category: t({
          en: 'Food & beverage commerce',
          hy: 'Սննդի և ըմպելիքի առևտուր',
          ru: 'Торговля продуктами питания',
        }),
        hook: t({
          en: 'A build-a-bundle flow for Armenian-inspired dressings, backed by a 4.88 review average.',
          hy: 'Հայկական խոհանոցից ոգեշնչված սոուսների փաթեթի կառուցիչ՝ 4.88 միջին գնահատականով։',
          ru: 'Конструктор набора соусов, вдохновлённых армянской кухней, со средней оценкой 4,88.',
        }),
        summary: t({
          en: 'Commerce for a shelf-stable dressing brand, combining a three-or-more bundle builder with recipe content.',
          hy: 'Երկարաժամկետ պահպանման սոուսների բրենդի առևտուր՝ երեք և ավելի ապրանքի փաթեթի կառուցիչ և բաղադրատոմսեր։',
          ru: 'Коммерция бренда соусов длительного хранения: конструктор набора от трёх позиций и рецептурный контент.',
        }),
        highlights: [
          t({
            en: 'Build a bundle and save',
            hy: 'Կառուցիր փաթեթ և խնայիր',
            ru: 'Собери набор и сэкономь',
          }),
          t({ en: 'Recipe content', hy: 'Բաղադրատոմսերի բաժին', ru: 'Рецептурный раздел' }),
          t({
            en: 'Wholesale and affiliate routes',
            hy: 'Մեծածախ և գործընկերային ուղիներ',
            ru: 'Оптовый и партнёрский каналы',
          }),
          t({ en: '4.88 average rating', hy: '4.88 միջին գնահատական', ru: 'Средняя оценка 4,88' }),
        ],
        advantage: t({
          en: 'Content and commerce on one path — the recipes are what sell the product.',
          hy: 'Բովանդակություն և առևտուր մեկ ուղու վրա՝ բաղադրատոմսերն են վաճառում ապրանքը։',
          ru: 'Контент и продажа на одном пути — продукт продают именно рецепты.',
        }),
        value: t({
          en: 'Average order value rises through bundling rather than through discounting.',
          hy: 'Միջին պատվերի արժեքն աճում է փաթեթավորման, ոչ թե զեղչի հաշվին։',
          ru: 'Средний чек растёт за счёт наборов, а не за счёт скидок.',
        }),
        about: t({
          en: 'A dressing is a low-price, high-repeat product, which makes the first order the difficult one and the basket size the thing worth engineering. The platform answers both: a build-a-bundle mechanic rewards choosing three or more at once, so the opening purchase is larger than a single bottle, and recipe content gives a reason to come back that is not a discount email. Reviews averaging 4.88 sit on the path rather than buried below it. Wholesale and affiliate routes run alongside direct sales, and an Armenian-inspired range gives the brand a story that distinguishes it on a shelf where most competitors sell on price.',
          hy: 'Սոուսը ցածր գնով, հաճախակի կրկնվող գնում է, ինչը դժվարացնում է առաջին պատվերը և կարևորում զամբյուղի չափը։ Հարթակը պատասխանում է երկուսին էլ. փաթեթի կառուցման մեխանիկան խրախուսում է միանգամից երեք և ավելի ընտրելը, ուստի առաջին գնումը մեկ շշից մեծ է, իսկ բաղադրատոմսերը տալիս են վերադառնալու պատճառ, որը զեղչի նամակ չէ։ 4.88 միջին գնահատականով կարծիքները գտնվում են ուղու վրա, ոչ թե թաղված ներքևում։ Մեծածախ և գործընկերային ուղիները գործում են ուղիղ վաճառքի կողքին, իսկ հայկական խոհանոցից ոգեշնչված շարքը բրենդին տալիս է պատմություն, որը տարբերում է այն դարակում, որտեղ մրցակիցների մեծ մասը վաճառում է գնով։',
          ru: 'Соус — недорогой товар с частым повторным спросом, поэтому трудным оказывается первый заказ, а инженерного внимания заслуживает размер корзины. Платформа отвечает на обе задачи: механика сборки набора вознаграждает выбор трёх и более позиций сразу, так что стартовая покупка крупнее одной бутылки, а рецептурный контент даёт повод вернуться, не связанный с письмом о скидке. Отзывы со средней оценкой 4,88 находятся на пути, а не спрятаны внизу. Оптовый и партнёрский каналы работают рядом с прямыми продажами, а линейка, вдохновлённая армянской кухней, даёт бренду историю, которая выделяет его на полке, где большинство конкурентов продаёт ценой.',
        }),
      },

      'roar-organic': {
        name: t({ en: 'ROAR Organic', hy: 'ROAR Organic', ru: 'ROAR Organic' }),
        category: t({
          en: 'Organic beverage commerce',
          hy: 'Օրգանական ըմպելիքների առևտուր',
          ru: 'Торговля органическими напитками',
        }),
        hook: t({
          en: 'A flavour finder and a retailer locator, alongside a 15% subscription.',
          hy: 'Համի ընտրիչ և վաճառակետերի որոնիչ՝ 15% բաժանորդագրության կողքին։',
          ru: 'Подбор вкуса и поиск магазинов рядом с подпиской на 15%.',
        }),
        summary: t({
          en: 'Direct-to-consumer commerce for an organic electrolyte brand, with guided flavour discovery and a store locator for stockists.',
          hy: 'Օրգանական էլեկտրոլիտային բրենդի ուղիղ վաճառք՝ ուղղորդված համի ընտրությամբ և վաճառակետերի որոնիչով։',
          ru: 'Прямые продажи органического электролитного бренда с подбором вкуса и поиском точек продаж.',
        }),
        highlights: [
          t({
            en: 'Find-your-flavour discovery',
            hy: '«Գտիր քո համը» ընտրություն',
            ru: 'Подбор «найди свой вкус»',
          }),
          t({
            en: 'Variety and multi-count packs',
            hy: 'Տեսականու և բազմաքանակ փաթեթներ',
            ru: 'Ассорти и многоштучные упаковки',
          }),
          t({
            en: 'Subscribe and save 15%',
            hy: 'Բաժանորդագրություն՝ 15% զեղչ',
            ru: 'Подписка со скидкой 15%',
          }),
          t({
            en: 'Retailer store locator',
            hy: 'Վաճառակետերի որոնիչ',
            ru: 'Поиск розничных точек',
          }),
        ],
        advantage: t({
          en: 'Omnichannel by design: the platform sells direct and routes customers to shelves.',
          hy: 'Բազմաալիք ըստ նախագծման. հարթակը վաճառում է ուղիղ և ուղղորդում դեպի վաճառակետեր։',
          ru: 'Омниканальность по замыслу: платформа продаёт напрямую и направляет к полкам.',
        }),
        value: t({
          en: 'One platform serves both the direct channel and retail distribution.',
          hy: 'Մեկ հարթակ սպասարկում է և՛ ուղիղ ալիքը, և՛ մանրածախ բաշխումը։',
          ru: 'Одна платформа обслуживает и прямой канал, и розничную дистрибуцию.',
        }),
        about: t({
          en: 'A beverage brand that sells online and sits on supermarket shelves has to do two jobs at once, and they pull in opposite directions: one asks the visitor to order now, the other asks them to find the nearest shop. This platform carries both without treating either as secondary. Flavour choice — the decision that actually drives a first beverage purchase — is handled by a guided carousel rather than a grid, variety packs and multi-count bundles cover the follow-on order, subscription is offered at fifteen per cent, and a store locator points at retail stockists for customers who would rather pick it up today.',
          hy: 'Ըմպելիքի բրենդը, որը վաճառում է առցանց և ներկա է սուպերմարկետի դարակին, պետք է միաժամանակ կատարի երկու գործ, որոնք քաշում են հակառակ ուղղություններով. մեկը խնդրում է այցելուին պատվիրել հիմա, մյուսը՝ գտնել մոտակա խանութը։ Այս հարթակը կրում է երկուսն էլ՝ առանց որևէ մեկը երկրորդական համարելու։ Համի ընտրությունը՝ այն որոշումը, որն իրականում որոշում է առաջին գնումը, իրականացվում է ուղղորդված կարուսելով, ոչ թե ցանցով, տեսականու և բազմաքանակ փաթեթները ծածկում են հաջորդ պատվերը, բաժանորդագրությունն առաջարկվում է տասնհինգ տոկոս զեղչով, իսկ վաճառակետերի որոնիչը ցույց է տալիս խանութները նրանց, ովքեր նախընտրում են վերցնել այսօր։',
          ru: 'Бренд напитков, который продаёт онлайн и стоит на полке супермаркета, выполняет две задачи сразу, и они тянут в разные стороны: одна просит посетителя заказать сейчас, другая — найти ближайший магазин. Эта платформа несёт обе, не считая ни одну второстепенной. Выбор вкуса — решение, которое на деле определяет первую покупку напитка, — реализован ведомой каруселью, а не сеткой, ассорти и многоштучные наборы закрывают следующий заказ, подписка предлагается со скидкой пятнадцать процентов, а поиск магазинов указывает на розничные точки тем, кто предпочитает забрать сегодня.',
        }),
      },

      'zadeh-md': {
        name: t({ en: 'Zadeh MD Skin', hy: 'Zadeh MD Skin', ru: 'Zadeh MD Skin' }),
        category: t({
          en: 'Medical-grade skincare',
          hy: 'Բժշկական մակարդակի խնամք',
          ru: 'Уход медицинского класса',
        }),
        hook: t({
          en: 'Practitioner-founded skincare, sold with the clinical credential kept in front.',
          hy: 'Բժշկի հիմնադրած խնամքի շարք, որտեղ կլինիկական որակավորումը մնում է առաջին պլանում։',
          ru: 'Уход, основанный практикующим врачом, где клиническая квалификация остаётся на первом плане.',
        }),
        summary: t({
          en: 'Commerce for a medical-grade skincare line founded by a board-certified surgeon, with reviewed product pages.',
          hy: 'Սերտիֆիկացված վիրաբույժի հիմնադրած բժշկական մակարդակի խնամքի շարքի առևտուր՝ կարծիքներով ապրանքէջերով։',
          ru: 'Коммерция линии ухода медицинского класса, основанной сертифицированным хирургом, со страницами товаров с отзывами.',
        }),
        highlights: [
          t({
            en: 'Practitioner-founded range',
            hy: 'Բժշկի հիմնադրած շարք',
            ru: 'Линейка, основанная врачом',
          }),
          t({
            en: 'Review counts on product pages',
            hy: 'Կարծիքների քանակը ապրանքէջերում',
            ru: 'Количество отзывов на страницах товаров',
          }),
          t({
            en: 'Collection-based browsing',
            hy: 'Դիտում ըստ հավաքածուների',
            ru: 'Просмотр по коллекциям',
          }),
          t({ en: 'Newsletter capture', hy: 'Լրահոսի բաժանորդագրում', ru: 'Подписка на рассылку' }),
        ],
        advantage: t({
          en: 'Clinical authorship is the differentiator, so the founder’s credential carries the catalogue.',
          hy: 'Կլինիկական հեղինակությունն է տարբերակիչը, ուստի հիմնադրի որակավորումը կրում է կատալոգը։',
          ru: 'Отличие — в клиническом авторстве, поэтому квалификация основателя держит весь каталог.',
        }),
        value: t({
          en: 'Trust transfers from the practitioner to the product, which is what medical-grade retail depends on.',
          hy: 'Վստահությունը բժշկից փոխանցվում է ապրանքին, ինչից և կախված է բժշկական մակարդակի մանրածախը։',
          ru: 'Доверие переносится с врача на продукт — именно на этом держится розница медицинского класса.',
        }),
        about: t({
          en: 'Medical-grade skincare competes with two very different things: ordinary cosmetics, which are cheaper, and clinical treatment, which is more credible. Its position depends entirely on whose name is on it. The platform keeps that front and centre — the range is presented as the work of a board-certified surgeon and aesthetic physician — and lets the catalogue mechanics stay deliberately plain beneath it: collections and category menus, search, product pages carrying price and review counts, a cart with a running item count, and newsletter capture. Nothing distracts from the credential, because the credential is the proposition.',
          hy: 'Բժշկական մակարդակի խնամքը մրցում է երկու շատ տարբեր բաների հետ՝ սովորական կոսմետիկայի, որն ավելի էժան է, և կլինիկական բուժման, որն ավելի վստահելի է։ Նրա դիրքն ամբողջովին կախված է այն բանից, թե ում անունն է դրա վրա։ Հարթակը դա պահում է առաջին պլանում՝ շարքը ներկայացվում է որպես սերտիֆիկացված վիրաբույժի և էսթետիկ բժշկի աշխատանք, և թույլ է տալիս կատալոգի մեխանիկային մնալ միտումնավոր պարզ՝ հավաքածուներ և կատեգորիաների ցանկեր, որոնում, ապրանքէջեր գնով և կարծիքների քանակով, զամբյուղ՝ ընթացիկ հաշվով, և լրահոսի բաժանորդագրում։ Ոչինչ չի շեղում որակավորումից, որովհետև որակավորումն է առաջարկը։',
          ru: 'Уход медицинского класса конкурирует с двумя очень разными вещами: с обычной косметикой, которая дешевле, и с клиническим лечением, которое убедительнее. Его позиция целиком зависит от того, чьё имя на нём стоит. Платформа держит это на первом плане — линейка представлена как работа сертифицированного хирурга и эстетического врача, — а механике каталога позволяет остаться намеренно простой: коллекции и меню категорий, поиск, страницы товаров с ценой и числом отзывов, корзина с текущим счётчиком и подписка на рассылку. Ничто не отвлекает от квалификации, потому что квалификация и есть предложение.',
        }),
      },

      'tai-ping': {
        name: t({ en: 'Tai Ping', hy: 'Tai Ping', ru: 'Tai Ping' }),
        category: t({
          en: 'Grocery retail & wholesale',
          hy: 'Մթերային մանրածախ և մեծածախ',
          ru: 'Продуктовая розница и опт',
        }),
        hook: t({
          en: 'Nine Auckland stores, their departments and their weekly promotions, on one platform.',
          hy: 'Օքլենդի ինը խանութ, դրանց բաժինները և շաբաթական առաջարկները՝ մեկ հարթակում։',
          ru: 'Девять магазинов Окленда, их отделы и еженедельные акции — на одной платформе.',
        }),
        summary: t({
          en: 'A retail platform for an Asian supermarket chain and food importer, covering departments, promotions and store locations.',
          hy: 'Ասիական սուպերմարկետների ցանցի և սննդի ներկրողի մանրածախ հարթակ՝ բաժիններով, առաջարկներով և խանութների տեղակայմամբ։',
          ru: 'Розничная платформа сети азиатских супермаркетов и импортёра продуктов: отделы, акции и адреса магазинов.',
        }),
        highlights: [
          t({
            en: 'Nine-store locator',
            hy: 'Ինը խանութի որոնիչ',
            ru: 'Поиск по девяти магазинам',
          }),
          t({
            en: 'Produce, seafood, butchery, BBQ',
            hy: 'Բանջարեղեն, ծովամթերք, մսեղեն, BBQ',
            ru: 'Овощи, морепродукты, мясо, BBQ',
          }),
          t({ en: 'Weekly promotions', hy: 'Շաբաթական առաջարկներ', ru: 'Еженедельные акции' }),
          t({
            en: 'Importer and wholesale positioning',
            hy: 'Ներկրողի և մեծածախի դիրքավորում',
            ru: 'Позиционирование импортёра и опта',
          }),
        ],
        advantage: t({
          en: 'Multi-store retail operations rather than a storefront — locations and promotions change every week.',
          hy: 'Բազմախանութ մանրածախ գործառնություն, ոչ թե վիտրին. վայրերն ու առաջարկները փոխվում են ամեն շաբաթ։',
          ru: 'Мультимагазинные операции, а не витрина: адреса и акции меняются каждую неделю.',
        }),
        value: t({
          en: 'One platform keeps nine stores’ information current for shoppers and trade buyers alike.',
          hy: 'Մեկ հարթակը ինը խանութի տեղեկությունը արդի է պահում և՛ գնորդների, և՛ մեծածախ հաճախորդների համար։',
          ru: 'Одна платформа поддерживает актуальность информации девяти магазинов для покупателей и оптовиков.',
        }),
        about: t({
          en: 'A grocery chain’s website is not a storefront; almost nobody buys fresh produce online in this category. What they need is to know which store, which department, and what is on promotion this week — three things that change constantly and are therefore an editorial operation, not a catalogue. The platform is organised around that reality: department routes for produce, seafood, butchery and Hong Kong BBQ, a promotions page, a locator covering nine Auckland stores, FAQ and contact, and a Popular Brands section that does the work of a search function for shoppers who come looking for one specific import.',
          hy: 'Մթերային ցանցի կայքը վիտրին չէ. այս կատեգորիայում գրեթե ոչ ոք թարմ մթերք առցանց չի գնում։ Պետք է իմանալ՝ որ խանութը, որ բաժինը և ինչ է այս շաբաթ զեղչով. երեք բան, որոնք անընդհատ փոխվում են և հետևաբար խմբագրական գործառնություն են, ոչ թե կատալոգ։ Հարթակը կազմակերպված է հենց այդ իրողության շուրջ՝ բաժինների ուղիներ բանջարեղենի, ծովամթերքի, մսեղենի և Հոնկոնգյան BBQ-ի համար, առաջարկների էջ, Օքլենդի ինը խանութը ծածկող որոնիչ, FAQ և կոնտակտներ, ինչպես նաև «Հայտնի բրենդներ» բաժին, որը կատարում է որոնման գործառույթը այն գնորդների համար, ովքեր գալիս են մեկ կոնկրետ ներկրվող ապրանքի համար։',
          ru: 'Сайт продуктовой сети — не витрина: в этой категории свежие продукты онлайн почти никто не покупает. Нужно знать, какой магазин, какой отдел и что на этой неделе по акции — три вещи, которые постоянно меняются и потому представляют собой редакционную работу, а не каталог. Платформа организована вокруг этой реальности: разделы отделов для овощей, морепродуктов, мясного и гонконгского BBQ, страница акций, локатор девяти магазинов Окленда, FAQ и контакты, а также блок популярных брендов, выполняющий роль поиска для покупателей, пришедших за одним конкретным импортным товаром.',
        }),
      },

      mezave: {
        name: t({ en: 'Mezave', hy: 'Mezave', ru: 'Mezave' }),
        category: t({
          en: 'Community food sharing',
          hy: 'Համայնքային սննդի փոխանակում',
          ru: 'Общественный обмен продуктами',
        }),
        hook: t({
          en: 'A Hebrew-language Android app for getting surplus food to the households that need it.',
          hy: 'Եբրայերեն Android հավելված՝ ավելցուկային սնունդը կարիքավոր ընտանիքներին հասցնելու համար։',
          ru: 'Android-приложение на иврите, доставляющее излишки еды нуждающимся домохозяйствам.',
        }),
        summary: t({
          en: 'A community application connecting people who have food to share with people who need it, published on Google Play.',
          hy: 'Համայնքային հավելված, որը կապում է սնունդ կիսելու պատրաստ մարդկանց կարիք ունեցողների հետ, հրապարակված Google Play-ում։',
          ru: 'Общественное приложение, связывающее тех, кто готов поделиться едой, с теми, кому она нужна, опубликовано в Google Play.',
        }),
        highlights: [
          t({
            en: 'Community food listings',
            hy: 'Համայնքային սննդի հայտարարություններ',
            ru: 'Объявления о еде в сообществе',
          }),
          t({
            en: 'Hebrew-language interface',
            hy: 'Եբրայերեն ինտերֆեյս',
            ru: 'Интерфейс на иврите',
          }),
          t({
            en: 'Published on Google Play',
            hy: 'Հրապարակված Google Play-ում',
            ru: 'Опубликовано в Google Play',
          }),
          t({
            en: 'Social support focus',
            hy: 'Սոցիալական աջակցության ուղղվածություն',
            ru: 'Фокус на социальной поддержке',
          }),
        ],
        advantage: t({
          en: 'The only non-commercial product here — built for reach rather than revenue.',
          hy: 'Այստեղ միակ ոչ առևտրային արտադրանքը՝ ստեղծված հասանելիության, ոչ թե եկամտի համար։',
          ru: 'Единственный некоммерческий продукт здесь — создан ради охвата, а не выручки.',
        }),
        value: t({
          en: 'Technology applied to food insecurity at neighbourhood scale.',
          hy: 'Տեխնոլոգիա՝ կիրառված սննդի անապահովության դեմ՝ թաղամասի մասշտաբով։',
          ru: 'Технология, применённая к проблеме доступа к еде на уровне района.',
        }),
        about: t({
          en: 'Food reaches the people who need it through neighbours far more often than through institutions, and the limiting factor is usually coordination rather than supply. Mezave — the name is the Hebrew word for a pantry — addresses that directly, connecting people with food to share and people who need it, in Hebrew, for a local audience, distributed through Google Play. It is the only product in this portfolio with no commercial model behind it, which changes what success means: the measure is whether a household eats, not whether an order converts. Engineering for that goal, under the same quality expectations as paid work, is its own discipline.',
          hy: 'Սնունդը կարիքավորներին շատ ավելի հաճախ հասնում է հարևանների, քան հաստատությունների միջոցով, և սահմանափակող գործոնը սովորաբար համակարգումն է, ոչ թե պաշարը։ Mezave-ն, որի անունը եբրայերեն «մառան» է նշանակում, անդրադառնում է հենց դրան՝ կապելով սնունդ կիսելու պատրաստ մարդկանց և կարիք ունեցողներին, եբրայերենով, տեղական լսարանի համար, Google Play-ի միջոցով։ Սա այս պորտֆոլիոյի միակ արտադրանքն է, որի հետևում առևտրային մոդել չկա, ինչը փոխում է հաջողության իմաստը. չափանիշն այն է՝ ընտանիքը կերա՞վ, ոչ թե պատվերը փոխակերպվե՞ց։ Այդ նպատակի համար ինժեներությունը՝ վճարովի աշխատանքի նույն որակի սպասելիքներով, առանձին կարգապահություն է։',
          ru: 'Еда доходит до тех, кому она нужна, гораздо чаще через соседей, чем через институты, и ограничивающим фактором обычно оказывается координация, а не запасы. Mezave — название означает на иврите «кладовая» — решает именно это, связывая людей, готовых поделиться едой, с теми, кому она нужна, на иврите, для локальной аудитории, через Google Play. Это единственный продукт в портфолио без коммерческой модели, и это меняет смысл успеха: мерой становится то, поел ли человек, а не сконвертировался ли заказ. Инженерия под такую цель, с теми же требованиями к качеству, что и в оплачиваемой работе, — отдельная дисциплина.',
        }),
      },

      'connected-car': {
        name: t({
          en: 'Connected Vehicle App',
          hy: 'Կապակցված մեքենայի հավելված',
          ru: 'Приложение для подключённого автомобиля',
        }),
        category: t({
          en: 'Connected vehicle software',
          hy: 'Կապակցված մեքենայի ծրագրակազմ',
          ru: 'Софт для подключённого автомобиля',
        }),
        hook: t({
          en: 'Remote control, live location and maintenance history for premium vehicle owners.',
          hy: 'Հեռակառավարում, իրական ժամանակի տեղորոշում և սպասարկման պատմություն՝ պրեմիում մեքենաների սեփականատերերի համար։',
          ru: 'Удалённое управление, актуальная геопозиция и история обслуживания для владельцев премиальных автомобилей.',
        }),
        summary: t({
          en: 'A mobile application bringing remote control, GPS tracking, security alerts and service history into one place.',
          hy: 'Բջջային հավելված, որը մեկ տեղում միավորում է հեռակառավարումը, GPS հետևումը, անվտանգության ծանուցումները և սպասարկման պատմությունը։',
          ru: 'Мобильное приложение, объединяющее удалённое управление, GPS-отслеживание, оповещения безопасности и историю обслуживания.',
        }),
        highlights: [
          t({
            en: 'Remote vehicle control',
            hy: 'Մեքենայի հեռակառավարում',
            ru: 'Удалённое управление автомобилем',
          }),
          t({ en: 'GPS tracking', hy: 'GPS հետևում', ru: 'GPS-отслеживание' }),
          t({
            en: 'Security alerts',
            hy: 'Անվտանգության ծանուցումներ',
            ru: 'Оповещения безопасности',
          }),
          t({
            en: 'Maintenance records',
            hy: 'Սպասարկման գրառումներ',
            ru: 'Записи об обслуживании',
          }),
        ],
        advantage: t({
          en: 'Device integration and live telemetry — the most hardware-adjacent product in this portfolio.',
          hy: 'Սարքային ինտեգրում և իրական ժամանակի հեռաչափություն՝ այս պորտֆոլիոյի ամենասարքամոտ արտադրանքը։',
          ru: 'Интеграция с устройством и телеметрия в реальном времени — самый «железный» продукт в этом портфолио.',
        }),
        value: t({
          en: 'Owners get one place for things that previously meant a call to the dealer.',
          hy: 'Սեփականատերերը ստանում են մեկ վայր այն բաների համար, որոնք նախկինում դիլերին զանգ էին պահանջում։',
          ru: 'Владелец получает одно место для того, что раньше означало звонок дилеру.',
        }),
        about: t({
          en: 'A connected-vehicle application is unlike every other product in this portfolio because the other side of the interface is a car rather than a database. Latency matters, connectivity is intermittent by nature, and a failed command has consequences a failed page load does not. The application brings remote control, GPS tracking, real-time monitoring, security alerting and maintenance management into a single interface for owners of premium vehicles. Of all nineteen products this is the one whose published presence could not be established, so what is described here is its intended scope rather than a feature set verified against a live listing.',
          hy: 'Կապակցված մեքենայի հավելվածը տարբերվում է այս պորտֆոլիոյի մյուս բոլոր արտադրանքներից, որովհետև ինտերֆեյսի մյուս կողմում մեքենա է, ոչ թե տվյալների բազա։ Ուշացումը կարևոր է, կապը բնույթով ընդհատվող է, իսկ ձախողված հրամանն ունի հետևանքներ, որոնք չունի չբեռնված էջը։ Հավելվածը մեկ ինտերֆեյսում միավորում է հեռակառավարումը, GPS հետևումը, իրական ժամանակի մոնիտորինգը, անվտանգության ծանուցումներն ու սպասարկման կառավարումը՝ պրեմիում մեքենաների սեփականատերերի համար։ Տասնինը արտադրանքից սա միակն է, որի հրապարակային ներկայությունը հնարավոր չեղավ հաստատել, ուստի այստեղ նկարագրվածը նրա նախատեսված շրջանակն է, ոչ թե գործող էջի դիմաց ստուգված հնարավորությունների ցանկ։',
          ru: 'Приложение для подключённого автомобиля отличается от всех остальных продуктов портфолио тем, что по другую сторону интерфейса находится машина, а не база данных. Здесь важна задержка, связь по своей природе прерывиста, а несработавшая команда имеет последствия, которых не бывает у незагрузившейся страницы. Приложение объединяет в одном интерфейсе удалённое управление, GPS-отслеживание, мониторинг в реальном времени, оповещения безопасности и управление обслуживанием для владельцев премиальных автомобилей. Из девятнадцати продуктов это единственный, чьё публичное присутствие установить не удалось, поэтому описанное здесь — его предполагаемый объём, а не набор функций, проверенный по действующей странице.',
        }),
      },
    },
  },
} as const satisfies Dictionary;

export default productContent;
