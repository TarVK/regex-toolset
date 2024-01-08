import {IADT} from "./IADT";
import {IADTNode} from "./IADTNode";

export type TADTNodes<GADT extends IADT> = TADTNodesMap<GADT> extends infer U
    ? U[keyof U]
    : never;
type TADTNodesMap<GADT extends IADT> = {
    [K in keyof GADT]: GADT[K] extends {
        children: infer GChildren extends string[];
        id: infer GId extends object;
    }
        ? K extends string
            ? TADTNode<K, GChildren, GId, TADTNodesMap<GADT>>
            : never
        : never;
};
type TADTNode<
    GName extends string,
    GChildren extends string[],
    GId extends object,
    GRec
> = IADTNode<
    GName,
    {
        [K in keyof GId]: K extends GChildren[number]
            ? GId[K] extends []
                ? GRec[keyof GRec][]
                : GId[K]
            : GId[K];
    } & {[K in GChildren[number]]: K extends keyof GId ? unknown : GRec[keyof GRec]}
>;
