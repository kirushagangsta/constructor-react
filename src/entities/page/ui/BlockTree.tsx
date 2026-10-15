import type {IHtmlNode} from '../model/types';
import {blocksOf} from '../model/selectors';
import {PAGE_ID} from '../lib/page';
import {getNodeText} from '../lib/text';

interface Props {
  page: IHtmlNode;
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Как назвать блок человеку: номер, тег и начало текста, если он есть */
const title = (node: IHtmlNode, number: string) => {
  const text = getNodeText(node).trim();

  return `${number} · ${node.tag}${text ? ` · ${text.slice(0, 20)}` : ''}`;
};

interface RowProps extends Omit<Props, 'page'> {
  node: IHtmlNode;
  number: string;
}

const Row = ({node, number, selectedId, onSelect}: RowProps) => {
  const children = blocksOf(node);

  return (
    <li>
      <button
        type="button"
        className={node.id === selectedId ? 'block-tree__row block-tree__row--active' : 'block-tree__row'}
        onClick={() => onSelect(node.id)}
      >
        {title(node, number)}
      </button>

      {children.length > 0 && (
        <ul className="block-tree__nested">
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
export const BlockTree = ({page, selectedId, onSelect}: Props) => (
  <ul className="block-tree">
    <li>
      <button
        type="button"
        className={selectedId === PAGE_ID ? 'block-tree__row block-tree__row--active' : 'block-tree__row'}
        onClick={() => onSelect(PAGE_ID)}
      >
        Страница
      </button>

      <ul className="block-tree__nested">
        {blocksOf(page).map((child, index) => (
          <Row key={child.id} node={child} number={String(index + 1)} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </li>
  </ul>
);
