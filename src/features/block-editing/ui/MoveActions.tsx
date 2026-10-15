import {PAGE_ID, useEditor} from '@/entities/page';
import {Button} from '@/shared/ui';

/**
 * Перенос блока. Номер места считается от текущего: «ниже» это index + 2,
 * потому что вырезанный блок сдвигает вставку на единицу — эту механику
 * знает moveNode, здесь только её вход.
 */
export const MoveActions = () => {
  const {state, dispatch, placement} = useEditor();
  const id = state.selectedId;
  const isPage = id === PAGE_ID;
  const {parentId, index} = placement;

  return (
    <>
      <Button disabled={isPage || index === 0} onClick={() => dispatch({type: 'move', id, parentId, index: index - 1})}>
        ↑ выше
      </Button>
      <Button disabled={isPage} onClick={() => dispatch({type: 'move', id, parentId, index: index + 2})}>
        ↓ ниже
      </Button>
      <Button
        disabled={isPage || parentId === PAGE_ID}
        onClick={() => dispatch({type: 'move', id, parentId: PAGE_ID, index: 0})}
      >
        ← наружу
      </Button>
    </>
  );
};
