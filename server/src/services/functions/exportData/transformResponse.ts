const transformResponse = (data: any[]) =>
  data.map((item) =>
    item.realType === 'blocks' && Array.isArray(item.translatableValue[0])
      ? { ...item, translatableValue: item.translatableValue[0] }
      : item
  );

export default transformResponse;
