import WebAnnotation from '../src/WebAnnotation';

/** */
function createSubject(args = {}) {
  return new WebAnnotation({
    body: 'body',
    canvasId: 'canvasId',
    id: 'id',
    svg: 'svg',
    xywh: 'xywh',
    ...args,
  });
}

describe('WebAnnotation', () => {
  let subject = createSubject();
  describe('constructor', () => {
    it('sets instance accessors', () => {
      ['body', 'canvasId', 'id', 'svg', 'xywh'].forEach((prop) => {
        expect(subject[prop]).toBe(prop);
      });
    });
  });
  describe('target', () => {
    it('with svg', () => {
      expect(subject.target()).toEqual({
        id: 'canvasId',
        selector: {
          type: 'SvgSelector',
          value: 'svg',
        },
      });
    });
    it('with xywh only', () => {
      subject = createSubject({ svg: null });
      expect(subject.target()).toBe('canvasId#xywh=xywh');
    });
    it('with no xywh or svg', () => {
      subject = createSubject({ svg: null, xywh: null });
      expect(subject.target()).toBe('canvasId');
    });
  });
  describe('toJson', () => {
    it('generates a WebAnnotation', () => {
      expect(subject.toJson().type).toBe('Annotation');
    });
  });
});
