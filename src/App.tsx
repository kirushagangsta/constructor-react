import {useReducer} from 'react';
import {createInitialState, editorReducer, findNode} from './store/editor';
import {getNodesPath} from './core/getNodesPath';
import {PAGE_ID} from './core/page';
import {breakpoints} from './core/breakpoints';
import type {StyleVariant} from './core/types';
import {Canvas} from './ui/Canvas';
import {Outline} from './ui/Outline';
import {Inspector} from './ui/Inspector';
import {HistoryLog} from './ui/HistoryLog';
import './styles.css';

export const App = () => {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);
  const {present: page, selectedId, variant, past, future} = state;

  const selected = findNode(page, selectedId);
  const path = getNodesPath(page, selectedId);
  const parentId = path.at(-2)?.node.id ?? PAGE_ID;
  // номер блока среди соседей идёт с единицы, а moveNode считает с нуля
  const index = (path.at(-1)?.number ?? 1) - 1;
  const isPage = selectedId === PAGE_ID;

  return (
    <div className="app">
      <header className="toolbar">
        <strong className="toolbar__brand">Конструктор</strong>

        <button type="button" onClick={() => dispatch({type: 'addBlock', parentId: selectedId})}>
          + блок внутрь
        </button>
        <button
          type="button"
          onClick={() => dispatch({type: 'addBlock', parentId: selectedId, tag: 'h2', text: 'Подзаголовок'})}
        >
          + заголовок
        </button>
        <button type="button" disabled={isPage} onClick={() => dispatch({type: 'duplicate', id: selectedId})}>
          Дублировать
        </button>
        <button type="button" disabled={isPage} onClick={() => dispatch({type: 'remove', id: selectedId})}>
          Удалить
        </button>

        <span className="toolbar__gap" />

        <button
          type="button"
          disabled={isPage || index === 0}
          onClick={() => dispatch({type: 'move', id: selectedId, parentId, index: index - 1})}
        >
          ↑ выше
        </button>
        <button
          type="button"
          disabled={isPage}
          onClick={() => dispatch({type: 'move', id: selectedId, parentId, index: index + 2})}
        >
          ↓ ниже
        </button>
        <button
          type="button"
          disabled={isPage || parentId === PAGE_ID}
          onClick={() => dispatch({type: 'move', id: selectedId, parentId: PAGE_ID, index: 0})}
        >
          ← наружу
        </button>

        <span className="toolbar__gap" />

        <button type="button" disabled={past.length === 0} onClick={() => dispatch({type: 'undo'})}>
          Отменить
        </button>
        <button type="button" disabled={future.length === 0} onClick={() => dispatch({type: 'redo'})}>
          Вернуть
        </button>

        <select
          className="toolbar__select"
          value={variant}
          onChange={(e) => dispatch({type: 'variant', variant: e.target.value as StyleVariant})}
        >
          {breakpoints.map((breakpoint) => (
            <option key={breakpoint.name} value={breakpoint.name}>
              {breakpoint.title}
            </option>
          ))}
        </select>
      </header>

      <main className="layout">
        <aside className="layout__side">
          <Outline page={page} selectedId={selectedId} onSelect={(id) => dispatch({type: 'select', id})} />
          <HistoryLog past={past} future={future} />
        </aside>

        <Canvas
          page={page}
          variant={variant}
          selectedId={selectedId}
          onSelect={(id) => dispatch({type: 'select', id})}
        />

        <aside className="layout__side layout__side--right">
          {selected && (
            <Inspector
              node={selected}
              variant={variant}
              onText={(text) => dispatch({type: 'setText', id: selectedId, text})}
              onStyle={(property, value) => dispatch({type: 'setStyle', id: selectedId, property, value})}
            />
          )}
        </aside>
      </main>
    </div>
  );
};
