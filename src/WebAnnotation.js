/** */
export default class WebAnnotation {
  /** */
  constructor({
    canvasId, id, xywh, body, svg,
  }) {
    this.id = id;
    this.canvasId = canvasId;
    this.xywh = xywh;
    this.body = body;
    this.svg = svg;
  }

  /** */
  toJson() {
    return {
      body: {
        language: 'en',
        type: 'TextualBody',
        value: this.body,
      },
      id: this.id,
      motivation: 'commenting',
      target: this.target(),
      type: 'Annotation',
    };
  }

  /** */
  target() {
    let target = this.canvasId;
    if (this.svg) {
      target = {};
      target.id = this.canvasId;
      target.selector = {
        type: 'SvgSelector',
        value: this.svg,
      };
      return target;
    }
    if (this.xywh) {
      target += `#xywh=${this.xywh}`;
    }
    return target;
  }
}
