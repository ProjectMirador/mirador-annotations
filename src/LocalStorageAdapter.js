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
  // update(annoId) {
  //   // todo
  // }

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
  all() {
    return JSON.parse(localStorage.getItem(this.annotationPageId));
  }
}
