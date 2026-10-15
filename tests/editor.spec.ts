import {describe, it, expect} from 'vitest';
import {createInitialState, editorReducer, findNode, type IEditorState} from '../src/store/editor';
import {PAGE_ID} from '../src/core/page';
import {getNodeText} from '../src/core/text';
import type {EditorAction} from '../src/store/editor';

/** Прогоняет несколько действий подряд — читается ближе к сценарию, чем цепочка вызовов */
const run = (state: IEditorState, ...actions: EditorAction[]) => actions.reduce(editorReducer, state);

const blockIds = (state: IEditorState) =>
  state.present.children.filter((child) => typeof child !== 'string').map((child) => (child as {id: string}).id);

describe('редактор: правки', () => {
  it('добавляет блок внутрь страницы и сразу его выделяет', () => {
    const before = createInitialState();
    const after = editorReducer(before, {type: 'addBlock', parentId: PAGE_ID});

    expect(blockIds(after)).toHaveLength(blockIds(before).length + 1);
    expect(after.selectedId).toBe(blockIds(after).at(-1));
  });

  it('не трогает исходное состояние: правка идёт по копии', () => {
    const before = createInitialState();
    const snapshot = JSON.stringify(before.present);

    editorReducer(before, {type: 'addBlock', parentId: PAGE_ID});

    expect(JSON.stringify(before.present)).toBe(snapshot);
  });

  it('пишет текст в блок', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];
    const after = editorReducer(state, {type: 'setText', id, text: 'Другой текст'});

    expect(getNodeText(findNode(after.present, id)!)).toBe('Другой текст');
  });

  it('удаляет блок и возвращает выделение на страницу', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];
    const after = editorReducer({...state, selectedId: id}, {type: 'remove', id});

    expect(blockIds(after)).not.toContain(id);
    expect(after.selectedId).toBe(PAGE_ID);
  });

  it('страницу удалить нельзя', () => {
    const state = createInitialState();

    expect(editorReducer(state, {type: 'remove', id: PAGE_ID})).toBe(state);
  });

  it('копия блока получает собственный id', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];
    const after = editorReducer(state, {type: 'duplicate', id});
    const ids = blockIds(after);

    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
  });

  it('пустое значение стиля убирает свойство, а не пишет пустую строку', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const set = editorReducer(state, {type: 'setStyle', id, property: 'color', value: 'red'});
    const cleared = editorReducer(set, {type: 'setStyle', id, property: 'color', value: ''});

    expect(findNode(set.present, id)!.styles.base).toHaveProperty('color', 'red');
    expect(findNode(cleared.present, id)!.styles.base).not.toHaveProperty('color');
  });

  it('пишет стиль в тот вариант, который сейчас выбран', () => {
    const state = {...createInitialState(), variant: 'lg' as const};
    const id = blockIds(state)[0];
    const after = editorReducer(state, {type: 'setStyle', id, property: 'width', value: '600px'});

    expect(findNode(after.present, id)!.styles.lg).toEqual({width: '600px'});
    expect(findNode(after.present, id)!.styles.base).not.toHaveProperty('width');
  });

  it('переносит блок внутри страницы', () => {
    const state = createInitialState();
    const [first, second] = blockIds(state);
    const after = editorReducer(state, {type: 'move', id: second, parentId: PAGE_ID, index: 0});

    expect(blockIds(after)).toEqual([second, first]);
  });

  it('перенос на то же место состояние не меняет', () => {
    const state = createInitialState();
    const [first] = blockIds(state);

    expect(editorReducer(state, {type: 'move', id: first, parentId: PAGE_ID, index: 0})).toBe(state);
  });
});

describe('редактор: журнал', () => {
  it('называет правку сам, по разнице между страницами', () => {
    const after = editorReducer(createInitialState(), {type: 'addBlock', parentId: PAGE_ID});

    expect(after.past.at(-1)!.label).toBe('Добавили блок 3');
  });

  it('отменяет и возвращает правку', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const edited = editorReducer(state, {type: 'setText', id, text: 'Правка'});
    const undone = editorReducer(edited, {type: 'undo'});
    const redone = editorReducer(undone, {type: 'redo'});

    expect(getNodeText(findNode(undone.present, id)!)).toBe('Заголовок');
    expect(getNodeText(findNode(redone.present, id)!)).toBe('Правка');
  });

  it('новая правка обрывает ветку «вперёд»', () => {
    const state = run(
      createInitialState(),
      {type: 'addBlock', parentId: PAGE_ID},
      {type: 'undo'},
    );

    expect(state.future).toHaveLength(1);
    expect(editorReducer(state, {type: 'addBlock', parentId: PAGE_ID}).future).toHaveLength(0);
  });

  it('отменять нечего — состояние то же самое', () => {
    const state = createInitialState();

    expect(editorReducer(state, {type: 'undo'})).toBe(state);
    expect(editorReducer(state, {type: 'redo'})).toBe(state);
  });

  it('несколько правок отменяются по одной, в обратном порядке', () => {
    const state = run(
      createInitialState(),
      {type: 'addBlock', parentId: PAGE_ID},
      {type: 'addBlock', parentId: PAGE_ID},
    );

    expect(state.past.map((step) => step.label)).toEqual(['Добавили блок 3', 'Добавили блок 4']);
    expect(blockIds(editorReducer(state, {type: 'undo'})).length).toBe(3);
  });

  it('выделение и выбранный вариант в журнал не пишутся', () => {
    const state = createInitialState();
    const after = run(state, {type: 'select', id: PAGE_ID}, {type: 'variant', variant: 'md'});

    expect(after.past).toHaveLength(0);
  });
});

describe('редактор: склейка правок', () => {
  it('набор текста по буквам — это один шаг журнала, а не шаг на букву', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const typed = 'Привет'
      .split('')
      .reduce((acc, _, index) => editorReducer(acc, {type: 'setText', id, text: 'Привет'.slice(0, index + 1)}), state);

    expect(typed.past).toHaveLength(1);
    expect(getNodeText(findNode(typed.present, id)!)).toBe('Привет');
  });

  it('одна отмена возвращает весь набранный текст, а не последнюю букву', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const typed = run(
      state,
      {type: 'setText', id, text: 'П'},
      {type: 'setText', id, text: 'Пр'},
      {type: 'setText', id, text: 'При'},
    );

    expect(getNodeText(findNode(editorReducer(typed, {type: 'undo'}).present, id)!)).toBe('Заголовок');
  });

  it('разные свойства склеиваться не должны', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const edited = run(
      state,
      {type: 'setStyle', id, property: 'color', value: 'red'},
      {type: 'setStyle', id, property: 'width', value: '100px'},
    );

    expect(edited.past).toHaveLength(2);
  });

  it('возврат к тому же полю после выбора блока начинает новый шаг', () => {
    const state = createInitialState();
    const id = blockIds(state)[0];

    const edited = run(
      state,
      {type: 'setStyle', id, property: 'color', value: 'red'},
      {type: 'select', id},
      {type: 'setStyle', id, property: 'color', value: 'blue'},
    );

    expect(edited.past).toHaveLength(2);
  });
});
