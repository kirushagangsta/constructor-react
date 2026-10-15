import {getNodeText, useEditor, type IHtmlNode} from '@/entities/page';
import {Field} from '@/shared/ui';

export const TextField = ({node}: {node: IHtmlNode}) => {
  const {state, dispatch} = useEditor();

  return (
    <Field
      label="Текст"
      value={getNodeText(node)}
      onChange={(event) => dispatch({type: 'setText', id: state.selectedId, text: event.target.value})}
    />
  );
};
