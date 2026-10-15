import {getVariantDeclarations, useEditor, type IHtmlNode} from '@/entities/page';
import {Field} from '@/shared/ui';
import {STYLE_FIELDS} from '../model/styleFields';

/**
 * Правка стилей выбранного блока на текущей ширине.
 *
 * Показываем значение с учётом наследования от более узких вариантов,
 * а правим только собственное: иначе правка на 'lg' молча затёрла бы базу.
 * Унаследованное уходит в placeholder — видно, что значение есть, но оно чужое.
 */
export const StyleFields = ({node}: {node: IHtmlNode}) => {
  const {state, dispatch} = useEditor();
  const inherited = getVariantDeclarations(node, state.variant);
  const own = node.styles[state.variant] ?? {};

  return (
    <>
      {STYLE_FIELDS.map(({property, label}) => (
        <Field
          key={property}
          label={label}
          note={
            own[property] === undefined && inherited[property] !== undefined ? (
              <em className="field__hint" title="значение пришло от более узкого варианта">
                унаследовано
              </em>
            ) : undefined
          }
          value={own[property] ?? ''}
          placeholder={inherited[property] ?? ''}
          onChange={(event) =>
            dispatch({type: 'setStyle', id: state.selectedId, property, value: event.target.value})
          }
        />
      ))}
    </>
  );
};
