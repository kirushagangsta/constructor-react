import type {IHtmlNode} from '../core/types';
import {PAGE_ID} from '../core/page';
import {getNodeText} from '../core/text';

interface Props {
  page: IHtmlNode;
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Только блоки: текст в детях лежит вперемешку с ними, но в дереве его не показываем */
const blocksOf = (node: IHtmlNode) => node.children.filter((child): child is IHtmlNode => typeof child !== 'string');

/** Как назвать блок человеку: номер, тег и начало текста, если он есть */
const title = (node: IHtmlNode, number: string) => {
  const text = getNodeText(node).trim();

  return `${number} · ${node.tag}${text ? ` · ${text.slice(0, 20)}` : ''}`;
};

interface RowProps {
  node: IHtmlNode;
  number: string;
  selectedId: string;
  onSelect: (id: string) => void;
}

const Row = ({node, number, selectedId, onSelect}: RowProps) => {
  const children = blocksOf(node);

  return (
    <li>
      <button
        type="button"
        className={node.id === selectedId ? 'outline__row outline__row--active' : 'outline__row'}
        onClick={() => onSelect(node.id)}
      >
        {title(node, number)}
      </button>

      {children.length > 0 && (
        <ul className="outline__nested">
          {children.map((child, index) => (
            <Row
              key={child.id}
              node={child}
              number={`${number}.${index + 1}`}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Дерево блоков с теми же номерами, что показывает журнал: номер считается
 * по месту в дереве, а не хранится в блоке — поэтому после переноса он
 * меняется сам, и журнал с деревом всегда говорят об одном и том же.
 */
export const Outline = ({page, selectedId, onSelect}: Props) => (
  <ul className="outline">
    <li>
      <button
        type="button"
        className={selectedId === PAGE_ID ? 'outline__row outline__row--active' : 'outline__row'}
        onClick={() => onSelect(PAGE_ID)}
      >
        Страница
      </button>

      <ul className="outline__nested">
        {blocksOf(page).map((child, index) => (
          <Row
            key={child.id}
            node={child}
            number={String(index + 1)}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </li>
  </ul>
);
