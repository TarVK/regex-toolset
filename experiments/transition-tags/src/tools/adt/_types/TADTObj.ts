import {IADT} from "./IADT";

export type TADTObj<GType extends IADT> = {
    [K in GType["type"]]: GType extends {type: K} ? GType : never;
};
