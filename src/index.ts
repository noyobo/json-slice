type Slice = {
  dataRange: [number, number];
  contentLength: number;
  contentData: string;
};

export const createJsonSlices = (json: Object | string, sliceSize: number = 32 * 1024): Slice[] => {
  const jsonData = JSON.stringify(json);

  const slices: Slice[] = [];

  for (let i = 0; i < jsonData.length; i += sliceSize) {
    slices.push({
      dataRange: i + sliceSize < jsonData.length ? [i, i + sliceSize] : [i, jsonData.length],
      contentLength: jsonData.length,
      contentData: jsonData.substring(i, i + sliceSize),
    });
  }

  return slices;
};

export const combineJsonSlices = (slices: Slice[]): string => {
  return slices.reduce((data, slice) => {
    const {
      dataRange: [start, end],
      contentData,
      contentLength,
    } = slice;

    return data.substring(0, start) + contentData + data.substring(end, contentLength);
  }, ' '.repeat(slices[0].contentLength));
};

export const createJsonReceiver = (complete: (error: Error | null, json: null | JSON) => void) => {
  let receiveData = '';

  function push(slice: Slice) {
    const {
      dataRange: [start, end],
      contentData,
      contentLength,
    } = slice;

    if (start === 0) {
      receiveData = ' '.repeat(contentLength);
    }

    receiveData = receiveData.substring(0, start) + contentData + receiveData.substring(end, contentLength);

    if (end === contentLength) {
      try {
        complete(null, JSON.parse(receiveData));
      } catch (error) {
        complete(error as Error, null);
      }
    }
  }

  return { push };
};
