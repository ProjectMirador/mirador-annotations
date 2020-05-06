import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { v4 as uuid } from 'uuid';

/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = { annoBody: '' };

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
  }

  /** */
  submitForm(e) {
    e.preventDefault();
    const { canvases, receiveAnnotation, config } = this.props;
    const { annoBody } = this.state;

    canvases.forEach((canvas) => {
      const localStorageAdapter = config.annotation.adapter(canvas.id);
      const anno = {
        body: {
          language: 'en',
          type: 'TextualBody',
          value: annoBody,
        },
        id: `https://example.org/iiif/book1/page/manifest/${uuid()}`,
        motivation: 'commenting',
        target: `${canvas.id}#xywh=200,500,1000,1000`,
        type: 'Annotation',
      };
      const newAnnoPage = localStorageAdapter.create(anno);
      receiveAnnotation(canvas.id, localStorageAdapter.annotationPageId, newAnnoPage);
    });
  }

  /** */
  updateBody(e) {
    this.setState({ annoBody: e.target.value });
  }

  /** */
  render() {
    const { annoBody } = this.state;

    return (
      <div>
        <form onSubmit={this.submitForm}>
          <TextField
            multiline
            rows={6}
            value={annoBody}
            onChange={this.updateBody}
          />
          <Button>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </form>
      </div>
    );
  }
}

AnnotationCreation.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  receiveAnnotation: PropTypes.func.isRequired,
};

AnnotationCreation.defaultProps = {
  canvases: [],
};


export default AnnotationCreation;
