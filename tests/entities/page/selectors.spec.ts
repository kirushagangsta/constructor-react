import {describe, it, expect} from 'vitest';
import {blocksOf, createPageNode, findNode, PAGE_ID, placementOf, type IHtmlNode} from '@/entities/page';

const node = (id: string, children: Array<IHtmlNode | string> = []): IHtmlNode => ({
  id,
  tag: 'div',
  styles: {},
  attrs: {},
  children,
});

const page = () => createPageNode(['текст сверху', node('a'), node('b', [node('b1')])]);

describe('blocksOf', () => {
  it('отдаёт только блоки, текст пропускает', () => {
    expect(blocksOf(page()).map((child) => child.id)).toEqual(['a', 'b']);
  });

  it('у блока без детей отдаёт пустой список', () => {
    expect(blocksOf(node('x'))).toEqual([]);
  });
});

describe('findNode', () => {
  it('находит вложенный блок', () => {
    expect(findNode(page(), 'b1')!.id).toBe('b1');
  });

  it('по id страницы отдаёт саму страницу, а не ищет её в детях', () => {
    const root = page();

    expect(findNode(root, PAGE_ID)).toBe(root);
  });

  it('про несуществующий блок честно отдаёт undefined', () => {
    expect(findNode(page(), 'нет-такого')).toBeUndefined();
  });
});

describe('placementOf', () => {
  it('переводит человеческий номер в индекс для moveNode: счёт с нуля', () => {
    expect(placementOf(page(), 'b')).toEqual({parentId: PAGE_ID, index: 1});
  });

  it('текст в нумерации не участвует — первый блок остаётся нулевым', () => {
    expect(placementOf(page(), 'a')).toEqual({parentId: PAGE_ID, index: 0});
  });

  it('у вложенного блока родитель — его блок, а не страница', () => {
    expect(placementOf(page(), 'b1')).toEqual({parentId: 'b', index: 0});
  });

  it('для страницы отдаёт нулевое место: двигать её некуда', () => {
    expect(placementOf(page(), PAGE_ID)).toEqual({parentId: PAGE_ID, index: 0});
  });
});
