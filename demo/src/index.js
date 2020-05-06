
import mirador from 'mirador/dist/es/src/index';

import { miradorAnnotationPlugin, externalStorageAnnotationPlugin } from '../../src';
import LocalStorageAdapter from '../../src/LocalStorageAdapter';

const config = {
  annotation: {
    adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
  },
  id: 'demo',
  windows: [{
    loadedManifest: 'https://iiif.harvardartmuseums.org/manifests/object/299843',
  }],
};

mirador.viewer(config, [
  miradorAnnotationPlugin,
  externalStorageAnnotationPlugin,
]);
