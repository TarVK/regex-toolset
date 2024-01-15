import P, {Parser} from "parsimmon";
import {charClassParser, singleCharClassParser} from "./charClass/parseCharClass";
import {OPT, WS} from "../tools/parsing";
import {IRegexSyntax} from "./_types/IRegexSyntax";
import {specialCharClasses} from "../charClass/specialCharClasses";
import {specialCharCodes} from "../charClass/specialCharCodes";

const regex: Parser<IRegexSyntax> = P.lazy(() => alternation);

const group = P.seq(P.string("(?:"), regex, P.string(")")).map(([_1, expr, _2]) => ({
    type: "group" as const,
    expr,
}));
const capture = P.seq(P.string("("), regex, P.string(")")).map(([_1, expr, _2]) => ({
    type: "capture" as const,
    expr,
}));
const anyChar = P.string(".").map(() => ({type: "anyChar" as const}));
const never = P.string("$0").map(() => ({type: "never" as const}));
const empty = P.string("$e").map(() => ({type: "empty" as const}));

const namedCharClass = P.seq(
    P.string("\\"),
    P.regex(RegExp(`[${Object.keys(specialCharClasses).join("")}]`)).map(name => ({
        type: "namedCharClass" as const,
        name,
    }))
)
    .map(([_, c]) => c)
    .desc("named char class");
const simpleChar = P.regexp(/[^\[\|\]\^\$\*\+\?\\\(\)\{\}\.]/)
    .desc("literal")
    .map(char => ({type: "simpleChar" as const, char}));
const escapedLiteralChar = P.seq(
    P.string("\\"),
    P.regexp(
        RegExp(
            `[^xu${[
                ...Object.keys(specialCharCodes),
                ...Object.keys(specialCharClasses),
            ].join("")}]`
        )
    ).map(char => ({type: "escapedChar" as const, char}))
)
    .desc("literal")
    .map(([_, c]) => c);
const escapedSpecialChar = P.seq(
    P.string("\\"),
    P.regexp(RegExp(`[${Object.keys(specialCharCodes).join("")}]`)).map(char => ({
        type: "specialChar" as const,
        char,
    }))
)
    .desc("special char")
    .map(([_, c]) => c);
const doubleHexChar = P.seq(
    P.string("\\x"),
    P.regex(/[0-9a-fA-F]{2}/).map(char => ({type: "doubleHexChar" as const, char}))
)
    .desc("\\xHH")
    .map(([_, c]) => c);
const quadHexChar = P.seq(
    P.string("\\u"),
    P.regex(/[0-9a-fA-F]{4}/).map(char => ({type: "quadHexChar" as const, char}))
)
    .desc("\\uHHHH")
    .map(([_, c]) => c);
const dynamicHexChar = P.seq(
    P.string("\\u{"),
    P.regex(/[0-9a-fA-F]{1,6}/).map(char => ({type: "dynamicHexChar" as const, char})),
    P.string("}")
)
    .map(([_1, c, _2]) => c)
    .desc("\\u{HHH}");
const char = simpleChar
    .or(escapedLiteralChar)
    .or(escapedSpecialChar)
    .or(quadHexChar)
    .or(doubleHexChar)
    .or(dynamicHexChar);
const charRange = P.seq(char, P.string("-"), char).map(([start, _, end]) => ({
    type: "charRange" as const,
    start,
    end,
}));
const charClass = P.seq(
    P.string("["),
    OPT(P.string("^")),
    namedCharClass.or(charRange).or(char).many(),
    P.string("]")
).map(([_1, negate, elements, _2]) => ({
    type: "charClass" as const,
    negated: !!negate,
    elements,
}));

const base = group
    .or(capture)
    .or(anyChar)
    .or(never)
    .or(empty)
    .or(charClass)
    .or(namedCharClass)
    .or(char);

const iteration = P.seq(
    base,
    OPT(
        P.string("*")
            .or(P.string("+"))
            .or(P.string("?"))
            .or(
                P.seq(
                    P.string("{"),
                    WS,
                    P.regex(/[0-9]+/).map(text => parseInt(text)),
                    WS,
                    OPT(
                        P.seq(
                            P.string(","),
                            WS,
                            OPT(P.regex(/[0-9]+/).map(text => parseInt(text)))
                        )
                    ),
                    WS,
                    P.string("}")
                )
            )
    )
).map(([expr, iterator]) => {
    if (!iterator) return expr;
    if (iterator == "*") return {type: "optIteration" as const, expr};
    if (iterator == "+") return {type: "iteration" as const, expr};
    if (iterator == "?") return {type: "optional" as const, expr};
    const [_1, _2, min, _3, e, _4, _5] = iterator;
    if (!e) return {type: "exactIteration" as const, expr, amount: min};
    const [__1, __2, max] = e;
    if (!max) return {type: "minIteration" as const, expr, min};
    return {type: "minMaxIteration" as const, expr, min, max};
});
const concatenation = iteration
    .many()
    .map((els: IRegexSyntax[]) =>
        els.length == 0
            ? {type: "implicitEmpty" as const}
            : els.reduce((head, tail) => ({type: "concatenation" as const, head, tail}))
    );
const alternation = P.sepBy(concatenation, P.string("|")).map((els: IRegexSyntax[]) =>
    els.reduce((opt1, opt2) => ({type: "alternation" as const, opt1, opt2}))
);

/**
 * Parses the given textual representation of a regular expression
 * @param text The text representing the regular expression
 * @returns The regular expression ast
 */
export function parseRegex(text: string): P.Result<IRegexSyntax> {
    return regex.parse(text);
}
