import * as actions from 'mirador/dist/es/src/state/actions';
import { getCompanionWindow } from 'mirador/dist/es/src/state/selectors/companionWindows';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';
import AnnotationCreation from '../AnnotationCreation';

/** */
const mapDispatchToProps = (dispatch, { id, windowId }) => ({
  closeCompanionWindow: () => dispatch(
    actions.removeCompanionWindow(windowId, id),
  ),
  receiveAnnotation: (targetId, annoId, annotation) => dispatch(
    actions.receiveAnnotation(targetId, annoId, annotation),
  ),
});

/** */
function mapStateToProps(state, { id: companionWindowId, windowId }) {
  const { annotationid } = getCompanionWindow(state, { companionWindowId, windowId });
  const canvases = getVisibleCanvases(state, { windowId });

  let annotation;
  canvases.forEach((canvas) => {
    const annotationsOnCanvas = state.annotations[canvas.id];
    Object.values(annotationsOnCanvas || {}).forEach((value, i) => {
      if (value.json && value.json.items) {
        annotation = value.json.items.find((anno) => anno.id === annotationid);
      }
    });
  });

  return {
    annotation,
    canvases,
    config: state.config,
  };
}

export default {
  companionWindowKey: 'annotationCreation',
  component: AnnotationCreation,
  config: {
    annotation: {
      motivations: ['commenting', 'describing', 'identifying', 'tagging'],
    },
    translations: {
      en: {
        annotation_motivation_commenting: 'Commenting',
        annotation_motivation_describing: 'Describing',
        annotation_motivation_identifying: 'Identifying',
        annotation_motivation_tagging: 'Tagging',
      },
    },
  },
  mapDispatchToProps,
  mapStateToProps,
};
