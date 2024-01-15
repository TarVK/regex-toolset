import {IADT} from "./_types/IADT";
import {TADTMapperResult} from "./_types/TADTMapperResult";
import {TADTMappers} from "./_types/TADTMappers";
import {TADTObj} from "./_types/TADTObj";

/**
 * Maps the value of an ADT to another value using the given mapping functions
 * @param value The value to be mapped
 * @param mapper A mapping function for each of the ADT constructors
 * @returns The output of the mapper function
 */
export function map<GType extends IADT, GMapper extends TADTMappers<TADTObj<GType>>>(
    value: GType,
    mapper: GMapper
): TADTMapperResult<GMapper> {
    const map = mapper[value.type as keyof GMapper];
    return map(value as any);
}
