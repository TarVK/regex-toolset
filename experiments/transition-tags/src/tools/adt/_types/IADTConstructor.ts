import {IADTNode} from "./IADTNode";

/**
 * An algebraic data type constructor
 */
export type IADTConstructor<GName extends String, GData extends Object> = (
    data: GData
) => IADTNode<GName, GData>;
