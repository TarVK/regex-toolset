import P, {Parser} from "parsimmon";

/**
 * Creates an optional parser
 * @param parser The parser to make optional
 * @returns The parser that optionally parses the given text
 */
export function OPT<T>(parser: Parser<T>): Parser<T | undefined> {
    return P.alt(parser, P.succeed(undefined));
}

/**
 * An optional whitespace parser
 */
export const WS = P.optWhitespace;
