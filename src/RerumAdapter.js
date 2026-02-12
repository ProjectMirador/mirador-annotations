const ENDPOINT = 'https://tinydev.rerum.io';
const CREATOR = 'TinyMirador <https://github.com/ProjectMirador/mirador-annotations/blob/master/src/RerumAdapter.js>';

/**
 * Adds a RERUM adapter to Mirador for publishing and consuming annotations.
 * @module RerumAdapter
 * @docs https://centerfordigitalhumanities.github.io/blog/mirador-rerum-adapter/ Explains how to modify this adapter for your own use
*/
export default class RerumAdapter {
  /** */
  prepareForRerum(annotation) {
    const forRerum = {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      '@id': annotation.id,
      creator: this.creator,
    };
    return Object.assign(forRerum, annotation);
  }

  /**
    * @param {String} canvasId - The URI of the canvas to which the annotations are attached
    * @param {String} endpointUrl - The URL of the RERUM endpoint (default: 'https://tinydev.rerum.io')
    * @param {String} creator - The creator of the annotations
  */
  constructor(canvasId, endpointUrl = ENDPOINT, creator = CREATOR) {
    this.creator = creator;
    this.canvasId = canvasId;
    this.endpointUrl = endpointUrl;
    this.emptyAnnoPage = {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      creator: this.creator,
      items: [],
      target: this.canvasId,
      type: 'AnnotationPage',
    };
  }

  /**
    * Create an Annotation by using the RERUM Sandbox /create endpoint.
    * Add that Annotation into the AnnotationPage.  Update the AnnotationPage.
    * Since RERUM does versioning, get the resulting AnnotationPage for its new id.
    * This prepares it for sequential alterations.
    * If there is no existing AnnotationPage at the time of Annotation creation one must be created.
    * @param annotation - An Annotation JSON object to be created
    * @return The known AnnotationPage
  */
  async create(annotation) {
    let knownAnnoPage = await this.all() || this.emptyAnnoPage;
    if (!annotation) return knownAnnoPage;
    const createdAnnotation = await fetch(`${this.endpointUrl}/create`, {
      body: JSON.stringify(this.prepareForRerum(annotation)),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    })
      .then((resp) => resp.json())
      .then((created) => {
        const returnValue = created;
        delete returnValue.new_obj_state;
        returnValue.id = returnValue['@id'];
        return returnValue;
      })
      .catch((err) => undefined);
    if (createdAnnotation) {
      knownAnnoPage.items.push(createdAnnotation);
      knownAnnoPage = knownAnnoPage['@id'] ? await this.updateAnnoPage(knownAnnoPage) : await this.createAnnoPage(knownAnnoPage);
    }
    return knownAnnoPage;
  }

  /**
    * Update an Annotation by using the RERUM Sandbox /update endpoint.
    * Find that existing Annotation in the AnnotationPage.
    * Update the Annotation in place, and also update the AnnotationPage.
    * Since RERUM does versioning, get the resulting AnnotationPage for its new id.
    * This prepares it for sequential alterations.
    * @param data - An Annotation JSON object to be updated.  Contains altered keys.
    * @return The known AnnotationPage
  */
  async update(annotation) {
    let knownAnnoPage = await this.all();
    if (!knownAnnoPage) return undefined;
    const origAnnoId = annotation?.id ?? annotation?.['@id'];
    if (!origAnnoId) return knownAnnoPage;
    const updatedAnnotation = await fetch(`${this.endpointUrl}/update/`, {
      body: JSON.stringify(this.prepareForRerum(annotation)),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'PUT',
    })
      .then((resp) => resp.json())
      .then((updated) => {
        const returnValue = updated;
        delete returnValue.new_obj_state;
        returnValue.id = returnValue['@id'];
        return returnValue;
      })
      .catch((err) => undefined);
    if (updatedAnnotation) {
      knownAnnoPage.items = knownAnnoPage.items.map((item) => ((item.id ?? item['@id']) === origAnnoId ? updatedAnnotation : item));
      knownAnnoPage = await this.updateAnnoPage(knownAnnoPage);
    }
    return knownAnnoPage;
  }

  /**
    * Delete an Annotation by using the RERUM Sandbox /delete endpoint.
    * Find that existing Annotation in the AnnotationPage.
    * Remove the Annotation, and also update the AnnotationPage.
    * Since RERUM does versioning, get the resulting AnnotationPage for its new id.
    * This prepares it for sequential alterations.
    * @param annoId - An Annotation URI
    * @return The known AnnotationPage
  */
  async delete(annoId) {
    let knownAnnoPage = await this.all();
    if (!knownAnnoPage) return undefined;
    if (!annoId) return knownAnnoPage;
    const hashId = annoId.split('/').pop();
    return fetch(`${this.endpointUrl}/delete/${hashId}`, {
      method: 'DELETE',
    })
      .then(async (resp) => {
        if (!resp.ok) throw new Error(`Failed to delete ${annoId}`);
        knownAnnoPage.items = knownAnnoPage.items.filter((item) => {
          const itemid = item.id ?? item['@id'];
          return itemid !== annoId;
        });
        knownAnnoPage = await this.updateAnnoPage(knownAnnoPage);
        return knownAnnoPage;
      })
      .catch((err) => knownAnnoPage);
  }

  /**
    * Get an Annotation out of the AnnotationPage 'items' array.
    * Do not alter the array.
    * @param annotation - An Annotation JSON object to be created
    * @return The Annotation object or undefined
  */
  async get(annoId) {
    if (!annoId) return undefined;
    const annotationPage = await this.all();
    return annotationPage.items.find((item) => {
      const itemid = item.id ?? item['@id'] ?? 'unknown';
      return itemid === annoId;
    });
  }

  /**
    * Get the AnnotationPage containing all the Annotations.
    * @return The AnnotationPage or an empty AnnotationPage object.
  */
  async all() {
    let knownAnnoPage;
    const query = {
      '__rerum.history.next': { $exists: true, $size: 0 },
      creator: this.creator,
      target: this.canvasId,
      type: 'AnnotationPage',
    };
    return fetch(`${this.endpointUrl}/query`, {
      body: JSON.stringify(query),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    })
      .then((resp) => resp.json())
      .then((arr) => {
        knownAnnoPage = arr.shift();
        knownAnnoPage?.items.forEach((anno) => { anno.id = anno['@id']; });
        return knownAnnoPage;
      })
      .catch((err) => err);
  }

  /**
    * Update an AnnotationPage by using the RERUM Sandbox /update endpoint.
    * @param annoPage - An AnnotationPage JSON object to be created
    * @return The known AnnotationPage
  */
  async updateAnnoPage(annoPage) {
    if (!annoPage) return undefined;
    return fetch(`${this.endpointUrl}/update`, {
      body: JSON.stringify(annoPage),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'PUT',
    })
      .then((resp) => resp.json())
      .then((updated) => {
        const returnValue = updated;
        delete returnValue.new_obj_state;
        return returnValue;
      })
      .catch((err) => annoPage);
  }

  /**
    * Create an AnnotationPage by using the RERUM Sandbox /create endpoint.
    * @param annoPage - An AnnotationPage JSON object to be created
    * @return The known AnnotationPage
  */
  async createAnnoPage(annoPage) {
    if (!annoPage) return undefined;
    return fetch(`${this.endpointUrl}/create`, {
      body: JSON.stringify(annoPage),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    })
      .then((resp) => resp.json())
      .then((created) => {
        const returnValue = created;
        delete returnValue.new_obj_state;
        return returnValue;
      })
      .catch((err) => annoPage);
  }
}
