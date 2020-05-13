import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as actions from 'mirador/dist/es/src/state/actions';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';
import AnnotationCreation from '../AnnotationCreation';

/** */
class MiradorAnnotation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.openCreateAnnotationCompanionWindow = this.openCreateAnnotationCompanionWindow.bind(this);
  }

  /** */
  openCreateAnnotationCompanionWindow(e) {
    const {
      addCompanionWindow, canvases, receiveAnnotation, config, targetProps,
    } = this.props;
    const { windowId } = targetProps;
    addCompanionWindow('custom', {
      children: (
        <AnnotationCreation
          canvases={canvases}
          receiveAnnotation={receiveAnnotation}
          config={config}
          windowId={windowId}
        />
      ),
      position: 'right',
      title: 'New annotation',
    });
  }

  /** */
  render() {
    const { TargetComponent, targetProps } = this.props;
    return (
      <div>
        <TargetComponent
          {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
        />
        <div>
          <MiradorMenuButton
            aria-label="Create new annotation"
            onClick={this.openCreateAnnotationCompanionWindow}
          >
            <AddBoxIcon />
          </MiradorMenuButton>
        </div>
      </div>
    );
  }
}

MiradorAnnotation.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
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

MiradorAnnotation.defaultProps = {
  canvases: [],
};

/** */
const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.targetProps.windowId, { content, ...additionalProps }),
  ),
  receiveAnnotation: (targetId, id, annotation) => dispatch(
    actions.receiveAnnotation(targetId, id, annotation),
  ),
});

/** */
function mapStateToProps(state, { targetProps }) {
  return {
    canvases: getVisibleCanvases(state, { windowId: targetProps.windowId }),
    config: state.config,
  };
}


export default {
  component: MiradorAnnotation,
  mapDispatchToProps,
  mapStateToProps,
  mode: 'wrap',
  target: 'AnnotationSettings',
};
