import {parseRegex} from "../parseRegex";
import {stringifyRegex} from "../stringifyRegex";

describe("stringifyRegex(parseRegex(x)) = x", () => {
    const createInverseTest = (regex: string) => {
        it(`holds for "${regex}"`, () => {
            const result = parseRegex(regex);
            if (!result.status) throw result;
            expect(stringifyRegex(result.value)).toEqual(regex);
        });
    };

    createInverseTest("#(?:\\\\.|[a-z]){4,}");
    createInverseTest("([^a-z\\w]+)?text");
    createInverseTest("(word|test){2,5}\\[\\w*\\]");
});
