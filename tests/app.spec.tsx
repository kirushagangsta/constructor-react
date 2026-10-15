import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {App} from '../src/App';

const canvas = () => document.querySelector('.canvas__sheet') as HTMLElement;

describe('редактор целиком', () => {
  it('рисует страницу теми тегами, что записаны в данных', async () => {
    render(<App />);

    expect(within(canvas()).getByRole('heading', {level: 1})).toHaveTextContent('Заголовок');
    expect(canvas().querySelector('p')).toHaveTextContent('Текст абзаца');
  });

  it('клик по блоку на холсте выделяет его, а не его родителя', async () => {
    const user = userEvent.setup();
    render(<App />);

    const heading = within(canvas()).getByRole('heading', {level: 1});
    await user.click(heading);

    expect(heading).toHaveClass('is-selected');
    expect(canvas().querySelectorAll('.is-selected')).toHaveLength(1);
  });

  it('добавленный блок появляется и на холсте, и в дереве', async () => {
    const user = userEvent.setup();
    render(<App />);

    const before = canvas().querySelectorAll('[data-node]').length;
    await user.click(screen.getByRole('button', {name: '+ заголовок'}));

    expect(canvas().querySelectorAll('[data-node]')).toHaveLength(before + 1);
    expect(within(canvas()).getByRole('heading', {level: 2})).toHaveTextContent('Подзаголовок');
  });

  it('правка текста в панели сразу видна на холсте', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(canvas()).getByRole('heading', {level: 1}));
    const field = screen.getByLabelText('Текст');

    await user.clear(field);
    await user.type(field, 'Привет');

    expect(within(canvas()).getByRole('heading', {level: 1})).toHaveTextContent('Привет');
  });

  it('стиль из панели уезжает в css страницы', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(canvas()).getByRole('heading', {level: 1}));
    await user.type(screen.getByLabelText('Цвет текста'), 'red');

    expect(document.querySelector('.canvas style')!.textContent).toContain('color: red;');
  });

  it('«Отменить» возвращает страницу и гасит шаг в журнале', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', {name: '+ блок внутрь'}));
    expect(screen.getByText('Добавили блок 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Отменить'}));

    expect(screen.getByText('Добавили блок 3')).toHaveClass('log__item--undone');
    expect(canvas().querySelectorAll('[data-node]')).toHaveLength(3);
  });

  it('кнопки отмены выключены, пока отменять нечего', () => {
    render(<App />);

    expect(screen.getByRole('button', {name: 'Отменить'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Вернуть'})).toBeDisabled();
  });

  it('удалить страницу нельзя — кнопки для неё выключены', () => {
    render(<App />);

    expect(screen.getByRole('button', {name: 'Удалить'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Дублировать'})).toBeDisabled();
  });

  it('перенос меняет и холст, и номера в дереве', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(canvas().querySelector('p')!);
    await user.click(screen.getByRole('button', {name: '↑ выше'}));

    expect(canvas().firstElementChild!.firstElementChild!.tagName).toBe('P');
    expect(screen.getByRole('button', {name: /^1 · p/})).toBeInTheDocument();
  });

  it('смена ширины показывает стиль нужного варианта', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(canvas()).getByRole('heading', {level: 1}));
    await user.selectOptions(screen.getByRole('combobox'), 'lg');

    // база остаётся наследством, своё значение на 'lg' ещё не задано
    expect(screen.getByLabelText(/Размер шрифта/)).toHaveValue('');
    expect(screen.getByLabelText(/Размер шрифта/)).toHaveAttribute('placeholder', '28px');
  });
});
