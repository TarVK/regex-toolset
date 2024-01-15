export type TADTMapperResults<GMapper extends Record<string, (value: any) => any>> = {
    [K in keyof GMapper]: GMapper[K] extends (value: any) => infer O ? O : never;
};
