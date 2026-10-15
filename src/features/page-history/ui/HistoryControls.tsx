import {useEditor} from '@/entities/page';
import {Button} from '@/shared/ui';

export const HistoryControls = () => {
  const {state, dispatch} = useEditor();

  return (
    <>
      <Button disabled={state.past.length === 0} onClick={() => dispatch({type: 'undo'})}>
        Отменить
      </Button>
      <Button disabled={state.future.length === 0} onClick={() => dispatch({type: 'redo'})}>
        Вернуть
      </Button>
    </>
  );
};
