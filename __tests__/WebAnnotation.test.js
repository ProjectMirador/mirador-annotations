import WebAnnotation from '../src/WebAnnotation';

/** */
function createSubject(args = {}) {
  return new WebAnnotation({
    body: 'body',
    canvasId: 'canvasId',
    id: 'id',
    svg: 'svg',
    tags: ['tags'],
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
    it('with svg and xywh', () => {
      expect(subject.target()).toEqual({
        selector: [
          {
            type: 'FragmentSelector',
            value: 'xywh=xywh',
          },
          {
            type: 'SvgSelector',
            value: 'svg',
          },
        ],
        source: 'canvasId',
      });
    });
    it('with svg only', () => {
      subject = createSubject({ xywh: null });
      expect(subject.target()).toEqual({
        selector: {
          type: 'SvgSelector',
          value: 'svg',
        },
        source: 'canvasId',
      });
    });
    it('with xywh only', () => {
      subject = createSubject({ svg: null });
      expect(subject.target()).toEqual({
        selector: {
          type: 'FragmentSelector',
          value: 'xywh=xywh',
        },
        source: 'canvasId',
      });
    });
    it('with no xywh or svg', () => {
      subject = createSubject({ svg: null, xywh: null });
      expect(subject.target()).toBe('canvasId');
    });
  });
  describe('body', () => {
    it('with text and tags', () => {
      expect(subject.createBody()).toEqual([
        {
          type: 'TextualBody',
          value: 'body',
        },
        {
          purpose: 'tagging',
          type: 'TextualBody',
          value: 'tags',
        },
      ]);
    });
    it('with text only', () => {
      subject = createSubject({ tags: null });
      expect(subject.createBody()).toEqual({
        type: 'TextualBody',
        value: 'body',
      });
    });
    it('with tags only', () => {
      subject = createSubject({ body: null });
      expect(subject.createBody()).toEqual({
        purpose: 'tagging',
        type: 'TextualBody',
        value: 'tags',
      });
    });
  });
  describe('toJson', () => {
    it('generates a WebAnnotation', () => {
      expect(subject.toJson().type).toBe('Annotation');
    });
  });
});
