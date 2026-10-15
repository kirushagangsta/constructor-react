/**
 * Свойства, которые правятся прямо в панели. Остальное оформление живёт
 * в узле как данные и в панель не вынесено — список намеренно короткий.
 */
export const STYLE_FIELDS = [
  {property: 'width', label: 'Ширина'},
  {property: 'padding', label: 'Внутренний отступ'},
  {property: 'margin', label: 'Внешний отступ'},
  {property: 'font-size', label: 'Размер шрифта'},
  {property: 'color', label: 'Цвет текста'},
  {property: 'background', label: 'Фон'},
] as const;
