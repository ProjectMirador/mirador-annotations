import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import DeleteIcon from '@material-ui/icons/Delete';
import flatten from 'lodash/flatten';
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
          <MiradorMenuButton
            aria-label="Delete"
            onClick={this.handleDelete}
          >
            <DeleteIcon />
          </MiradorMenuButton>
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
};

CanvasListItem.contextType = AnnotationActionsContext;

export default CanvasListItem;
