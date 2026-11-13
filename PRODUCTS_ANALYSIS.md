# Product Analysis — the nineteen products behind `/our_work`

**Project:** Nexora · **Date:** 2026-11-14 · **Branch:** `main` · **HEAD:** `f766248`
**Scope:** every product card in `app-products`, its purpose, its verified functionality, its assets and what is missing.
**Method:** source reading only — `product.content.ts` (1120 lines, three locales), `data/product-meta.ts`, `data/product-ids.ts`, `data/product-view.ts`, the templates, and the asset tree. No application code was modified.

---

## 0. Read this first — the brief describes an older version of the page

The brief refers to cards with `class="expertise__card"`. **That class is not in the working tree.** It is the committed state at `HEAD` (`f766248`), and the page has moved on since that commit without the change being committed. Verified by `git show HEAD:…/products.html` against the file on disk:

|                  | At `HEAD` (`f766248`) — what the brief describes                     | In the working tree today                                                                  |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Card class       | `expertise__card`                                                    | `projects__card` / `project-card__*`                                                       |
| Card component   | None — the card was inline markup in `products.html`                 | `app-project-card`, its own component                                                      |
| Data             | One flat `services: [...]` array of 19 objects inside the dictionary | `PRODUCT_IDS` → `PRODUCT_META` → `ProductView`, joined to a per-product dictionary         |
| Card image       | `<img>` at `width: 75%; height: 150px` beside an icon tile           | Full-bleed 16/10 media band                                                                |
| Card link        | `<a [href]="service.path">` straight to the client's live site       | `routerLink` to `/our_work/<slug>` on this site                                            |
| Product page     | **Did not exist**                                                    | **Exists** — `/our_work/:slug`, 19 slugs × 3 locales, 87 prerendered routes                |
| Copy per product | name, description, image, icon, external URL                         | name, category, hook, summary, 4 highlights, advantage, value, about — in `en`, `hy`, `ru` |

**This materially changes the task.** Roughly 70 % of what the brief asks to design already exists and is in production-quality condition. The useful deliverable is therefore not a design for a page that has to be built from nothing, but an evidence-based gap analysis against what is there. That is what these three documents are.

Two further facts that the concept has to be built around, both established below:

1. **There are no screenshots of any product.** Per product there are exactly three images: one photograph and two generated abstract illustrations. §2 sets out the inventory.
2. **A flip card with a hover-revealed back face existed in this component and was deliberately removed**, because its content was reachable by pointer only. §3 records why, because the brief asks for it back.

---

## 1. How a product is described today

Each product carries eight copy fields in three languages, plus four structural facts. The fields are not interchangeable — they were written to different budgets and for different places, which is what makes a card/back/page split possible without writing anything new:

| Field        | Budget                   | Written for                                  |
| ------------ | ------------------------ | -------------------------------------------- |
| `name`       | —                        | Card title, page `h1`                        |
| `category`   | —                        | Card subtitle, page eyebrow                  |
| `hook`       | ≤140 chars, one sentence | Card — the one line that has to earn a click |
| `summary`    | ≤170 chars               | Page "Product Experience"                    |
| `highlights` | exactly 4                | Page "Key Features"                          |
| `advantage`  | ≤130 chars               | Page "Advantage"                             |
| `value`      | —                        | Page "Business Value"                        |
| `about`      | ~600–900 chars           | Page "About"                                 |

Structural facts live in `PRODUCT_META`: `archetype`, `art` (illustration folder), `photo` (photograph), optional `url`, optional `platform`.

`product-content.spec.ts` enforces the budgets, exact id parity, four highlights each, all three locales, and **no authorship claims anywhere in the copy** — the header of `product.content.ts` states that several products credit other studios in their footers, so nothing in the portfolio claims authorship or ownership. **Any new copy written for this concept inherits that constraint.**

---

## 2. Visual asset inventory — the hard constraint

| Asset                               | Count                                 | Location                                                 | What it is                                                                        |
| ----------------------------------- | ------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Product photograph                  | **1 per product**, 19 total, 905.9 kB | `public/images/<name>.webp`                              | Real photographs and marketing imagery, committed in `f766248`                    |
| Generated illustration — main       | 1 per product, 172.8 kB               | `src/assets/images/products/product-NN/main-visual.webp` | Abstract composition, 1280×800, produced by `scripts/generate-product-images.mjs` |
| Generated illustration — experience | 1 per product, 121.6 kB               | `…/experience-visual.webp`                               | As above                                                                          |
| **Screenshots of any product**      | **0**                                 | —                                                        | **None exist in the repository**                                                  |

The photographs are **not a uniform set**: they run from 480×334 to 800×853 — portrait, square and three different landscapes. The card normalises them with a fixed 16/10 box and `object-fit: cover`.

The illustrations carry a caption, in all three locales, on every figure that shows them:

> _"Illustration — an original composition, not a screenshot of the product."_

**Consequences for the brief, stated plainly:**

- §2.1 asks the card front to show **"several high-quality product images."** There is one photograph per product. A multi-image front cannot be built from current assets without mixing the photograph with the abstract illustrations, which is a different and weaker idea.
- §2.3 asks for a **"Visual Showcase — a gallery of product images and screenshots."** There is no gallery to build. Three images per product, two of which are abstract and captioned as such, is not a showcase.
- §2.3 asks for **"interface and user experience demonstrations using images."** The existing "Product Experience" section does this with an illustration, not an interface.

This is the single largest gap between the brief and the repository, and it is **an asset problem, not an engineering problem**. It is listed in §5 as the first thing requiring a decision.

---

## 3. The flip card already existed here, and was removed

The brief asks for a hover flip. The component had one. The history, from the files themselves:

- `src/styles/tokens/_motion.scss:8` still carries the duration token it used: `flip: 520ms`, commented _"A card flip has to read as a deliberate turn rather than a glitch."_
- The card's own doc comment (`project-card.ts`) records the removal and the reason.

The back face held the summary, the four highlights, a link to the detail route and a link to the live product. It was reachable two ways: hover on a pointer device, and a "Details" button for everyone else. **When the Details button was removed, hover became the only trigger** — which would have put all of that content out of reach of every keyboard and every touch device (WCAG 2.1.1, Keyboard). An earlier audit of the same component also measured the collapsed no-hover state leaving **~55 focusable controls across the nineteen cards present in the accessibility tree while off screen** (WCAG 2.4.3 and 1.3.2).

So the face was removed with the button, and its content now lives on `/our_work/:slug`, which the card title links to.

**This is not an argument against the brief's request.** The brief explicitly says _"Consider accessibility, keyboard interaction, and devices that do not support hover."_ It is an argument that the flip must be reintroduced with a non-hover trigger that is a peer of hover, not a fallback — and that the back face must leave the accessibility tree when it is not showing. `PRODUCTS_UX_UI_CONCEPT.md` §3 designs it that way, and `PRODUCTS_IMPLEMENTATION_ROADMAP.md` makes those two properties acceptance criteria rather than recommendations.

---

## 4. The nineteen products

Ordered as `PRODUCT_IDS` orders them, which is the order the grid renders. Every "functionality" line below is taken from the existing verified copy; nothing is inferred.

**Archetype spread:** storefront 7, app 3, configurator 3, corporate 2, lead-generation 2, trade 2. (Note: `product-meta.ts:4-9` claims "eleven of nineteen are storefronts" — that comment is stale, the count is seven.)

---

### 1. Draculai — Health & substance tracking · `app` · iOS · App Store

- **Purpose.** Put a searchable interface over FDA drug data and pair it with a private personal intake log.
- **Problem it solves.** Authoritative medical sources are hard to search, and what a person actually took is remembered rather than recorded.
- **Functionality.** FDA drug data lookup · intake log with timestamps, notes and quantities · collapsible dosage forms, ingredient lists and warnings · pagination built for datasets running to thousands of entries.
- **Advantage.** Seven releases between April and August 2025 — a shipping cadence most health apps never reach.
- **Business value.** Turns scattered medicine-cabinet knowledge into a private, searchable record the user controls.
- **Strongest demo material.** The App Store listing **declares that no data is collected** — an unusually strong position for a Medical-category app, and the most quotable fact in the portfolio.
- **Assets.** `medical.webp` (800×450) · `product-01` illustrations.

### 2. JDM West Coast — Automotive parts commerce · `configurator` · Shopify

- **Purpose.** Sell imported Japanese domestic-market drivetrains, where the hard problem is fitment rather than checkout.
- **Problem it solves.** Stock arrives as one-of-a-kind used units, and the buyer must know whether an engine fits their car before any commerce mechanic is relevant.
- **Functionality.** Search by make, model or part number · matching on year, make, model and displacement · nine manufacturer catalogues · engines, transmissions, front clips, interior and exterior components, each with its own single-unit stock state.
- **Advantage.** Every listing is its own inventory problem.
- **Business value.** Buyers self-serve a fitment question that would otherwise mean a phone call per order.
- **Strongest demo material.** The fitment search — the clearest example in the portfolio of commerce shaped by a domain constraint.
- **Assets.** `car.webp` (800×533, 108.0 kB — the largest file in the set) · `product-02` illustrations.

### 3. Hydrant — Functional beverage commerce · `storefront` · Shopify

- **Purpose.** Direct-to-consumer commerce for an electrolyte drink brand across four product lines.
- **Problem it solves.** Subscription commerce fails where the customer wants to change an order and has to email somebody.
- **Functionality.** Pick-any-four bundle builder across Hydrate, Energy, Sleep and Immunity · subscribe and save 20 % · self-service skip, pause and cancel handled without intervention.
- **Advantage.** 4.8 / 5 from more than 12,000 verified reviews — the largest audience in the portfolio.
- **Business value.** Customer-run subscription control removes the support load recurring orders usually create.
- **Strongest demo material.** The review corpus is the scale at which merchandising stops being guesswork — a credible, checkable number.
- **Assets.** `juce.webp` (756×600) · `product-03` illustrations.

### 4. Mertel — Experiential marketing agency · `corporate` · WordPress

- **Purpose.** One platform presenting a live-events agency across Bratislava, Vienna, Prague, London and Riyadh.
- **Problem it solves.** The same organisation must present differently per city without fragmenting into five disconnected websites.
- **Functionality.** Region switcher **separate from** a Slovak/English language switch · case studies with project counts across six service categories · franchise partner enquiry on the same structure.
- **Advantage.** Regional and language switching on one content model.
- **Business value.** A new city is an editorial act rather than an engineering one.
- **Strongest demo material.** Named work — the **Czech Pavilion at EXPO 2025 Osaka** and the **UEFA Conference League Final 2023**. The most recognisable references in the portfolio.
- **Assets.** `mertal.webp` (800×420) · `product-04` illustrations.

### 5. Skinome — Personalised skincare commerce · `storefront` · Shopify

- **Purpose.** Commerce for a Swedish research-led skincare brand, driven by a diagnostic test rather than a catalogue.
- **Problem it solves.** The customer does not know what they need, and a catalogue cannot tell them.
- **Functionality.** Guided skin test first · result produces a routine, recommended products and a ready-made kit · subscription at 20 % off · booked specialist consultations · Skin Academy editorial · membership area.
- **Advantage.** The most complete funnel in the portfolio: test → recommendation → kit → subscription → consultation → membership.
- **Business value.** Personalisation replaces the shelf-browsing that makes skincare hard to buy online.
- **Strongest demo material.** The inverted order — diagnosis before catalogue. Each step is conventional; the **sequence** is the product.
- **Assets.** `skay.webp` (800×533) · `product-05` illustrations.

### 6. Mastercraft Jewelers — Luxury jewellery commerce · `configurator` · Shopify

- **Purpose.** Commerce for a Michigan jeweller and Swiss watch dealer.
- **Problem it solves.** Nobody buys an engagement ring from a product grid — the decision takes several sessions, usually involves two people, and typically ends in a shop.
- **Functionality.** Simultaneous filtering on five axes (style, shape, metal, designer, price) · build-your-ring flow tracking setting, diamond and a **running total** · Swiss watches and fashion jewellery under the same filters · in-store appointment booking offered throughout.
- **Advantage.** Configurator and appointment flow in one journey — selected online, finished in the showroom.
- **Business value.** High-consideration purchases get a guided path instead of a grid.
- **Strongest demo material.** The running-total configurator.
- **Assets.** `master.webp` (800×622) — **the photograph is the Mastercraft Jewelers storefront with the name legible on the building**, one of only two independently verifiable asset–product pairings in the set · `product-06` illustrations.

### 7. Robert Irwin Jewelers — Fine jewellery retail · `configurator` · Shopify

- **Purpose.** Commerce for a five-showroom Memphis jeweller.
- **Problem it solves.** Multi-location retail needs the customer to know not only what is available but _where_ — and the business needs the visit as much as the order.
- **Functionality.** Engagement and bridal catalogue with shape, style and metal filters · Design Your Own custom flow · five-showroom locator with per-location appointment booking · financing presented as first-class, not a checkout afterthought · sale pricing alongside regular.
- **Advantage.** Multi-location retail and online configuration in one funnel.
- **Business value.** Browsing converts into a booked showroom visit instead of an abandoned cart.
- **Strongest demo material.** Per-location booking — filtered catalogue to a specific store on a specific day.
- **Assets.** `je.webp` (640×524 — the second-smallest file) · `product-07` illustrations.

### 8. Casamance — Interiors, trade and retail · `trade` · _platform not recorded_

- **Purpose.** An interiors platform for a French publisher of fabrics, wallpapers and wallcoverings.
- **Problem it solves.** Furnishing fabric is _specified_ by architects and decorators and _bought_ by consumers — two audiences needing the same catalogue on different terms.
- **Functionality.** Professional trade login alongside ordinary accounts and wishlists, with pricing and permissions attached to the account · fabrics, wallpapers, wallpanels, wallcoverings, accessories · browse by family, colour, design style · contract-projects route for specification work · English and French editions.
- **Advantage.** Two audiences on one catalogue with different permissions.
- **Business value.** Professional buyers get trade terms without a second website to maintain.
- **Strongest demo material.** The permission-tiered catalogue.
- **Assets.** `interier.webp` (800×437) · `product-08` illustrations.

### 9. Sell Me Watch — Valuation & lead generation · `lead-generation` · Webflow

- **Purpose.** A Los Angeles watch buyer's platform where the visitor wants to **sell**, not buy.
- **Problem it solves.** Every commerce assumption inverts: there is no cart on the critical path, the product is an offer, and the conversion event is a conversation.
- **Functionality.** Get-a-quote request flow · showroom appointment booking · click-to-call and a showroom map · what-we-buy taxonomy (Rolex, Patek Philippe, Audemars Piguet, Cartier) setting expectations before the enquiry · account area with orders and wishlist · paginated editorial.
- **Advantage.** Optimised for the enquiry rather than the cart.
- **Business value.** High-value, trust-sensitive transactions begin with a qualified lead.
- **Strongest demo material.** The inversion itself — the clearest "we understood the business, not just the brief" story here.
- **Assets.** `watch.webp` (800×800, the only square) · `product-09` illustrations.

### 10. Klinik Europe — Medical tourism · `lead-generation` · _platform not recorded_

- **Purpose.** Market surgical and aesthetic packages in Antalya to international patients.
- **Problem it solves.** Choosing surgery abroad is among the highest-anxiety decisions a website can support.
- **Functionality.** Multi-step booking — **procedure first, date reserved second, contact details last**, so commitment grows gradually · free online consultation as a lower-stakes entry · WhatsApp for patients who would rather message · named treatment packages · testimonial wall.
- **Advantage.** Trust before price, and the flow is built that way round.
- **Business value.** Enquiries arrive with procedure and date already chosen.
- **Strongest demo material.** The staged-commitment form — a genuine UX decision with a stated rationale.
- **Assets.** `klinik.webp` (800×463, 17.2 kB — the smallest file) · `product-10` illustrations.

### 11. Libra Analytics — Professional services · `corporate` · Webflow

- **Purpose.** A corporate platform for a labour, employment and data analytics consultancy in litigation support and expert testimony.
- **Problem it solves.** A law firm retains **named individuals** whose findings may be tested in court — the credential is the conversion.
- **Functionality.** Service lines specific enough to recognise a matter in (wage and hour litigation, pay equity analysis, business data analytics) · partner profiles carrying admissibility credentials · consultation booking beside a short contact form · client statistics and testimonial · news and insights stream.
- **Advantage.** Structured around people rather than services.
- **Business value.** Prospects assess expertise before contact, which filters the enquiries that arrive.
- **Strongest demo material.** Partner profiles as the conversion surface.
- **Assets.** `power.webp` (800×569) · `product-11` illustrations.

### 12. Remake Templates — Digital goods commerce · `storefront` · Shopify

- **Purpose.** Sell producer templates, presets, MIDI and samples with no physical fulfilment.
- **Problem it solves.** Digital-only removes stock, shipping and fulfilment windows, and replaces them with discovery and licensing.
- **Functionality.** Instant digital delivery · genre-based browsing (Afro House, Deep House) so material is found by sound rather than title · search · sale and regular pricing side by side · currency selector · subscriber area alongside one-off purchase.
- **Advantage.** No shipping, no stock, worldwide pricing.
- **Business value.** Margin and reach physical commerce cannot match.
- **Strongest demo material.** Genre-first discovery.
- **Assets.** `muzic.webp` (800×450) · `product-12` illustrations.
- **Note.** `product-meta.ts:123` records that the original address `abletonremakes.com` now 301-redirects to `remaketemplates.com`.

### 13. Got Matcha — Specialty tea commerce · `storefront` · Shopify

- **Purpose.** International direct-to-consumer commerce for a premium matcha brand.
- **Problem it solves.** A small audience per country and a substantial one across many, making international selling a requirement rather than an ambition.
- **Functionality.** Country and currency selector so prices are actionable without conversion · ceremonial grades, flavoured blends, mushroom-matcha, a protein meal, teaware · collections and search · collapsible FAQ for grade and preparation questions · subscribe-and-save · multi-jar gift bundles.
- **Advantage.** Multiple countries without a storefront per market.
- **Business value.** A specialty brand reaches an international audience from one catalogue.
- **Strongest demo material.** The currency/country selector paired with gifting.
- **Assets.** `got.webp` (800×600) · `product-13` illustrations.

### 14. LAV — Food & beverage commerce · `storefront` · Shopify

- **Purpose.** Commerce for a shelf-stable Armenian-inspired dressing brand.
- **Problem it solves.** A low-price, high-repeat product where the first order is the hard one and basket size is the thing worth engineering.
- **Functionality.** Build-a-bundle rewarding three or more at once · recipe content giving a reason to return that is not a discount email · reviews on the path rather than buried · wholesale and affiliate routes alongside direct sales.
- **Advantage.** Content and commerce on one path — the recipes are what sell the product.
- **Business value.** Average order value rises through bundling rather than discounting.
- **Strongest demo material.** 4.88 average rating, and the bundle mechanic.
- **Assets.** `lave.webp` (800×450) · `product-14` illustrations.
- **Note.** `dresslav.com` sells salad dressings, not apparel — a name that invites the wrong assumption.

### 15. ROAR Organic — Organic beverage commerce · `storefront` · Shopify · **no outbound link**

- **Purpose.** Direct-to-consumer commerce for an organic electrolyte brand that also sits on supermarket shelves.
- **Problem it solves.** Two jobs pulling in opposite directions — order now, or find the nearest shop.
- **Functionality.** Guided find-your-flavour carousel rather than a grid · variety and multi-count packs for the follow-on order · subscribe and save 15 % · retailer store locator.
- **Advantage.** Omnichannel by design: sells direct and routes customers to shelves.
- **Business value.** One platform serves both the direct channel and retail distribution.
- **Strongest demo material.** Flavour discovery as the first decision.
- **Assets.** `organic.webp` (800×717) · `product-15` illustrations.
- **Constraint.** `product-meta.ts:142-143` records that the only address on file is a `*.myshopify.com` default host whose catalogue reads "sold out", so **the card deliberately carries no link.** Any design that assumes every card has a live destination is wrong.

### 16. Zadeh MD Skin — Medical-grade skincare · `storefront` · Shopify

- **Purpose.** Commerce for a medical-grade skincare line founded by a board-certified surgeon.
- **Problem it solves.** Competing with cheaper cosmetics on one side and more credible clinical treatment on the other — position depends entirely on whose name is on it.
- **Functionality.** Practitioner credential kept front and centre · collections and category menus · search · product pages with price and review counts · cart with running item count · newsletter capture. The catalogue mechanics are _deliberately plain_ so nothing distracts from the credential.
- **Advantage.** Clinical authorship carries the catalogue.
- **Business value.** Trust transfers from practitioner to product.
- **Strongest demo material.** Restraint as a design decision — worth stating explicitly, because it reads as "simple" otherwise.
- **Assets.** `zadeh.webp` (480×334 — **the lowest-resolution asset in the set**; its product labels read "ZADEH MD SKIN", the second independently verifiable pairing) · `product-16` illustrations.

### 17. Tai Ping — Grocery retail & wholesale · `trade` · _platform not recorded_

- **Purpose.** A retail platform for an Asian supermarket chain and food importer in Auckland.
- **Problem it solves.** Almost nobody buys fresh produce online in this category. What shoppers need is which store, which department, and what is on promotion this week — an editorial operation, not a catalogue.
- **Functionality.** Department routes (produce, seafood, butchery, Hong Kong BBQ) · weekly promotions page · nine-store locator · FAQ and contact · Popular Brands acting as a search substitute for shoppers after one specific import.
- **Advantage.** Multi-store retail operations rather than a storefront — locations and promotions change weekly.
- **Business value.** One platform keeps nine stores current for shoppers and trade buyers alike.
- **Strongest demo material.** Correctly identifying that this is _not_ e-commerce.
- **Assets.** `market.webp` (800×453, 95.8 kB) · `product-17` illustrations.

### 18. Mezave — Community food sharing · `app` · Android · Google Play

- **Purpose.** Connect people with surplus food to people who need it, in Hebrew, for a local audience.
- **Problem it solves.** Food reaches people through neighbours more often than through institutions; the limiting factor is coordination, not supply.
- **Functionality.** Community food listings · Hebrew-language interface · published on Google Play · social support focus.
- **Advantage.** The only non-commercial product in the portfolio — built for reach rather than revenue.
- **Business value.** Technology applied to food insecurity at neighbourhood scale.
- **Strongest demo material.** The measure of success is whether a household eats, not whether an order converts. Engineering to that goal under the same quality expectations as paid work is its own story — **and the strongest trust signal on the page.**
- **Assets.** `meal.webp` (800×853 — **the only portrait image**, which loses ≈41 % of its height to a centred 16/10 crop) · `product-18` illustrations.

### 19. Connected Vehicle App — Connected vehicle software · `app` · _platform not recorded_ · **no outbound link**

- **Purpose.** Bring remote control, GPS tracking, security alerts and service history into one interface for premium vehicle owners.
- **Problem it solves.** The other side of the interface is a car rather than a database — latency matters, connectivity is intermittent, and a failed command has consequences a failed page load does not.
- **Functionality.** Remote vehicle control · GPS tracking and real-time monitoring · security alerting · maintenance records.
- **Advantage.** Device integration and live telemetry — the most hardware-adjacent product in the portfolio.
- **Business value.** Owners get one place for things that previously meant a call to the dealer.
- **Assets.** `infiniti.webp` (800×450) · `product-19` illustrations.
- **⚠ Evidence constraint, recorded in the copy itself.** _"Of all nineteen products this is the one whose published presence could not be established, so what is described here is its intended scope rather than a feature set verified against a live listing."_ `product-meta.ts:166-167` adds that this card previously linked to Sell Me Watch's site — a copy-paste error in the original data. **This product's functionality is the one thing in this document that is not verified**, and any presentation of it must stay at the level the copy already sets.

---

## 5. Missing information — what must be resolved before building

Ordered by how much it blocks the brief.

### 5.1 — Screenshots and interface imagery **(blocks §2.1 and §2.3 of the brief)**

**What is missing:** any image of any product's actual interface. The repository holds one photograph and two abstract illustrations per product, and the illustrations are captioned as compositions rather than screenshots in all three locales.

**What the brief needs it for:** "several high-quality product images" on the card front; "interface and user experience demonstrations using images"; a "Visual Showcase" gallery.

**Why it cannot be worked around:** generating more illustrations does not produce interface imagery, and presenting an illustration as a screenshot would contradict the caption already written and the no-authorship-claims rule the copy is held to.

**Decision required:** either (a) capture screenshots from the 17 products with live URLs — which raises a permission question, since several of these products credit other studios, or (b) accept a one-image front and design the showcase out of the concept. **§2 of the UX/UI concept assumes (b) and marks every element that (a) would unlock.**

### 5.2 — Verified technical facts **(blocks the brief's "Technology & Architecture" section)**

**What exists:** one field, `platform`, with values `Shopify` (9), `Webflow` (2), `WordPress` (1), `iOS · App Store` (1), `Android · Google Play` (1). **Four products have no platform recorded:** Casamance, Klinik Europe, Tai Ping, Connected Vehicle App.

**What does not exist:** any framework, language, hosting, integration, performance or architecture fact for any product.

**Why it cannot be worked around:** `product-content.spec.ts` forbids authorship claims, and inventing a stack would be exactly the kind of invention rule 5 of the brief prohibits.

**Decision required:** either supply verified technical facts per product, or **drop the Technology & Architecture section** and let `platform` appear as a single labelled fact in the hero, which is what the page does today. The concept recommends the latter until facts exist.

### 5.3 — Connected Vehicle App's published presence

Its feature list is intended scope, not verified capability, and it has no outbound link. **Needs:** either a public listing to link and verify against, or an explicit decision to present it at the current level of specificity.

### 5.4 — ROAR Organic's destination

No honest link exists. **Needs:** a working storefront URL, or confirmation that a card with no outbound link is acceptable indefinitely (it is handled correctly today).

### 5.5 — Permission to screenshot third-party products

`product.content.ts:1-14` states that several of these products credit other studios in their footers. **Before any screenshot is captured or published, someone must confirm what may be shown.** This is a commercial question, not a technical one, and it gates 5.1(a) entirely.

### 5.6 — Crop intent for the three tall photographs

`meal.webp` (0.94), `organic.webp` (1.12) and `master.webp` (1.29) lose 41 %, 30 % and 19 % of their height respectively to a centred 16/10 crop. **Needs:** someone who knows the work to confirm the subject survives centring, or to specify a focal point per image.

### 5.7 — Lower-resolution assets

`zadeh.webp` (480×334) and `je.webp` (640×524) are rendered into a 411 px-wide card on a three-column desktop grid, so they are at or below 1:1 on a standard display and upscaled on a high-DPI one. **Needs:** higher-resolution originals if they exist. They must not be interpolated upward.

---

## 6. What this analysis establishes for the next two documents

1. **The copy is ready.** Eight fields per product in three languages, budget-enforced, already split along exactly the card / back-face / page lines the brief proposes. **No new product copy needs to be written** for the concept — which also means none needs to be invented.
2. **The page is largely built.** Six of the brief's eight proposed sections exist. Two do not, and both are blocked on assets rather than engineering.
3. **The imagery is the constraint.** Everything the brief asks for that cannot be delivered today traces back to §5.1.
4. **The flip must be rebuilt differently.** It existed, and it was removed for a reason that will recur unless the non-hover path is designed as a peer rather than a fallback.
5. **Two products are deliberately link-less.** Any card or page design must render correctly without an outbound destination.
