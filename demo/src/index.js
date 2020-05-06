
import mirador from 'mirador/dist/es/src/index';

import { miradorAnnotationPlugin } from '../../src';

const config = {
  id: 'demo',
  windows: [{
    loadedManifest: 'https://purl.stanford.edu/sn904cj3429/iiif/manifest',
  }],
};

const miradorInstance = mirador.viewer(config, [
  miradorAnnotationPlugin,
]);
