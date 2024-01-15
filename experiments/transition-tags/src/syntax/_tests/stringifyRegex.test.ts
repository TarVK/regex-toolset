import {ICharSyntax, IRegexSyntax} from "../_types/IRegexSyntax";
import {stringifyRegex} from "../stringifyRegex";

const expectStringify = (syntax: IRegexSyntax, result: string) =>
    expect(stringifyRegex(syntax)).toEqual(result);

describe("constructs", () => {
    describe("characters", () => {
        const literals = ["#", ";", "@", "a", "H", "0"];
        const specials = ["\\n", "\\f", "\\t", "\\v", "\\r"];
        const escaped = ["\\(", "\\\\", "\\]"];
        const hexShort = ["\\x14", "\\xA4", "\\x2A"];
        const hexLong = ["\\u14A2", "\\uA421", "\\u2123"];
        const hexDynamic = ["\\u{A}", "\\u{A4D}", "\\u{123F}"];
        const named = ["\\w", "\\s", "\\S"];

        describe("character classes", () => {
            const testSingle = (
                name: ICharSyntax["type"],
                tests: string[],
                trim: (v: string) => string = v => v
            ) => {
                for (let negated of [false, true]) {
                    for (let i = 0; i < tests.length; i++) {
                        expectStringify(
                            {
                                type: "charClass",
                                negated,
                                elements: [{type: name, char: trim(tests[i])}],
                            },
                            `[${negated ? "^" : ""}${tests[i]}]`
                        );
                    }
                }
            };
            const testRange = (
                name: ICharSyntax["type"],
                tests: string[],
                trim: (v: string) => string = v => v
            ) => {
                for (let negated of [false, true]) {
                    for (let i = 0; i < tests.length - 1; i++) {
                        expectStringify(
                            {
                                type: "charClass",
                                negated,
                                elements: [
                                    {
                                        type: "charRange",
                                        start: {
                                            type: name,
                                            char: trim(tests[i]),
                                        },
                                        end: {
                                            type: name,
                                            char: trim(tests[i + 1]),
                                        },
                                    },
                                ],
                            },
                            `[${negated ? "^" : ""}${tests[i]}-${tests[i + 1]}]`
                        );
                    }
                }
            };

            it("handles literal characters (x, 0, ...)", () => {
                testSingle("simpleChar", literals);
                testRange("simpleChar", literals);
            });
            it("handles special characters (\\n, \\v, ...)", () => {
                testSingle("specialChar", specials, v => v.substring(1));
                testRange("specialChar", specials, v => v.substring(1));
            });
            it("handles escaped characters (\\[, \\*, ...)", () => {
                testSingle("escapedChar", escaped, v => v.substring(1));
                testRange("escapedChar", escaped, v => v.substring(1));
            });
            it("handles short hex codes (\\xHH)", () => {
                testSingle("doubleHexChar", hexShort, v => v.substring(2));
                testRange("doubleHexChar", hexShort, v => v.substring(2));
            });
            it("handles long hex codes (\\uHHHH)", () => {
                testSingle("quadHexChar", hexLong, v => v.substring(2));
                testRange("quadHexChar", hexLong, v => v.substring(2));
            });
            it("handles dynamic hex codes (\\u{HHH}, \\u{HHHH}, ...)", () => {
                testSingle("dynamicHexChar", hexDynamic, v =>
                    v.substring(3, v.length - 1)
                );
                testRange("dynamicHexChar", hexDynamic, v =>
                    v.substring(3, v.length - 1)
                );
            });
            it("handles named character groups (\\w, \\s, ...)", () => {
                for (let i = 0; i < named.length; i++) {
                    expectStringify(
                        {
                            type: "charClass",
                            negated: false,
                            elements: [
                                {type: "namedCharClass", name: named[i].charAt(1)},
                            ],
                        },
                        `[${named[i]}]`
                    );
                }
                for (let i = 0; i < named.length - 1; i++) {
                    expectStringify(
                        {
                            type: "charClass",
                            negated: false,
                            elements: [
                                {type: "namedCharClass", name: named[i].charAt(1)},
                                {type: "simpleChar", char: "-"},
                                {type: "namedCharClass", name: named[i + 1].charAt(1)},
                            ],
                        },
                        `[${named[i]}-${named[i + 1]}]`
                    );
                    expectStringify(
                        {
                            type: "charClass",
                            negated: true,
                            elements: [
                                {type: "namedCharClass", name: named[i].charAt(1)},
                                {type: "simpleChar", char: "-"},
                                {type: "namedCharClass", name: named[i + 1].charAt(1)},
                            ],
                        },
                        `[^${named[i]}-${named[i + 1]}]`
                    );
                }
            });
            it("handles complex classes", () => {
                expectStringify(
                    {
                        type: "charClass",
                        negated: false,
                        elements: [
                            {
                                type: "charRange",
                                start: {type: "simpleChar", char: "a"},
                                end: {type: "simpleChar", char: "z"},
                            },
                            {type: "namedCharClass", name: "w"},
                            {type: "escapedChar", char: "["},
                            {
                                type: "charRange",
                                start: {type: "simpleChar", char: "0"},
                                end: {type: "simpleChar", char: "9"},
                            },
                        ],
                    },
                    `[a-z\\w\\[0-9]`
                );
            });
        });

        describe("character", () => {
            const testChar = (
                name: ICharSyntax["type"],
                tests: string[],
                trim: (v: string) => string = v => v
            ) => {
                for (let i = 0; i < tests.length; i++)
                    expectStringify({type: name, char: trim(tests[i])}, `${tests[i]}`);
            };
            it("handles literal characters (x, 0, ...)", () =>
                testChar("simpleChar", literals));
            it("handles special characters (\\n, \\v, ...)", () =>
                testChar("specialChar", specials, v => v.substring(1)));
            it("handles escaped characters (\\[, \\*, ...)", () =>
                testChar("escapedChar", escaped, v => v.substring(1)));
            it("handles short hex codes (\\xHH)", () =>
                testChar("doubleHexChar", hexShort, v => v.substring(2)));
            it("handles long hex codes (\\uHHHH)", () =>
                testChar("quadHexChar", hexLong, v => v.substring(2)));
            it("handles dynamic hex codes (\\u{HHH}, \\u{HHHH}, ...)", () =>
                testChar("dynamicHexChar", hexDynamic, v =>
                    v.substring(3, v.length - 1)
                ));
            it("handles named character groups (\\w, \\s, ...)", () => {
                for (let i = 0; i < named.length; i++)
                    expectStringify(
                        {
                            type: "namedCharClass",
                            name: named[i].charAt(1),
                        },
                        named[i]
                    );
            });
        });
        it("handles anyChar: .", () => expectStringify({type: "anyChar"}, "."));
        it("handles never: $0", () => expectStringify({type: "never"}, "$0"));
        it("handles empty: $e", () => expectStringify({type: "empty"}, "$e"));
    });
    describe("iterators", () => {
        it("handles iteration: +", () => {
            expectStringify(
                {type: "iteration", expr: {type: "simpleChar", char: "a"}},
                "a+"
            );
            expectStringify(
                {
                    type: "iteration",
                    expr: {type: "namedCharClass", name: "w"},
                },
                "\\w+"
            );
        });
        it("handles optIteration: *", () =>
            expectStringify(
                {
                    type: "optIteration",
                    expr: {type: "simpleChar", char: "a"},
                },
                "a*"
            ));
        it("handles optional: ?", () =>
            expectStringify(
                {type: "optional", expr: {type: "simpleChar", char: "a"}},
                "a?"
            ));
        it("handles exact: {x}", () =>
            expectStringify(
                {
                    type: "exactIteration",
                    expr: {type: "simpleChar", char: "a"},
                    amount: 2,
                },
                "a{2}"
            ));
        it("handles min: {x,}", () =>
            expectStringify(
                {
                    type: "minIteration",
                    expr: {type: "simpleChar", char: "a"},
                    min: 2,
                },
                "a{2,}"
            ));
        it("handles min/max: {x,y}", () =>
            expectStringify(
                {
                    type: "minMaxIteration",
                    expr: {type: "simpleChar", char: "a"},
                    min: 2,
                    max: 5,
                },
                "a{2,5}"
            ));
    });
    it("handles concatenation", () => {
        expectStringify(
            {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {type: "simpleChar", char: "b"},
            },
            "ab"
        );
        expectStringify(
            {
                type: "concatenation",
                head: {
                    type: "concatenation",
                    head: {type: "simpleChar", char: "a"},
                    tail: {type: "simpleChar", char: "b"},
                },
                tail: {type: "simpleChar", char: "c"},
            },
            "abc"
        );
    });
    describe("alternation: ...|...", () => {
        it("handles alternation", () => {
            expectStringify(
                {
                    type: "alternation",
                    opt1: {type: "simpleChar", char: "a"},
                    opt2: {type: "simpleChar", char: "b"},
                },
                "a|b"
            );
            expectStringify(
                {
                    type: "alternation",
                    opt1: {
                        type: "alternation",
                        opt1: {type: "simpleChar", char: "a"},
                        opt2: {type: "simpleChar", char: "b"},
                    },
                    opt2: {type: "simpleChar", char: "c"},
                },
                "a|b|c"
            );
        });
        it("handles empty alternation", () => {
            expectStringify(
                {
                    type: "alternation",
                    opt1: {type: "simpleChar", char: "a"},
                    opt2: {type: "implicitEmpty"},
                },
                "a|"
            );
            expectStringify(
                {
                    type: "alternation",
                    opt1: {type: "implicitEmpty"},
                    opt2: {type: "simpleChar", char: "a"},
                },
                "|a"
            );

            expectStringify(
                {
                    type: "alternation",
                    opt1: {
                        type: "alternation",
                        opt1: {type: "simpleChar", char: "a"},
                        opt2: {type: "implicitEmpty"},
                    },
                    opt2: {type: "simpleChar", char: "c"},
                },
                "a||c"
            );
        });
    });
    describe("groups (?:...)", () => {
        it("handles groups", () => {
            expectStringify(
                {type: "group", expr: {type: "simpleChar", char: "a"}},
                "(?:a)"
            );
        });
        it("handles empty groups", () => {
            expectStringify({type: "group", expr: {type: "implicitEmpty"}}, "(?:)");
        });
    });
    describe("captures (...)", () => {
        it("handles captures", () => {
            expectStringify(
                {type: "capture", expr: {type: "simpleChar", char: "a"}},
                "(a)"
            );
        });
        it("handles empty captures", () => {
            expectStringify({type: "capture", expr: {type: "implicitEmpty"}}, "()");
        });
    });
});

it("handles complex expressions", () => {
    expectStringify(
        {
            type: "concatenation",
            head: {type: "simpleChar", char: "#"},
            tail: {
                type: "minIteration",
                expr: {
                    type: "group",
                    expr: {
                        type: "alternation",
                        opt1: {
                            type: "concatenation",
                            head: {type: "escapedChar", char: "\\"},
                            tail: {type: "anyChar"},
                        },
                        opt2: {
                            type: "charClass",
                            negated: false,
                            elements: [
                                {
                                    type: "charRange",
                                    start: {type: "simpleChar", char: "a"},
                                    end: {type: "simpleChar", char: "z"},
                                },
                            ],
                        },
                    },
                },
                min: 4,
            },
        },
        "#(?:\\\\.|[a-z]){4,}"
    );
});
