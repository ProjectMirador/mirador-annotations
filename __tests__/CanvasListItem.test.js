import React from 'react';
import { mount } from 'enzyme';
import CanvasListItem from '../src/CanvasListItem';
import AnnotationActionsContext from '../src/AnnotationActionsContext';

const receiveAnnotation = jest.fn();
const storageAdapter = jest.fn(() => (
  {
    all: jest.fn(() => (
      {
        items: [
          { id: 'anno/2' },
        ],
      }
    )),
    annotationPageId: 'pageId/3',
    delete: jest.fn(() => (
      'annoPageResultFromDelete'
    )),
  }
));

/** */
function createWrapper(props, context = {}) {
  return mount(
    <AnnotationActionsContext.Provider
      value={{
        canvases: [],
        receiveAnnotation,
        storageAdapter,
        ...context,
      }}
    >
      <CanvasListItem
        annotationid="anno/1"
        {...props}
      >
        <div>HelloWorld</div>
      </CanvasListItem>
    </AnnotationActionsContext.Provider>,
    {
      context,
    },
  );
}

describe('CanvasListItem', () => {
  let wrapper;
  it('wraps its children', () => {
    wrapper = createWrapper();
    expect(wrapper.find(CanvasListItem).find('div').text()).toBe('HelloWorld');
  });
  xit('shows a delete button when it matches an editable annotationid', () => {
    // skipping as there is likely an implementation change
  });
  it('deletes from a storageAdapter when handling deletes', () => {
    wrapper = createWrapper(
      {
        annotationid: 'anno/1',
      },
      {
        canvases: [
          {
            id: 'canvas/1',
          },
        ],
      },
    );
    expect(wrapper.instance().handleDelete());
    expect(receiveAnnotation).toHaveBeenCalledWith('canvas/1', 'pageId/3', 'annoPageResultFromDelete');
  });
});
