import type {CssDeclarations, IHtmlNode, StyleVariant} from '../core/types';
import {createPageNode, PAGE_ID} from '../core/page';
import {getNodesPath} from '../core/getNodesPath';
import {createId, cloneNode} from '../core/getId';
import {moveNode} from '../core/move';
import {setNodeText} from '../core/text';
import {describeChange} from '../core/history';
import {voidTags} from '../core/tags';

/**
 * Шаг журнала: страница целиком плюс название правки.
 * Название не придумывается здесь — его выдаёт describeChange, сравнивая
 * две страницы. Тот же код, что и в Vue-версии: журнал ведётся по дереву,
 * а не по тому, какую кнопку нажали.
 */
export interface IHistoryStep {
  page: IHtmlNode;
  label: string;
}

export interface IEditorState {
  past: IHistoryStep[];
  present: IHtmlNode;
  future: IHistoryStep[];
  selectedId: string;
  variant: StyleVariant;
  /**
   * Чем была последняя правка. Набор текста идёт по букве на нажатие, и каждое
   * из них — отдельный вызов редьюсера. Без этой метки журнал распухал бы
   * до «Изменили текст блока 1» на каждую букву, а отмена откатывала бы по одной.
   * Одинаковая метка подряд значит «та же правка продолжается» — шаг не добавляем.
   */
  mergeKey: string | null;
}

export type EditorAction =
  | {type: 'select'; id: string}
  | {type: 'variant'; variant: StyleVariant}
  | {type: 'addBlock'; parentId: string; tag?: string; text?: string}
  | {type: 'duplicate'; id: string}
  | {type: 'remove'; id: string}
  | {type: 'setText'; id: string; text: string}
  | {type: 'setStyle'; id: string; property: string; value: string}
  | {type: 'move'; id: string; parentId: string; index: number}
  | {type: 'undo'}
  | {type: 'redo'};

export const createInitialState = (): IEditorState => ({
  past: [],
  present: createPageNode([
    {id: createId(), tag: 'h1', styles: {base: {'font-size': '28px'}}, attrs: {}, children: ['Заголовок']},
    {id: createId(), tag: 'p', styles: {}, attrs: {}, children: ['Текст абзаца']},
  ]),
  future: [],
  selectedId: PAGE_ID,
  variant: 'base',
  mergeKey: null,
});

/** Узел страницы по id; для самой страницы путь пустой, поэтому она отдельным случаем */
export const findNode = (page: IHtmlNode, id: string): IHtmlNode | undefined => {
  return id === PAGE_ID ? page : getNodesPath(page, id).at(-1)?.node;
};

/**
 * Правка делается на копии, а не на текущем дереве: утилиты ядра меняют узлы
 * на месте (moveNode режет children), и React не должен видеть то же самое
 * дерево «до» и «после» — иначе нечего сравнивать и нечего перерисовывать.
 *
 * Возвращённый false значит «ничего не изменилось» — тогда шаг в журнал не идёт.
 *
 * mergeKey склеивает подряд идущие правки одного и того же: пока он не менялся,
 * новый шаг не заводится, а в журнале остаётся первый — с состоянием до начала
 * набора. Поэтому одна отмена возвращает всё слово целиком, а не по букве.
 */
const edit = (
  state: IEditorState,
  change: (page: IHtmlNode) => boolean | void,
  mergeKey: string | null = null,
): IEditorState => {
  const next = structuredClone(state.present);

  if (change(next) === false) {
    return state;
  }

  const continues = mergeKey !== null && mergeKey === state.mergeKey && state.past.length > 0;

  return {
    ...state,
    past: continues ? state.past : [...state.past, {page: state.present, label: describeChange(state.present, next)}],
    present: next,
    // новая правка обрывает ветку «вперёд»: возвращаться больше некуда
    future: [],
    mergeKey,
  };
};

export const editorReducer = (state: IEditorState, action: EditorAction): IEditorState => {
  switch (action.type) {
    // выбор блока и ширины ничего не меняют на странице, но обрывают набор:
    // после возврата к тому же полю должна начаться новая правка
    case 'select':
      return {...state, selectedId: action.id, mergeKey: null};

    case 'variant':
      return {...state, variant: action.variant, mergeKey: null};

    case 'addBlock': {
      const id = createId();

      return {
        ...edit(state, (page) => {
          const parent = findNode(page, action.parentId);

          if (!parent || voidTags.has(parent.tag)) {
            return false;
          }

          parent.children.push({
            id,
            tag: action.tag ?? 'div',
            styles: {},
            attrs: {},
            children: action.text === undefined ? ['Новый блок'] : [action.text],
          });
        }),
        selectedId: id,
      };
    }

    case 'duplicate': {
      let copyId = '';

      const next = edit(state, (page) => {
        const path = getNodesPath(page, action.id);
        const node = path.at(-1)?.node;
        const parent = path.at(-2)?.node ?? page;

        if (!node) {
          return false;
        }

        const copy = cloneNode(node);
        copyId = copy.id;
        parent.children.splice(parent.children.indexOf(node) + 1, 0, copy);
      });

      return copyId ? {...next, selectedId: copyId} : next;
    }

    case 'remove': {
      if (action.id === PAGE_ID) {
        return state;
      }

      return {
        ...edit(state, (page) => {
          const path = getNodesPath(page, action.id);
          const node = path.at(-1)?.node;
          const parent = path.at(-2)?.node ?? page;

          if (!node) {
            return false;
          }

          parent.children.splice(parent.children.indexOf(node), 1);
        }),
        selectedId: PAGE_ID,
      };
    }

    case 'setText':
      return edit(
        state,
        (page) => {
          const node = findNode(page, action.id);

          if (!node) {
            return false;
          }

          setNodeText(node, action.text);
        },
        `text:${action.id}`,
      );

    case 'setStyle':
      return edit(
        state,
        (page) => {
          const node = findNode(page, action.id);

          if (!node) {
            return false;
          }

          const declarations: CssDeclarations = {...node.styles[state.variant]};

          if (action.value) {
            declarations[action.property] = action.value;
          } else {
            delete declarations[action.property];
          }

          node.styles = {...node.styles, [state.variant]: declarations};
        },
        `style:${action.id}:${state.variant}:${action.property}`,
      );

    case 'move':
      return edit(state, (page) => moveNode(page, action.id, action.parentId, action.index));

    case 'undo': {
      const step = state.past.at(-1);

      if (!step) {
        return state;
      }

      return {
        ...state,
        past: state.past.slice(0, -1),
        present: step.page,
        future: [{page: state.present, label: step.label}, ...state.future],
        mergeKey: null,
      };
    }

    case 'redo': {
      const [step, ...rest] = state.future;

      if (!step) {
        return state;
      }

      return {
        ...state,
        past: [...state.past, {page: state.present, label: step.label}],
        present: step.page,
        future: rest,
        mergeKey: null,
      };
    }

    default:
      return state;
  }
};
