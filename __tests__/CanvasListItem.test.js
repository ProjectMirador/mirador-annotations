import React from 'react';
import { mount } from 'enzyme';
import CanvasListItem from '../src/CanvasListItem';
import AnnotationActionsContext from '../src/AnnotationActionsContext';

const receiveAnnotation = jest.fn();
const storageAdapter = jest.fn(() => (
  {
    all: jest.fn().mockResolvedValue(
      {
        items: [
          { id: 'anno/2' },
        ],
      },
    ),
    annotationPageId: 'pageId/3',
    delete: jest.fn(async () => 'annoPageResultFromDelete'),
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
        switchToSingleCanvasView: () => undefined,
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
    expect(wrapper.find(CanvasListItem).find('li').text()).toBe('HelloWorld');
  });
  it('shows an edit and delete button when it matches an editable annotationid and is hovering', () => {
    wrapper = createWrapper({}, {
      annotationsOnCanvases: {
        'canv/1': {
          'annoPage/1': {
            json: {
              items: [
                {
                  id: 'anno/1',
                },
              ],
            },
          },
        },
      },
      canvases: [
        {
          id: 'canv/1',
        },
      ],
    });
    wrapper.setState({ isHovering: true });
    expect(wrapper.find('ForwardRef(ToggleButton)').length).toBe(3);
  });
  it('deletes from a storageAdapter when handling deletes', async () => {
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
    await wrapper.instance().handleDelete();
    expect(receiveAnnotation).toHaveBeenCalledWith('canvas/1', 'pageId/3', 'annoPageResultFromDelete');
  });
});
