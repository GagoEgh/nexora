import { intlayerEsbuildPlugin } from 'angular-intlayer/esbuild';

export default (_options: unknown, target?: { target?: string }) => [
  intlayerEsbuildPlugin({ watch: target?.target === 'serve' }),
];
