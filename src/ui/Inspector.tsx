import type {IHtmlNode, StyleVariant} from '../core/types';
import {getVariantDeclarations} from '../core/pageCss';
import {getNodeText} from '../core/text';
import {PAGE_ID} from '../core/page';
import {voidTags} from '../core/tags';

/** Свойства, которые правятся прямо в панели; остальное живёт в стилях как данные */
const FIELDS = [
  {property: 'width', label: 'Ширина'},
  {property: 'padding', label: 'Внутренний отступ'},
  {property: 'margin', label: 'Внешний отступ'},
  {property: 'font-size', label: 'Размер шрифта'},
  {property: 'color', label: 'Цвет текста'},
  {property: 'background', label: 'Фон'},
] as const;

interface Props {
  node: IHtmlNode;
  variant: StyleVariant;
  onText: (text: string) => void;
  onStyle: (property: string, value: string) => void;
}

export const Inspector = ({node, variant, onText, onStyle}: Props) => {
  // на экране показываем стиль с учётом наследования от узких вариантов,
  // а правим только собственный — иначе правка на 'lg' молча затрёт базу
  const inherited = getVariantDeclarations(node, variant);
  const own = node.styles[variant] ?? {};

  return (
    <div className="inspector">
      <h2 className="inspector__title">
        {node.id === PAGE_ID ? 'Страница' : `Блок ${node.id} · ${node.tag}`}
      </h2>

      {!voidTags.has(node.tag) && (
        <label className="field">
          <span className="field__label">Текст</span>
          <input className="field__input" value={getNodeText(node)} onChange={(e) => onText(e.target.value)} />
        </label>
      )}

      {FIELDS.map(({property, label}) => (
        <label className="field" key={property}>
          <span className="field__label">
            {label}
            {own[property] === undefined && inherited[property] !== undefined && (
              <em className="field__hint" title="значение пришло от более узкого варианта">
                унаследовано
              </em>
            )}
          </span>
          <input
            className="field__input"
            value={own[property] ?? ''}
            placeholder={inherited[property] ?? ''}
            onChange={(e) => onStyle(property, e.target.value)}
          />
        </label>
      ))}
    </div>
  );
};
