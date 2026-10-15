import {PAGE_ID, useEditor} from '@/entities/page';
import {Button} from '@/shared/ui';

/** Создание, копирование и удаление блока — всё, что меняет состав страницы */
export const BlockActions = () => {
  const {state, dispatch} = useEditor();
  const id = state.selectedId;
  const isPage = id === PAGE_ID;

  return (
    <>
      <Button onClick={() => dispatch({type: 'addBlock', parentId: id})}>+ блок внутрь</Button>
      <Button onClick={() => dispatch({type: 'addBlock', parentId: id, tag: 'h2', text: 'Подзаголовок'})}>
        + заголовок
      </Button>
      <Button disabled={isPage} onClick={() => dispatch({type: 'duplicate', id})}>
        Дублировать
      </Button>
      <Button disabled={isPage} onClick={() => dispatch({type: 'remove', id})}>
        Удалить
      </Button>
    </>
  );
};
