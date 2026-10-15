import {useEditor} from '@/entities/page';

/**
 * Журнал правок. Названия шагов не задаются при каждом действии — их выдаёт
 * describeChange, сравнивая страницу до и после. Поэтому новая правка попадает
 * в журнал сама, без отдельной строчки кода под неё.
 */
export const HistoryLog = () => {
  const {state} = useEditor();

  if (state.past.length === 0 && state.future.length === 0) {
    return <p className="log__empty">Правок пока нет</p>;
  }

  return (
    <ol className="log">
      {state.past.map((step, index) => (
        <li className="log__item" key={index}>
          {step.label}
        </li>
      ))}
      {state.future.map((step, index) => (
        <li className="log__item log__item--undone" key={`future-${index}`}>
          {step.label}
        </li>
      ))}
    </ol>
  );
};
