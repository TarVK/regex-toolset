import {ICharClass} from "./_types/ICharClass";

export const anyChar: ICharClass = [{start: 0, end: 0x10ffff}];

/**
 * Makes sure that all the ranges in the class are sorted correctly, and consecutive/overlapping ranges are merged
 * @param chars The character class with ranges of arbitrary sizes and order
 * @returns The character class with all ranges meeting the proper invariants
 */
export function structure(chars: ICharClass): ICharClass {
    if (chars.length == 0) return [];

    const sorted = [...chars].sort(({start: a}, {start: b}) => a - b);
    const reduced: ICharClass = [];
    let prev = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];
        if (prev.end + 1 >= next.start) {
            if (next.end > prev.end) prev.end = next.end;
        } else {
            reduced.push(prev);
            prev = next;
        }
    }
    reduced.push(prev);
    return reduced;
}

/**
 * Creates the intersection of the given two character classes
 * @param chars1 The first character class
 * @param chars2 The second character class
 * @returns The intersection of the two character classes
 */
export function intersection(chars1: ICharClass, chars2: ICharClass): ICharClass {
    if (chars1.length == 0 || chars2.length == 0) return [];

    const [head1, ...tail1] = chars1;
    const [head2, ...tail2] = chars2;

    // head1 or head2 has no overlap with the other class
    if (head1.end < head2.start) return intersection(tail1, chars2);
    if (head2.end < head1.start) return intersection(chars1, tail2);

    // Get the overlap between the two heads
    const start = Math.max(head1.start, head2.start);
    const end = Math.min(head1.end, head2.end);
    const overlap = {start, end};

    // Add the intersection of the remainder
    if (head1.end > head2.end) return [overlap, ...intersection(chars1, tail2)];
    if (head2.end > head1.end) return [overlap, ...intersection(tail1, chars2)];
    return [overlap, ...intersection(tail1, tail2)];
}

/**
 * Creates the union of the given two character classes
 * @param chars1 The first character class
 * @param chars2 The second character class
 * @returns The union of the two character classes
 */
export function union(chars1: ICharClass, chars2: ICharClass): ICharClass {
    if (chars1.length == 0) return chars2;
    if (chars2.length == 0) return chars1;

    const [head1, ...tail1] = chars1;
    const [head2, ...tail2] = chars2;

    // head1 or head2 has no overlap with the other class
    if (head1.end + 1 < head2.start) return [head1, ...union(tail1, chars2)];
    if (head2.end + 1 < head1.start) return [head2, ...union(chars1, tail2)];

    // Get the union between the two heads
    const start = Math.min(head1.start, head2.start);
    const end = Math.max(head1.end, head2.end);
    const coverage = {start, end};

    // Add the union of the remainder (combine coverage with the tail that ensures there is no overlap with tail)
    if (head1.end > head2.end) return union([coverage, ...tail1], tail2);
    return union(tail1, [coverage, ...tail2]);
}

/**
 * Creates the difference of the given two character classes
 * @param chars1 The first character class
 * @param chars2 The second character class
 * @returns The characters in chars1 excluding the ones in chars2
 */
export function difference(chars1: ICharClass, chars2: ICharClass): ICharClass {
    if (chars1.length == 0) return [];
    if (chars2.length == 0) return chars1;

    const [head1, ...tail1] = chars1;
    const [head2, ...tail2] = chars2;

    // head1 or head2 has no overlap with the other class
    if (head1.end < head2.start) return [head1, ...difference(tail1, chars2)];
    if (head2.end < head1.start) return difference(chars1, tail2);

    // Get the included range from head1 that is before the next excluded range head2
    const out: ICharClass = [];
    if (head1.start < head2.start) out.push({start: head1.start, end: head2.start - 1});

    // Handle the remainder of the ranges
    if (head1.end > head2.end)
        out.push(
            ...difference([{start: head2.end + 1, end: head1.end}, ...tail1], tail2)
        );
    else out.push(...difference(tail1, chars2));

    return out;
}

/**
 * Creates the complement of the char class
 * @param chars The characters that are not allowed
 * @returns The character class representing all characters that are not in the passed class
 */
export function complement(chars: ICharClass): ICharClass {
    return difference(anyChar, chars);
}

/**
 * Checks whether the given character class includes the given inclusion class
 * @param chars THe character class to check
 * @param inclusion The character class
 * @returns Whether the character class char includes the character class inclusion
 */
export function includes(chars: ICharClass, inclusion: ICharClass): boolean {
    if (inclusion.length == 0) return true;
    if (chars.length == 0) return false;

    const [charsHead, ...charsTail] = chars;
    const [inclusionHead, ...inclusionTail] = inclusion;

    // charsHead or inclusionHead has no overlap with the other class
    if (charsHead.end < inclusionHead.start) return includes(charsTail, inclusion);
    if (inclusionHead.end < charsHead.start) return false;

    // Check the removed head
    if (inclusionHead.start < charsHead.start) return false;
    if (charsHead.end >= inclusionHead.end) return includes(chars, inclusionTail);
    return includes(charsTail, [
        {start: charsHead.end + 1, end: inclusionHead.end},
        ...inclusionTail,
    ]);
}

// /**
//  * Checks whether the given character class includes the given inclusion class
//  * @param chars THe character class to check
//  * @param inclusion The character class
//  * @returns Whether the character class char includes the character class inclusion
//  */
// export function includes(chars: ICharClass, inclusion: ICharClass): boolean {
//     return difference(inclusion, chars).length == 0;
// }
