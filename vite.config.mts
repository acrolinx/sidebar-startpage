import { defineConfig, UserConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { removeCrossorigin, removeModule } from './vite-plugin-remove-attributes';

/* Terminology: "dist-inline" and "dist-offline"
 *  The difference arises from whether scripts
 *  are included in the HTML (inline) or separate from the HTML (offline)
 */
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    base: './',
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
    plugins: [preact(), removeCrossorigin(), removeModule()],
  };
});
