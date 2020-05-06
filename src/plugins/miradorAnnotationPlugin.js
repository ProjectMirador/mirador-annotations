import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as actions from 'mirador/dist/es/src/state/actions';
import Button from '@material-ui/core/Button';
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
    const { addCompanionWindow } = this.props;
    addCompanionWindow('custom', {
      children: (
        <AnnotationCreation />
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
          <Button variant="contained" color="primary" size="small" onClick={this.openCreateAnnotationCompanionWindow}>
            Create New
          </Button>
        </div>
      </div>
    );
  }
}

MiradorAnnotation.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
  TargetComponent: PropTypes.node.isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

/** */
const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.targetProps.windowId, { content, ...additionalProps }),
  ),
});

export default {
  component: MiradorAnnotation,
  mapDispatchToProps,
  mode: 'wrap',
  target: 'AnnotationSettings',
};
