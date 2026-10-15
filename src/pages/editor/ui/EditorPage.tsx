import {EditorToolbar} from '@/widgets/editor-toolbar';
import {StructurePanel} from '@/widgets/structure-panel';
import {EditorCanvas} from '@/widgets/editor-canvas';
import {InspectorPanel} from '@/widgets/inspector-panel';

export const EditorPage = () => (
  <div className="editor">
    <EditorToolbar />

    <main className="editor__body">
      <StructurePanel />
      <EditorCanvas />
      <InspectorPanel />
    </main>
  </div>
);
