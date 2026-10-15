import {PAGE_ID, useEditor} from '@/entities/page';
import {StyleFields, TextField} from '@/features/node-properties';
import {voidTags} from '@/shared/config';

/** Правая колонка: свойства того, что сейчас выделено */
export const InspectorPanel = () => {
  const {state, selected} = useEditor();

  if (!selected) {
    return <aside className="panel panel--right" />;
  }

  return (
    <aside className="panel panel--right">
      <h2 className="panel__title">
        {state.selectedId === PAGE_ID ? 'Страница' : `Блок ${selected.id} · ${selected.tag}`}
      </h2>

      {/* у пустых тегов детей не бывает, писать туда текст некуда */}
      {!voidTags.has(selected.tag) && <TextField node={selected} />}

      <StyleFields node={selected} />
    </aside>
  );
};
