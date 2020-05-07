import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AnnotationActionsContext from './AnnotationActionsContext';

/** */
class CanvasListItem extends Component {
  /** */
  constructor(props) {
    super(props);

    this.handleDelete = this.handleDelete.bind(this);
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
  render() {
    const { children } = this.props;
    return (
      <li
        {...this.props} // eslint-disable-line react/jsx-props-no-spreading
      >
        {children}
        <MiradorMenuButton
          aria-label="Delete"
          onClick={this.handleDelete}
        >
          <DeleteIcon />
        </MiradorMenuButton>
      </li>
    );
  }
}

CanvasListItem.contextType = AnnotationActionsContext;

export default CanvasListItem;
