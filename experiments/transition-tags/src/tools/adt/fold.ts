import {IADT} from "./_types/IADT";
import {TADTMapperResult} from "./_types/TADTMapperResult";
import {TADTObj} from "./_types/TADTObj";
import {TADTReduceMappers} from "./_types/TADTReduceMappers";

/**
 * Folds the value of an ADT to another value using the given fold functions
 * @param value The value to be mapped
 * @param fold A fold function for each of the ADT constructors
 * @returns The recursive output of the fold function
 */
export const fold =
    <GOut>() =>
    /**
     * Folds the value of an ADT to another value using the given fold functions
     * @param value The value to be mapped
     * @param fold A fold function for each of the ADT constructors
     * @returns The recursive output of the fold function
     */
    <GType extends IADT>(value: GType) =>
    /**
     * Folds the value of an ADT to another value using the given fold functions
     * @param fold A fold function for each of the ADT constructors
     * @returns The recursive output of the fold function
     */
    <GMapper extends TADTReduceMappers<TADTObj<GType>, GOut>>(
        fold: GMapper
    ): TADTMapperResult<GMapper> => {
        const mapEl = (el: any): any => {
            if (el && typeof el == "object") {
                if ("type" in el && (el.type as any) in fold)
                    return rec(el as any) as any;
                if (el instanceof Array) return el.map(mapEl);
            }
            return el;
        };
        const rec = (value: GType) => {
            const map = fold[value.type as keyof GMapper];
            const res = {...value};
            for (let key in res) res[key] = mapEl(res[key]);
            return map(res as any);
        };
        return rec(value) as any;
    };
