export enum PieceType {
  Pawn = 'P',
  Knight = 'N',
  Bishop = 'B',
  Rook = 'R',
  Queen = 'Q',
  King = 'K',
}

export enum PieceColor {
  Black = 'B',
  White = 'W',
}

export interface SquareInfo {
  pieceColor?: PieceColor;
  pieceType?: PieceType;
  style?: string;
}
