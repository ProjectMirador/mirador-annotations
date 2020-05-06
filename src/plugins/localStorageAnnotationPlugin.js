import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as actions from 'mirador/dist/es/src/state/actions';
import { getVisibleCanvases } from 'mirador/dist/es/src/state/selectors/canvases';
import isEqual from 'lodash/isEqual';

/** */
class LocalStorageAnnotation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.retrieveAnnotations = this.retrieveAnnotations.bind(this);
  }

  /** */
  componentDidMount() {
    const { canvases } = this.props;

    const anno = [{"@context":"http://iiif.io/api/presentation/2/context.json","@type":"oa:Annotation","motivation":["oa:commenting"],"resource":[{"@type":"dctypes:Text","format":"text/html","chars":"<p>stuff is here</p>"}],"on":[{"@type":"oa:SpecificResource","full":"https://purl.stanford.edu/sn904cj3429/iiif/canvas/sn904cj3429_1","selector":{"@type":"oa:Choice","default":{"@type":"oa:FragmentSelector","value":"xywh=2321,4718,1604,1435"},"item":{"@type":"oa:SvgSelector","value":"<svg xmlns='http://www.w3.org/2000/svg'><path xmlns=\"http://www.w3.org/2000/svg\" d=\"M2321.22749,4717.73662h802.13042v0h802.13042v717.39547v717.39547h-802.13042h-802.13042v-717.39547z\" data-paper-data=\"{&quot;strokeWidth&quot;:1,&quot;rotation&quot;:0,&quot;deleteIcon&quot;:null,&quot;rotationIcon&quot;:null,&quot;group&quot;:null,&quot;editable&quot;:true,&quot;annotation&quot;:null}\" id=\"rectangle_934e692c-1773-4528-832e-f5c440c9f52c\" fill-opacity=\"0\" fill=\"#00bfff\" fill-rule=\"nonzero\" stroke=\"#00bfff\" stroke-width=\"1\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"/></svg>"}},"within":{"@id":"https://purl.stanford.edu/sn904cj3429/iiif/manifest","@type":"sc:Manifest"}}],"@id":"f0229551-4d8a-4f2e-a891-dcb2149268bb"}]
    localStorage.setItem('https://purl.stanford.edu/sn904cj3429/iiif/canvas/sn904cj3429_1', JSON.stringify(anno));

    this.retrieveAnnotations(canvases);
  }

  /** */
  componentDidUpdate(prevProps) {
    const { canvases } = this.props;
    const currentCanvasIds = canvases.map((canvas) => canvas.id);
    const prevCanvasIds = prevProps.canvases.map((canvas) => canvas.id);
    if (!isEqual(currentCanvasIds, prevCanvasIds)) {
      this.retrieveAnnotations(canvases);
    }
  }

  /** */
  retrieveAnnotations(canvases) {
    const { receiveAnnotation } = this.props;
    console.log('retrieve');
    canvases.forEach((canvas) => {
      const annos = JSON.parse(localStorage.getItem(canvas.id));
      if (annos) {
        const annoListId = `${canvas.id}/localStorage/annoList`;
        const annoList = {
          '@id': annoListId,
          '@type': 'sc:AnnotationList',
          resources: annos,
        };
        receiveAnnotation(canvas.id, annoListId, annoList);
      }
    });
  }

  /** */
  render() {
    const { TargetComponent, targetProps } = this.props;
    return (
      <TargetComponent
        {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
      />
    );
  }
}

LocalStorageAnnotation.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  receiveAnnotation: PropTypes.func.isRequired,
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

LocalStorageAnnotation.defaultProps = {
  canvases: [],
};

/** */
const mapDispatchToProps = {
  receiveAnnotation: actions.receiveAnnotation,
};

/** */
function mapStateToProps(state, { targetProps }) {
  return {
    canvases: getVisibleCanvases(state, { windowId: targetProps.windowId }),
    config: state.config,
  };
}

export default {
  component: LocalStorageAnnotation,
  mapDispatchToProps,
  mapStateToProps,
  mode: 'wrap',
  target: 'Window',
};
