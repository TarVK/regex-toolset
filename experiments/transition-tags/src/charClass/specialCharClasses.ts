import {ICharClass, ICharRange} from "./_types/ICharClass";
import {complement, difference, includes, intersection} from "./charClassOperations";

const r = (start: string, end: string = start) => ({
    start: start.charCodeAt(0),
    end: end.charCodeAt(0),
});
export const specialCharClasses = {
    s: [r(" "), r("\n"), r("\t"), r("\r")],
    S: complement([r(" "), r("\n"), r("\t"), r("\r")]),
    w: [r("a", "z"), r("A", "Z"), r("0", "9"), r("_")],
    W: complement([r("a", "z"), r("A", "Z"), r("0", "9"), r("_")]),
    d: [r("0", "9")],
    D: complement([r("0", "9")]),
} satisfies Record<string, ICharClass>;

const reverseSorted = Object.entries(specialCharClasses)
    .map(([name, charClass]) => [charClass, name] as const)
    .sort(([a], [b]) => {
        if (includes(a, b)) return -1;
        if (includes(b, a)) return 1;
        return 0;
    });

/**
 * Combines char classes using the special char class symbols
 * @param charClass The character class to simplify
 * @returns The combined character classes
 */
export function reduceSpecialCharClasses(charClass: ICharClass): (ICharRange | string)[] {
    const out: (ICharRange | string)[] = [];
    let remainder = charClass;
    for (const [specialClass, name] of reverseSorted) {
        if (
            includes(charClass, specialClass) &&
            intersection(remainder, specialClass).length > 0
        ) {
            remainder = difference(remainder, specialClass);
            out.push(name);
            if (remainder.length == 0) break;
        }
    }
    out.push(...remainder);
    return out;
}
