import type {IHtmlNode, StyleVariant} from '../core/types';
import {buildEditorCss} from '../core/pageCss';
import {getBreakpoint} from '../core/breakpoints';
import {NodeView} from './NodeView';

interface Props {
  page: IHtmlNode;
  variant: StyleVariant;
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Холст показывает страницу такой, какой она будет на выбранной ширине.
 * Медиазапросы здесь не годятся — они смотрят на ширину окна, а не холста,
 * поэтому стили на нужной ширине собираются заранее (buildEditorCss).
 */
export const Canvas = ({page, variant, selectedId, onSelect}: Props) => (
  <div className="canvas">
    <style>{buildEditorCss(page, variant)}</style>
    <div className="canvas__sheet" style={{width: getBreakpoint(variant).canvasWidth}}>
      <NodeView node={page} selectedId={selectedId} onSelect={onSelect} />
    </div>
  </div>
);
