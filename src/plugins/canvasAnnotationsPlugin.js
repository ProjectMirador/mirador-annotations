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
    const { TargetComponent, targetProps } = this.props;
    const props = {
      ...targetProps,
      listContainerComponent: CanvasListItem,
    };
    return (
      <AnnotationActionsContext.Provider
        value={{
          canvases: this.props.canvases,
          receiveAnnotation: this.props.receiveAnnotation,
          storageAdapter: this.props.config.annotation.adapter
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
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

/** */
function mapStateToProps(state, { targetProps }) {
  return {
    canvases: getVisibleCanvases(state, { windowId: targetProps.windowId }),
    config: state.config,
  };
}

/** */
const mapDispatchToProps = (dispatch, props) => ({
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
