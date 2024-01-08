import {IADTNode} from "./IADTNode";

export type TADTConstructor<
    GName extends string,
    GChildren extends string[],
    GData extends object,
    GNode extends IADTNode<string, object>
> = (
    data: TADTNodeData<GChildren, GData, GNode>
) => IADTNode<GName, TADTNodeData<GChildren, GData, GNode>>;
export type TADTNodeData<
    GChildren extends string[],
    GData extends object,
    GNode extends IADTNode<string, object>
> = {
    [K in keyof GData]: K extends GChildren[number]
        ? GData[K] extends []
            ? GNode[]
            : GData[K]
        : GData[K];
} & {[K in GChildren[number]]: K extends keyof GData ? unknown : GNode};
