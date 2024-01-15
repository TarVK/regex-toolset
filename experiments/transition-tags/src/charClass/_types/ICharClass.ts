/**
 * A character class, built up from individual ranges
 * Invariants/conditions:
 * - ranges are sorted in increasing order of start index
 * - there is at least 2 indices difference between any two consecutive ranges a,b: a.end+1 < b.start
 */
export type ICharClass = ICharRange[];

export type ICharRange = {
    /** The unicode start index (inclusive) */
    start: number;
    /** The unicode end index (inclusive) */
    end: number;
};
