const types = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const toBytes = (size: number, type: typeof types[number]) => {
  const key = types.indexOf(type.toUpperCase() as typeof types[number]);

  if (typeof key !== 'boolean') {
    return size * 1024 ** key;
  }

  throw Error('invalid type: type must be GB/KB/MB etc.');
};
