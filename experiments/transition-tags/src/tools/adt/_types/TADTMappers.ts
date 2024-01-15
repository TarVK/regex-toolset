import {IADT} from "./IADT";

export type TADTMappers<GType extends Record<string, IADT>> = {
    [K in keyof GType]: (value: GType[K]) => any;
};
