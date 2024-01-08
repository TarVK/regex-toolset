export const adtType = Symbol("type");

/**
 * The type of algebraic data type values/elements/nodes
 */
export type IADTNode<GName extends String, GData extends Object> = {
    [adtType]: GName;
} & GData;
