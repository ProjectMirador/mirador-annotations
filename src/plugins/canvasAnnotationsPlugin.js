import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';
import * as actions from 'mirador/dist/es/src/state/actions';
import CanvasListItem from '../CanvasListItem';
import AnnotationActionsContext from '../AnnotationActionsContext';

/** */
class CanvasAnnotationsWrapper extends Component {
  /** */
  render() {
    const {
      addCompanionWindow, canvases, config, receiveAnnotation, TargetComponent,
      targetProps, annotationsOnCanvases,
    } = this.props;
    const props = {
      ...targetProps,
      listContainerComponent: CanvasListItem,
    };
    return (
      <AnnotationActionsContext.Provider
        value={{
          addCompanionWindow,
          annotationsOnCanvases,
          canvases,
          config,
          receiveAnnotation,
          storageAdapter: config.annotation.adapter,
          windowId: targetProps.windowId,
        }}
      >
        <TargetComponent
          {...props} // eslint-disable-line react/jsx-props-no-spreading
        />
      </AnnotationActionsContext.Provider>
    );
  }
}

CanvasAnnotationsWrapper.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
  annotationsOnCanvases: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  receiveAnnotation: PropTypes.func.isRequired,
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

CanvasAnnotationsWrapper.defaultProps = {
  annotationsOnCanvases: {},
  canvases: [],
};

/** */
function mapStateToProps(state, { targetProps }) {
  const canvases = getVisibleCanvases(state, { windowId: targetProps.windowId });
  const annotationsOnCanvases = {};
  canvases.forEach((canvas) => {
    const anno = state.annotations[canvas.id];
    if (anno) {
      annotationsOnCanvases[canvas.id] = anno;
    }
  });
  return {
    annotationsOnCanvases,
    canvases,
    config: state.config,
  };
}

/** */
const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.targetProps.windowId, { content, ...additionalProps }),
  ),
  receiveAnnotation: (targetId, id, annotation) => dispatch(
    actions.receiveAnnotation(targetId, id, annotation),
  ),
});


export default {
  component: CanvasAnnotationsWrapper,
  mapDispatchToProps,
  mapStateToProps,
  mode: 'wrap',
  target: 'CanvasAnnotations',
};
