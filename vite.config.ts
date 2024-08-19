import { defineConfig, UserConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import packageJson from './package.json';

/* Terminology: "dist-inline" and "dist-offline"
 *  The difference arises from whether scripts
 *  are included in the HTML (inline) or separate from the HTML (offline)
 */
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    base: './',
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.BUILD_NUMBER': process.env.CI_PIPELINE_IID || '99999',
    },
  };

  if (mode === 'inline') {
    return {
      ...commonConfig,
      base: './',
      build: {
        outDir: 'dist/dist-inline',
      },
      plugins: [preact(), viteSingleFile()],
    };
  }
  return {
    ...commonConfig,
    build: {
      outDir: 'dist/dist-offline',
    },
    plugins: [preact()],
  };
});
