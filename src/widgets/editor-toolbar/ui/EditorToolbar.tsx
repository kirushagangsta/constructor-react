import {BlockActions, MoveActions} from '@/features/block-editing';
import {HistoryControls} from '@/features/page-history';
import {BreakpointSelect} from '@/features/breakpoint-switching';

/** Верхняя панель: только композиция фич, своей логики у неё нет */
export const EditorToolbar = () => (
  <header className="toolbar">
    <strong className="toolbar__brand">Конструктор</strong>

    <BlockActions />
    <span className="toolbar__gap" />
    <MoveActions />
    <span className="toolbar__gap" />
    <HistoryControls />

    <BreakpointSelect />
  </header>
);
