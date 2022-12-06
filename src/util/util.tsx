export const BOARD_SIZE = 8;
const LOWERCASE_A_CHAR_CODE = 65;

// to be used with require.context() for the purposes of importing an entire folder of images
export function importAll(context: any) {
  const output: any = {};
  context.keys().forEach((key: string) => {
    const imageName = key.slice(2, key.lastIndexOf('.')); // remove ./ and file extension
    if (imageName) {
      output[imageName] = context(key); // output a map of filenames to image sources
    }
  });
  return output;
}

// convert rank/file coordinates to array index
export function coordsToIndex(rank: number, file: number): number {
  return rank * BOARD_SIZE + file;
}

// convert array index to rank/file coordinates
export function indexToCoords(index: number): [number, number] {
  const mod = index % BOARD_SIZE;
  return [(index - mod) / BOARD_SIZE, mod];
}

// convert array index to rank/file coordinates
export function indexToString(index: number): string {
  const [rank, fileIndex] = indexToCoords(index);
  return `${String.fromCharCode(LOWERCASE_A_CHAR_CODE + fileIndex)}${BOARD_SIZE - rank}`;
}

// convert FEN string to array index
export function stringToIndex(str: string): number {
  const [rank, file] = stringToCoords(str);
  return coordsToIndex(rank, file);
}

// convert FEN string to rank/file coordinates
export function stringToCoords(str: string): [number, number] {
  const rank = BOARD_SIZE - parseInt(str.charAt(1));
  const file = str.charCodeAt(0) - LOWERCASE_A_CHAR_CODE;
  return [rank, file];
}

// convert rank/file coordinates to FEN string 
export function coordsToString(rank: number, file: number) {
  return indexToString(coordsToIndex(rank, file));
}
