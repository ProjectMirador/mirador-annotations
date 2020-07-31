/** */
export default class WebAnnotation {
  /** */
  constructor({
    canvasId, id, xywh, body, tags, svg,
  }) {
    this.id = id;
    this.canvasId = canvasId;
    this.xywh = xywh;
    this.body = body;
    this.tags = tags;
    this.svg = svg;
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
    if (this.svg) {
      target = {
        id: this.canvasId, // should be source, see #25
        selector: {
          type: 'SvgSelector',
          value: this.svg,
        },
      };
    }
    if (this.xywh) {
      if (target.selector) {
        // add fragment selector
        target.selector = [
          {
            type: 'FragmentSelector',
            value: `xywh=${this.xywh}`,
          },
          target.selector,
        ];
      } else {
        target = `${this.canvasId}#xywh=${this.xywh}`;
      }
    }
    return target;
  }
}
