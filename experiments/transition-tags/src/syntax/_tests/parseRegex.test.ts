import {ICharSyntax, IRegexSyntax} from "../_types/IRegexSyntax";
import {parseRegex} from "../parseRegex";

const expectParse = (text: string, result: IRegexSyntax) =>
    expect(parseRegex(text)).toEqual({
        status: true,
        value: result,
    });
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
                        expectParse(`[${negated ? "^" : ""}${tests[i]}]`, {
                            type: "charClass",
                            negated,
                            elements: [{type: name, char: trim(tests[i])}],
                        });
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
                        expectParse(
                            `[${negated ? "^" : ""}${tests[i]}-${tests[i + 1]}]`,
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
                            }
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
                    expectParse(`[${named[i]}]`, {
                        type: "charClass",
                        negated: false,
                        elements: [{type: "namedCharClass", name: named[i].charAt(1)}],
                    });
                }
                for (let i = 0; i < named.length - 1; i++) {
                    expectParse(`[${named[i]}-${named[i + 1]}]`, {
                        type: "charClass",
                        negated: false,
                        elements: [
                            {type: "namedCharClass", name: named[i].charAt(1)},
                            {type: "simpleChar", char: "-"},
                            {type: "namedCharClass", name: named[i + 1].charAt(1)},
                        ],
                    });
                    expectParse(`[^${named[i]}-${named[i + 1]}]`, {
                        type: "charClass",
                        negated: true,
                        elements: [
                            {type: "namedCharClass", name: named[i].charAt(1)},
                            {type: "simpleChar", char: "-"},
                            {type: "namedCharClass", name: named[i + 1].charAt(1)},
                        ],
                    });
                }
            });
            it("handles complex classes", () => {
                expectParse(`[a-z\\w\\[0-9]`, {
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
                });
            });
        });
        describe("character", () => {
            const testChar = (
                name: ICharSyntax["type"],
                tests: string[],
                trim: (v: string) => string = v => v
            ) => {
                for (let i = 0; i < tests.length; i++)
                    expectParse(`${tests[i]}`, {type: name, char: trim(tests[i])});
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
                    expectParse(named[i], {
                        type: "namedCharClass",
                        name: named[i].charAt(1),
                    });
            });
        });
        it("handles anyChar: .", () => expectParse(".", {type: "anyChar"}));
        it("handles never: $0", () => expectParse("$0", {type: "never"}));
        it("handles empty: $e", () => expectParse("$e", {type: "empty"}));
    });
    describe("iterators", () => {
        it("handles iteration: +", () => {
            expectParse("a+", {type: "iteration", expr: {type: "simpleChar", char: "a"}});
            expectParse("\\w+", {
                type: "iteration",
                expr: {type: "namedCharClass", name: "w"},
            });
        });
        it("handles optIteration: *", () =>
            expectParse("a*", {
                type: "optIteration",
                expr: {type: "simpleChar", char: "a"},
            }));
        it("handles optional: ?", () =>
            expectParse("a?", {type: "optional", expr: {type: "simpleChar", char: "a"}}));
        it("handles exact: {x}", () =>
            expectParse("a{2}", {
                type: "exactIteration",
                expr: {type: "simpleChar", char: "a"},
                amount: 2,
            }));
        it("handles min: {x,}", () =>
            expectParse("a{2,}", {
                type: "minIteration",
                expr: {type: "simpleChar", char: "a"},
                min: 2,
            }));
        it("handles min/max: {x,y}", () =>
            expectParse("a{2,5}", {
                type: "minMaxIteration",
                expr: {type: "simpleChar", char: "a"},
                min: 2,
                max: 5,
            }));
    });
    it("handles concatenation", () => {
        expectParse("ab", {
            type: "concatenation",
            head: {type: "simpleChar", char: "a"},
            tail: {type: "simpleChar", char: "b"},
        });
        expectParse("abc", {
            type: "concatenation",
            head: {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {type: "simpleChar", char: "b"},
            },
            tail: {type: "simpleChar", char: "c"},
        });
    });
    describe("alternation: ...|...", () => {
        it("handles alternation", () => {
            expectParse("a|b", {
                type: "alternation",
                opt1: {type: "simpleChar", char: "a"},
                opt2: {type: "simpleChar", char: "b"},
            });
            expectParse("a|b|c", {
                type: "alternation",
                opt1: {
                    type: "alternation",
                    opt1: {type: "simpleChar", char: "a"},
                    opt2: {type: "simpleChar", char: "b"},
                },
                opt2: {type: "simpleChar", char: "c"},
            });
        });
        it("handles empty alternation", () => {
            expectParse("a|", {
                type: "alternation",
                opt1: {type: "simpleChar", char: "a"},
                opt2: {type: "implicitEmpty"},
            });
            expectParse("|a", {
                type: "alternation",
                opt1: {type: "implicitEmpty"},
                opt2: {type: "simpleChar", char: "a"},
            });

            expectParse("a||c", {
                type: "alternation",
                opt1: {
                    type: "alternation",
                    opt1: {type: "simpleChar", char: "a"},
                    opt2: {type: "implicitEmpty"},
                },
                opt2: {type: "simpleChar", char: "c"},
            });
        });
    });
    describe("groups (?:...)", () => {
        it("handles groups", () => {
            expectParse("(?:a)", {type: "group", expr: {type: "simpleChar", char: "a"}});
        });
        it("handles empty groups", () => {
            expectParse("(?:)", {type: "group", expr: {type: "implicitEmpty"}});
        });
    });
    describe("captures (...)", () => {
        it("handles captures", () => {
            expectParse("(a)", {type: "capture", expr: {type: "simpleChar", char: "a"}});
        });
        it("handles empty captures", () => {
            expectParse("()", {type: "capture", expr: {type: "implicitEmpty"}});
        });
    });
});
describe("precedence", () => {
    it("concatenation > alternation", () => {
        expectParse("ab|a", {
            type: "alternation",
            opt1: {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {type: "simpleChar", char: "b"},
            },
            opt2: {type: "simpleChar", char: "a"},
        });
        expectParse("a|ab", {
            type: "alternation",
            opt1: {type: "simpleChar", char: "a"},
            opt2: {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {type: "simpleChar", char: "b"},
            },
        });
    });
    it("iteration > concatenation", () => {
        expectParse("ab*c", {
            type: "concatenation",
            head: {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {type: "optIteration", expr: {type: "simpleChar", char: "b"}},
            },
            tail: {type: "simpleChar", char: "c"},
        });
        expectParse("ab{2,4}c", {
            type: "concatenation",
            head: {
                type: "concatenation",
                head: {type: "simpleChar", char: "a"},
                tail: {
                    type: "minMaxIteration",
                    expr: {type: "simpleChar", char: "b"},
                    min: 2,
                    max: 4,
                },
            },
            tail: {type: "simpleChar", char: "c"},
        });
    });
    it("can use groups to change precedence", () => {
        expectParse("(?:a|a)b", {
            type: "concatenation",
            head: {
                type: "group",
                expr: {
                    type: "alternation",
                    opt1: {type: "simpleChar", char: "a"},
                    opt2: {type: "simpleChar", char: "a"},
                },
            },
            tail: {type: "simpleChar", char: "b"},
        });
        expectParse("(?:ab)*c", {
            type: "concatenation",
            head: {
                type: "optIteration",
                expr: {
                    type: "group",
                    expr: {
                        type: "concatenation",
                        head: {type: "simpleChar", char: "a"},
                        tail: {type: "simpleChar", char: "b"},
                    },
                },
            },
            tail: {type: "simpleChar", char: "c"},
        });
    });
});
it("handles complex expressions", () => {
    expectParse("#(?:\\\\.|[a-z]){4,}", {
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
    });
});
