import type {IHtmlNode} from './types';
import {PAGE_ID} from '../lib/page';
import {getNodesPath} from '../lib/getNodesPath';

/** Только блоки: в children вперемешку лежат узлы и текст, а текст в дереве не показываем */
export const blocksOf = (node: IHtmlNode) =>
  node.children.filter((child): child is IHtmlNode => typeof child !== 'string');

/** Узел по id. У страницы пути нет — она корень, поэтому отдельным случаем */
export const findNode = (page: IHtmlNode, id: string): IHtmlNode | undefined =>
  id === PAGE_ID ? page : getNodesPath(page, id).at(-1)?.node;

/** Где блок лежит сейчас: родитель и номер среди соседей, считая с нуля */
export interface IPlacement {
  parentId: string;
  index: number;
}

/**
 * moveNode считает место с нуля, а getNodesPath отдаёт человеческий номер
 * с единицы — перевод живёт здесь, чтобы не повторяться в каждой кнопке.
 */
export const placementOf = (page: IHtmlNode, id: string): IPlacement => {
  const path = getNodesPath(page, id);

  return {
    parentId: path.at(-2)?.node.id ?? PAGE_ID,
    index: (path.at(-1)?.number ?? 1) - 1,
  };
};
