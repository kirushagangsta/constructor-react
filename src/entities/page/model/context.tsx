import {createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode} from 'react';
import type {IHtmlNode} from './types';
import {createInitialState, editorReducer, type EditorAction, type IEditorState} from './store';
import {findNode, placementOf, type IPlacement} from './selectors';

interface EditorContextValue {
  state: IEditorState;
  dispatch: Dispatch<EditorAction>;
  /** Выделенный узел; его нет, только если выделение указывает на удалённый блок */
  selected: IHtmlNode | undefined;
  /** Место выделенного блока среди соседей — нужно кнопкам переноса */
  placement: IPlacement;
}

const EditorContext = createContext<EditorContextValue | null>(null);

/**
 * Состояние редактора одно на всё приложение, и читают его компоненты на разной
 * глубине: тулбар, дерево, холст, панель свойств. Контекст вместо проброса
 * пропсов — иначе каждый промежуточный компонент знал бы про действия,
 * которых сам не выполняет.
 *
 * Провайдер живёт в сущности, а не в app: так фичи и виджеты берут состояние
 * снизу, и зависимости не разворачиваются вверх по слоям.
 */
export const EditorProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      selected: findNode(state.present, state.selectedId),
      placement: placementOf(state.present, state.selectedId),
    }),
    [state],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const value = useContext(EditorContext);

  if (!value) {
    throw new Error('useEditor вызван вне EditorProvider');
  }

  return value;
};
