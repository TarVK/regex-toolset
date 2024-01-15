import {IADT} from "./IADT";
import {TRecMap} from "./TRecMap";

export type TADTReduceMappers<GType extends Record<string, IADT>, GOut> = {
    [K in keyof GType]: (value: TRecMap<GType[K], GType[keyof GType], GOut>) => GOut;
};
