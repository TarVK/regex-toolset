import {TADTMapperResults} from "./TADTMapperResults";

export type TADTMapperResult<GMapper extends Record<string, (value: any) => any>> =
    TADTMapperResults<GMapper> extends infer U ? U[keyof U] : never;
