import {breakpoints, useEditor, type StyleVariant} from '@/entities/page';

/** Выбор ширины, на которой сейчас правится страница */
export const BreakpointSelect = () => {
  const {state, dispatch} = useEditor();

  return (
    <select
      className="select"
      aria-label="Ширина экрана"
      value={state.variant}
      onChange={(event) => dispatch({type: 'variant', variant: event.target.value as StyleVariant})}
    >
      {breakpoints.map((breakpoint) => (
        <option key={breakpoint.name} value={breakpoint.name}>
          {breakpoint.title}
        </option>
      ))}
    </select>
  );
};
