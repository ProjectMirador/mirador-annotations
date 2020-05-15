import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import flatten from 'lodash/flatten';
import AnnotationActionsContext from './AnnotationActionsContext';
import AnnotationCreation from './AnnotationCreation';

/** */
class CanvasListItem extends Component {
  /** */
  constructor(props) {
    super(props);

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
    return (
      <li
        {...this.props} // eslint-disable-line react/jsx-props-no-spreading
      >
        {children}
        {this.editable() && (
          <div>
            <MiradorMenuButton
              aria-label="Edit"
              onClick={this.handleEdit}
            >
              <EditIcon />
            </MiradorMenuButton>
            <MiradorMenuButton
              aria-label="Delete"
              onClick={this.handleDelete}
            >
              <DeleteIcon />
            </MiradorMenuButton>
          </div>
        )}
      </li>
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
