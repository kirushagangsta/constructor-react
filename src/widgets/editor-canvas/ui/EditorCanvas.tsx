import {NodeView, buildEditorCss, getBreakpoint, useEditor} from '@/entities/page';

/**
 * Холст показывает страницу такой, какой она будет на выбранной ширине.
 * Медиазапросы здесь не годятся: они смотрят на ширину окна, а не холста, —
 * поэтому стили нужной ширины собираются заранее (buildEditorCss).
 */
export const EditorCanvas = () => {
  const {state, dispatch} = useEditor();

  return (
    <div className="canvas">
      <style>{buildEditorCss(state.present, state.variant)}</style>
      <div className="canvas__sheet" style={{width: getBreakpoint(state.variant).canvasWidth}}>
        <NodeView
          node={state.present}
          selectedId={state.selectedId}
          onSelect={(id) => dispatch({type: 'select', id})}
        />
      </div>
    </div>
  );
};
