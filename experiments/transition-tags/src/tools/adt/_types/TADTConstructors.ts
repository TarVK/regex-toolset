import {IADT} from "./IADT";
import {TADTConstructor} from "./TADTConstructor";
import {TADTNodes} from "./TADTNode";

export type TADTConstructors<GADT extends IADT> = {
    [K in keyof GADT]: GADT[K] extends {
        children: infer GChildren extends string[];
        id: infer GId extends object;
    }
        ? K extends string
            ? TADTConstructor<K, GChildren, GId, TADTNodes<GADT>>
            : never
        : never;
};
