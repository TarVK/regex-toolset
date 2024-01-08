/**
 * The data defining the structure of an algebraic data type
 */
export type IADT = Record<string, IADTOptData>;
export type IADTOptData = {children: string[]; id: object};
