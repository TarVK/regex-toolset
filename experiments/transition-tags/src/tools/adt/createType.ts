import {IADT} from "./_types/IADT";
import {TADTConstructors} from "./_types/TADTConstructors";

export function createType<GADT extends IADT>(
    desc: GADT
): {constructors: TADTConstructors<GADT>; type: GADT} {
    return null as any;
}
