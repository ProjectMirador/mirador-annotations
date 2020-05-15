import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import flatten from 'lodash/flatten';
import AnnotationActionsContext from './AnnotationActionsContext';
import AnnotationCreation from './AnnotationCreation';

/** */
class CanvasListItem extends Component {
  /** */
  constructor(props) {
    super(props);

    this.state = {
      isHovering: false,
    };

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  /** */
  handleDelete() {
    const { canvases, receiveAnnotation, storageAdapter } = this.context;
    const { annotationid } = this.props;
    canvases.forEach((canvas) => {
      const adapter = storageAdapter(canvas.id);
      const annoPage = adapter.delete(annotationid);
      receiveAnnotation(canvas.id, adapter.annotationPageId, annoPage);
    });
  }

  /** */
  handleEdit() {
    const {
      addCompanionWindow, canvases, config, receiveAnnotation, windowId,
    } = this.context;
    const { annotationid } = this.props;
    let annotation;
    canvases.some((canvas) => {
      const localStorageAdapter = config.annotation.adapter(canvas.id);
      annotation = localStorageAdapter.get(annotationid);
      return (annotation);
    });
    addCompanionWindow('custom', {
      children: (
        <AnnotationCreation
          annotation={annotation}
          canvases={canvases}
          receiveAnnotation={receiveAnnotation}
          config={config}
          windowId={windowId}
        />
      ),
      position: 'right',
      title: 'Edit annotation',
    });
  }

  /** */
  handleMouseHover() {
    this.setState((prevState) => ({
      isHovering: !prevState.isHovering,
    }));
  }

  /** */
  editable() {
    const { canvases, storageAdapter } = this.context;
    const { annotationid } = this.props;

    const annoIds = canvases.map((canvas) => {
      const adapter = storageAdapter(canvas.id);
      const annoPage = adapter.all();
      if (!annoPage) return [];
      return annoPage.items.map((item) => item.id);
    });
    return flatten(annoIds).includes(annotationid);
  }

  /** */
  render() {
    const { children } = this.props;
    const { isHovering } = this.state;
    return (
      <div
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
      >
        {isHovering && this.editable() && (
          <div
            style={{
              position: 'relative',
              top: -20,
              zIndex: 10000,
            }}
          >
            <ToggleButtonGroup
              aria-label="annotation tools"
              size="small"
              style={{
                position: 'absolute',
                right: 0,
              }}
            >
              <ToggleButton aria-label="Edit" onClick={this.handleEdit}>
                <EditIcon />
              </ToggleButton>
              <ToggleButton aria-label="Delete" onClick={this.handleDelete}>
                <DeleteIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        )}
        <li
          {...this.props} // eslint-disable-line react/jsx-props-no-spreading
        >
          {children}
        </li>
      </div>
    );
  }
}

CanvasListItem.propTypes = {
  annotationid: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

CanvasListItem.contextType = AnnotationActionsContext;

export default CanvasListItem;
