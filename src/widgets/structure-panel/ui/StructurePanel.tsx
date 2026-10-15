import {BlockTree, useEditor} from '@/entities/page';
import {HistoryLog} from '@/features/page-history';

/** Левая колонка: из чего состоит страница и что с ней делали */
export const StructurePanel = () => {
  const {state, dispatch} = useEditor();

  return (
    <aside className="panel">
      <BlockTree
        page={state.present}
        selectedId={state.selectedId}
        onSelect={(id) => dispatch({type: 'select', id})}
      />
      <HistoryLog />
    </aside>
  );
};
