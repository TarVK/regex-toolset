export type TRecMap<GObj, GType, GOut> = {
    [K in keyof GObj]: GObj[K] extends GType
        ? GOut
        : GObj[K] extends (infer T)[]
        ? TRecArray<T, GType, GOut>[]
        : GObj[K];
};

type TRecArray<GArrayType, GType, GOut> = GArrayType extends GType ? GOut : GArrayType;
