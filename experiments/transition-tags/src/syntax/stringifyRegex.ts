import {fold} from "../tools/adt/fold";
import {ICharRangeSyntax, IRegexSyntax} from "./_types/IRegexSyntax";

/**
 * Strinigifies the given regular expression, assumes the regex to contain the appropriate groups to retain meaning when parsed
 * @param regex The regular expression to be stringified
 * @returns The given string representing the regular expression
 */
export function stringifyRegex(regex: IRegexSyntax): string {
    return fold<string>()<IRegexSyntax | ICharRangeSyntax>(regex)({
        anyChar: () => ".",
        empty: () => "$e",
        implicitEmpty: () => "",
        never: () => "$0",
        namedCharClass: ({name}) => `\\${name}`,
        simpleChar: ({char}) => char,
        escapedChar: ({char}) => `\\${char}`,
        specialChar: ({char}) => `\\${char}`,
        doubleHexChar: ({char}) => `\\x${char}`,
        quadHexChar: ({char}) => `\\u${char}`,
        dynamicHexChar: ({char}) => `\\u{${char}}`,
        charClass: ({elements, negated}) => `[${negated ? "^" : ""}${elements.join("")}]`,
        charRange: ({start, end}) => `${start}-${end}`,
        group: ({expr}) => `(?:${expr})`,
        capture: ({expr}) => `(${expr})`,
        concatenation: ({head, tail}) => `${head}${tail}`,
        alternation: ({opt1, opt2}) => `${opt1}|${opt2}`,
        iteration: ({expr}) => `${expr}+`,
        exactIteration: ({expr, amount}) => `${expr}{${amount}}`,
        minIteration: ({expr, min}) => `${expr}{${min},}`,
        minMaxIteration: ({expr, min, max}) => `${expr}{${min},${max}}`,
        optional: ({expr}) => `${expr}?`,
        optIteration: ({expr}) => `${expr}*`,
    });
}
