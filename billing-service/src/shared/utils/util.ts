export const parseTemplate = (
  template: string,
  values?: Record<string, string | number | any>,
): string => {
  if (!values) return template;
  return template.replace(/{{(.*?)}}/g, (_, key) => values[key]?.toString() ?? '');
};
