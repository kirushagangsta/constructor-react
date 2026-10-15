import {EditorProvider} from '@/entities/page';
import {EditorPage} from '@/pages/editor';
import './styles/index.css';

export const App = () => (
  <EditorProvider>
    <EditorPage />
  </EditorProvider>
);
