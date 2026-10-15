/**
 * Публичный вход в сущность «страница». Снаружи берут только отсюда —
 * внутренняя раскладка на model / lib / ui / config остаётся делом сущности.
 */
export type {CssDeclarations, IHtmlNode, StyleVariant} from './model/types';
export type {EditorAction, IEditorState, IHistoryStep} from './model/store';
export type {IPlacement} from './model/selectors';
export type {IBreakpoint} from './config/breakpoints';

export {createInitialState, editorReducer} from './model/store';
export {EditorProvider, useEditor} from './model/context';
export {blocksOf, findNode, placementOf} from './model/selectors';

export {createPageNode, PAGE_ID} from './lib/page';
export {getNodeText} from './lib/text';
export {buildEditorCss, buildPageCss, getNodeClass, getVariantDeclarations} from './lib/pageCss';

export {breakpoints, getBreakpoint, styleVariants} from './config/breakpoints';

export {NodeView} from './ui/NodeView';
export {BlockTree} from './ui/BlockTree';
