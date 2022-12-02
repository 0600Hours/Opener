import { PieceColor, PieceType } from "../components/Piece";

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
