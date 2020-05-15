/** */
export default class LocalStorageAdapter {
  /** */
  constructor(annotationPageId) {
    this.annotationPageId = annotationPageId;
  }

  /** */
  create(annotation) {
    const emptyAnnoPage = {
      id: this.annotationPageId,
      items: [],
      type: 'AnnotationPage',
    };
    const annotationPage = this.all() || emptyAnnoPage;
    annotationPage.items.push(annotation);
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    return annotationPage;
  }

  /** */
  update(annotation) {
    const annotationPage = this.all();
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex((item) => item.id === annotation.id);
      annotationPage.items.splice(currentIndex, 1, annotation);
      localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
      return annotationPage;
    }
    return null;
  }

  /** */
  delete(annoId) {
    const annotationPage = this.all();
    if (annotationPage) {
      annotationPage.items = annotationPage.items.filter((item) => item.id !== annoId);
    }
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    return annotationPage;
  }

  /** */
  get(annoId) {
    const annotationPage = this.all();
    if (annotationPage) {
      return annotationPage.items.find((item) => item.id === annoId);
    }
    return null;
  }

  /** */
  all() {
    return JSON.parse(localStorage.getItem(this.annotationPageId));
  }
}
