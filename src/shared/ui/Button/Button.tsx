import type {ButtonHTMLAttributes} from 'react';

/**
 * Кнопка панели. type="button" по умолчанию нарочно: внутри формы
 * кнопка без типа отправляет её, а здесь все кнопки — действия, не submit.
 */
export const Button = ({type = 'button', className = '', ...rest}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type={type} className={`button ${className}`.trim()} {...rest} />
);
