/** */
export default class WebAnnotation {
  /** */
  constructor({
    canvasId, id, xywh, body, tags, svg, manifestId,
  }) {
    this.id = id;
    this.canvasId = canvasId;
    this.xywh = xywh;
    this.body = body;
    this.tags = tags;
    this.svg = svg;
    this.manifestId = manifestId;
  }

  /** */
  toJson() {
    return {
      body: this.createBody(),
      id: this.id,
      motivation: 'commenting',
      target: this.target(),
      type: 'Annotation',
    };
  }

  /** */
  createBody() {
    let bodies = [];
    if (this.body) {
      bodies.push({
        type: 'TextualBody',
        value: this.body,
      });
    }
    if (this.tags) {
      bodies = bodies.concat(this.tags.map((tag) => ({
        purpose: 'tagging',
        type: 'TextualBody',
        value: tag,
      })));
    }
    if (bodies.length === 1) {
      return bodies[0];
    }
    return bodies;
  }

  /** */
  target() {
    let target = this.canvasId;
    if (this.svg || this.xywh) {
      target = {
        source: this.source(),
      };
    }
    if (this.svg) {
      target.selector = {
        type: 'SvgSelector',
        value: this.svg,
      };
    }
    if (this.xywh) {
      const fragsel = {
        type: 'FragmentSelector',
        value: `xywh=${this.xywh}`,
      };
      if (target.selector) {
        // add fragment selector
        target.selector = [
          fragsel,
          target.selector,
        ];
      } else {
        target.selector = fragsel;
      }
    }
    return target;
  }

  /** */
  source() {
    let source = this.canvasId;
    if (this.manifest) {
      source = {
        id: this.canvasId,
        partOf: {
          id: this.manifest.id,
          type: 'Manifest',
        },
        type: 'Canvas',
      };
    }
    return source;
  }
}
