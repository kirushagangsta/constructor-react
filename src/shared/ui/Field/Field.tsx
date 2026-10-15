import type {InputHTMLAttributes, ReactNode} from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string;
  /** Короткая пометка рядом с названием — например, откуда взялось значение */
  note?: ReactNode;
}

/**
 * Подписанное поле. Подпись обёрнута вокруг input, а не связана по id:
 * так поле остаётся доступным и без генерации уникальных идентификаторов.
 */
export const Field = ({label, note, className = '', ...rest}: Props) => (
  <label className="field">
    <span className="field__label">
      {label}
      {note}
    </span>
    <input className={`field__input ${className}`.trim()} {...rest} />
  </label>
);
