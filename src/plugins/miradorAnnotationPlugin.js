import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as actions from 'mirador/dist/es/src/state/actions';
import AddBoxIcon from '@material-ui/icons/AddBox';
import GetAppIcon from '@material-ui/icons/GetApp';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';
import { AnnotationDownloadDialog } from '../AnnotationDownloadDialog';

/** */
class MiradorAnnotation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      annotationDownloadDialogOpen: false,
    };
    this.openCreateAnnotationCompanionWindow = this.openCreateAnnotationCompanionWindow.bind(this);
    this.toggleCanvasDownloadDialog = this.toggleCanvasDownloadDialog.bind(this);
  }

  /** */
  openCreateAnnotationCompanionWindow(e) {
    const {
      addCompanionWindow,
    } = this.props;

    addCompanionWindow('annotationCreation', {
      position: 'right',
    });
  }

  toggleCanvasDownloadDialog(e) {
    const newState = {
      annotationDownloadDialogOpen: !this.state.annotationDownloadDialogOpen,
    }
    this.setState(newState);
  }

  /** */
  render() {
    const { canvases, config, TargetComponent, targetProps } = this.props;
    const showAnnotationDownloadDialog = config.annotation && config.annotation.downloadCanvasAnnotations;
    return (
      <div>
        <TargetComponent
          {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
        />
        <MiradorMenuButton
          aria-label="Create new annotation"
          onClick={this.openCreateAnnotationCompanionWindow}
          size="small"
        >
          <AddBoxIcon />
        </MiradorMenuButton>
        { showAnnotationDownloadDialog && (
          <MiradorMenuButton
            aria-label="Download annotation page for canvas"
            onClick={this.toggleCanvasDownloadDialog}
            size="small"
          >
            <GetAppIcon />
          </MiradorMenuButton>
        )}
        { showAnnotationDownloadDialog && (
          <AnnotationDownloadDialog
            canvases={canvases}
            config={config}
            handleClose={this.toggleCanvasDownloadDialog}
            open={this.state.annotationDownloadDialogOpen}
          />
        )}
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
      downloadCanvasAnnotations: PropTypes.bool,
    }),
  }),
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

/** */
const mapDispatchToProps = (dispatch, props) => ({
  addCompanionWindow: (content, additionalProps) => dispatch(
    actions.addCompanionWindow(props.targetProps.windowId, { content, ...additionalProps }),
  ),
});

const mapStateToProps = function mapStateToProps(state, { targetProps: { windowId } }) {
  return {
    canvases: getVisibleCanvases(state, { windowId }),
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
