import LocalStorageAdapter from '../src/LocalStorageAdapter';
import fixture from '../__fixtures__/web_annotation.json';

describe('LocalStorageAdapter', () => {
  let subject;
  beforeEach(() => {
    subject = new LocalStorageAdapter('//foo');
    localStorage.clear();
    localStorage.setItem('//foo', JSON.stringify(fixture));
  });
  describe('create', () => {
    it('adds an item to the AnnotationPage items', () => {
      expect(subject.all().items.length).toBe(1);
      const annoPage = subject.create({});
      expect(annoPage.items.length).toBe(2);
    });
    it('if there is no AnnotationPage, create one', () => {
      subject = new LocalStorageAdapter('//bar');
      expect(subject.all()).toBe(null);
      subject.create({});
      const annoPage = subject.all();
      expect(annoPage.type).toBe('AnnotationPage');
      expect(annoPage.items.length).toBe(1);
    });
  });
  describe('delete', () => {
    it('removes an item from an AnnotationPage', () => {
      expect(subject.all().items.length).toBe(1);
      const annoPage = subject.delete('https://example.org/iiif/book1/page/manifest/efb5757d-899b-4551-a7ab-5cb5d1d0eb02');
      expect(annoPage.items.length).toBe(0);
    });
  });
  describe('update', () => {
    xit('not implemented', () => {

    });
  });
  describe('all', () => {
    it('parses and returns an item based on its annotationPageId', () => {
      const annoPage = subject.all();
      expect(localStorage.getItem).toHaveBeenLastCalledWith('//foo');
      expect(annoPage.items.length).toBe(1);
      expect(annoPage.type).toBe('AnnotationPage');
    });
  });
});
