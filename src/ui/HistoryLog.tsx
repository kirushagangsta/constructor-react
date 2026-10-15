import type {IHistoryStep} from '../store/editor';

interface Props {
  past: IHistoryStep[];
  future: IHistoryStep[];
}

/**
 * Журнал правок. Названия шагов не задаются вручную при каждом действии —
 * их выдаёт describeChange, сравнивая страницу до и после. Поэтому любая
 * новая правка попадает в журнал сама, без отдельной строчки кода под неё.
 */
export const HistoryLog = ({past, future}: Props) => (
  <ol className="log">
    {past.map((step, index) => (
      <li className="log__item" key={index}>{step.label}</li>
    ))}
    {future.map((step, index) => (
      <li className="log__item log__item--undone" key={`future-${index}`}>{step.label}</li>
    ))}
    {past.length === 0 && future.length === 0 && <li className="log__empty">Правок пока нет</li>}
  </ol>
);
