import {createElement, type MouseEvent} from 'react';
import type {IHtmlNode} from '../core/types';
import {getNodeClass} from '../core/pageCss';
import {voidTags} from '../core/tags';

interface Props {
  node: IHtmlNode;
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Рисует узел тем тегом, который у него записан. Это не набор известных
 * компонентов: тег — это данные, поэтому createElement, а не switch по именам.
 *
 * Выделение подсвечивается классом, которого нет в стилях страницы: обводка
 * принадлежит редактору и в экспорт не попадает.
 */
export const NodeView = ({node, selectedId, onSelect}: Props) => {
  const select = (event: MouseEvent) => {
    // клик по вложенному блоку не должен заодно выделить всех его родителей
    event.stopPropagation();
    onSelect(node.id);
  };

  // class в attrs лежит по-html-ному, а React ждёт className — остальные атрибуты уходят как есть
  const {class: ownClass, ...attrs} = node.attrs;

  const props = {
    ...attrs,
    key: node.id,
    className: [getNodeClass(node), ownClass, node.id === selectedId && 'is-selected'].filter(Boolean).join(' '),
    'data-node': node.id,
    onClick: select,
  };

  if (voidTags.has(node.tag)) {
    return createElement(node.tag, props);
  }

  return createElement(
    node.tag,
    props,
    node.children.map((child) =>
      typeof child === 'string'
        ? child
        : <NodeView key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />
    )
  );
};
