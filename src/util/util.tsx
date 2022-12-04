import { BOARD_SIZE } from "../components/Board";

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

// convert x/y coordinates to array index
export function XYToIndex(x: number, y: number): number {
  return y * BOARD_SIZE + x;
}

// convert array index to x/y coordinatess
export function indexToXY(index: number): [number, number] {
  const mod = index % BOARD_SIZE;
  return [index - mod, mod];
}