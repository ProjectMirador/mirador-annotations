
import mirador from 'mirador';

import { miradorAnnotationPlugin } from '../../src'

const config = {
  id: 'demo',
  windows: [{
    loadedManifest: 'https://purl.stanford.edu/sn904cj3429/iiif/manifest'
  }]
}

const miradorInstance = mirador.viewer(config, [
  miradorAnnotationPlugin,
]);
