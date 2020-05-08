
import mirador from 'mirador/dist/es/src/index';
import OSDReferencesPlugin from 'mirador/dist/es/src/plugins/OSDReferences';
import { miradorAnnotationPlugin, externalStorageAnnotationPlugin, canvasAnnotationsPlugin } from '../../src';
import LocalStorageAdapter from '../../src/LocalStorageAdapter';

const config = {
  annotation: {
    adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
  },
  id: 'demo',
  window: {
    defaultSideBarPanel: 'annotations',
    sideBarOpenByDefault: true,
  },
  windows: [{
    loadedManifest: 'https://iiif.harvardartmuseums.org/manifests/object/299843',
  }],
};

mirador.viewer(config, [
  OSDReferencesPlugin,
  miradorAnnotationPlugin,
  canvasAnnotationsPlugin,
  externalStorageAnnotationPlugin,
]);
