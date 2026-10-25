/**
 * Architectural rules for src/app, enforced by `npm run lint`.
 *
 * The layering is core <- shared <- layout <- pages: a module may depend on the layers
 * to its left, never to its right. `app.routes.ts` and `app.config.ts` sit above all of
 * them as the composition root.
 *
 * `tsPreCompilationDeps` is deliberately on. Without it dependency-cruiser only sees
 * runtime imports, and the cycles this codebase has actually hit were type-only.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'A cycle here is usually a child deriving its type from its parent while the parent ' +
        'instantiates the child. Derive the type from the dictionary instead.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'core-is-independent',
      severity: 'error',
      comment: 'core/ is the bottom layer: it must not know about shared, layout or pages.',
      from: { path: '^src/app/core/', pathNot: '\\.spec\\.ts$' },
      to: { path: '^src/app/(shared|layout|pages)/' },
    },
    {
      name: 'shared-is-independent',
      severity: 'error',
      comment:
        'shared/ui components are reused across pages, so they may only depend on core. ' +
        'Needing page data means the component should take an input instead.',
      from: { path: '^src/app/shared/', pathNot: '\\.spec\\.ts$' },
      to: { path: '^src/app/(layout|pages)/' },
    },
    {
      name: 'layout-does-not-know-pages',
      severity: 'error',
      comment: 'The header and footer render on every route; they must not import a page.',
      from: { path: '^src/app/layout/', pathNot: '\\.spec\\.ts$' },
      to: { path: '^src/app/pages/' },
    },
    {
      name: 'pages-do-not-cross-import',
      severity: 'error',
      comment:
        'One page must not reach into another. Move anything genuinely shared into shared/ ' +
        'or core/. Specs are exempt: ai-agent.spec.ts asserts its cards still match the ' +
        'services catalogue, which is the point of that test.',
      from: { path: '^src/app/pages/([^/]+)/', pathNot: '\\.spec\\.ts$' },
      to: { path: '^src/app/pages/([^/]+)/', pathNot: '^src/app/pages/$1/' },
    },
    {
      name: 'route-table-is-composition-only',
      severity: 'error',
      comment:
        'app.routes.ts is the composition root and lazily imports every page. A feature that ' +
        'needs a path should import core/routing/paths.ts, not the route table.',
      from: {
        pathNot: '^src/app/app\\.(config|routes)\\.ts$|\\.spec\\.ts$',
      },
      to: { path: '^src/app/app\\.routes\\.ts$' },
    },
    {
      name: 'content-files-are-leaves',
      severity: 'error',
      comment:
        'A *.content.ts file holds copy. It may depend on core types, but importing a ' +
        'component pulls presentation into the dictionary and risks a cycle.',
      from: { path: '\\.content\\.ts$' },
      to: {
        path: '^src/app/(pages|layout|shared)/.+\\.ts$',
        pathNot: '\\.content\\.ts$|/service-category\\.ts$|/what-we-build-illustration\\.ts$',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: '^src/app/',
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
