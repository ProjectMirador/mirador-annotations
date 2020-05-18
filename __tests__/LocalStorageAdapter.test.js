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
    it('adds an item to the AnnotationPage items', async () => {
      let annoPage = await subject.all();
      expect(annoPage.items.length).toBe(1);
      annoPage = await subject.create({});
      expect(annoPage.items.length).toBe(2);
    });
    it('if there is no AnnotationPage, create one', async () => {
      subject = new LocalStorageAdapter('//bar');
      let annoPage = await subject.all();
      expect(annoPage).toBe(null);
      await subject.create({});
      annoPage = await subject.all();
      expect(annoPage.type).toBe('AnnotationPage');
      expect(annoPage.items.length).toBe(1);
    });
  });
  describe('delete', () => {
    it('removes an item from an AnnotationPage', async () => {
      let annoPage = await subject.all();
      expect(annoPage.items.length).toBe(1);
      annoPage = await subject.delete('https://example.org/iiif/book1/page/manifest/efb5757d-899b-4551-a7ab-5cb5d1d0eb02');
      expect(annoPage.items.length).toBe(0);
    });
  });
  describe('update', () => {
    it('replaces the annotation', async () => {
      let annoPage = await subject.all();
      const newAnno = annoPage.items[0];
      newAnno.body.value = 'face';
      annoPage = await subject.update(newAnno);
      expect(annoPage.items[0].body.value).toBe('face');
    });
  });
  describe('all', () => {
    it('parses and returns an item based on its annotationPageId', async () => {
      const annoPage = await subject.all();
      expect(localStorage.getItem).toHaveBeenLastCalledWith('//foo');
      expect(annoPage.items.length).toBe(1);
      expect(annoPage.type).toBe('AnnotationPage');
    });
  });
});
