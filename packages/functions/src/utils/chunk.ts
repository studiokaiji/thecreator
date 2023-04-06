export const chunk = <T extends any[]>(array: T, size = 500): T[] =>
  array.reduce(
    (newarr, _, i) =>
      i % size ? newarr : [...newarr, array.slice(i, i + size)],
    []
  );
