import miradorAnnotationPlugin from './plugins/miradorAnnotationPlugin';
import externalStorageAnnotationPlugin from './plugins/externalStorageAnnotationPlugin';
import canvasAnnotationsPlugin from './plugins/canvasAnnotationsPlugin';
import annotationCreationCompanionWindow from './plugins/annotationCreationCompanionWindow';
import windowSideBarButtonsPlugin from './plugins/windowSideBarButtonsPlugin';

export {
  miradorAnnotationPlugin, externalStorageAnnotationPlugin,
  canvasAnnotationsPlugin, annotationCreationCompanionWindow,
  windowSideBarButtonsPlugin,
};

export default [
  miradorAnnotationPlugin,
  externalStorageAnnotationPlugin,
  canvasAnnotationsPlugin,
  annotationCreationCompanionWindow,
  windowSideBarButtonsPlugin,
];
