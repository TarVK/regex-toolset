import {ICharClass} from "../_types/ICharClass";
import {
    difference,
    includes,
    intersection,
    structure,
    union,
} from "../charClassOperations";

function checkOrder(chars: ICharClass): void {
    for (let i = 0; i < chars.length - 1; i++) {
        const prev = chars[i];
        const next = chars[i + 1];
        if (prev.start > next.start)
            throw `Incorrect ordering: ${JSON.stringify(prev)}, ${JSON.stringify(next)}`;
    }
}

function checkOverlap(chars: ICharClass): void {
    for (let i = 0; i < chars.length - 1; i++) {
        const prev = chars[i];
        const next = chars[i + 1];
        if (prev.end >= next.start)
            throw `Overlapping ranges: ${JSON.stringify(prev)}, ${JSON.stringify(next)}`;
    }
}

function checkConsecutive(chars: ICharClass): void {
    for (let i = 0; i < chars.length - 1; i++) {
        const prev = chars[i];
        const next = chars[i + 1];
        if (prev.end + 1 == next.start)
            throw `Connected ranges: ${JSON.stringify(prev)}, ${JSON.stringify(next)}`;
    }
}

describe("structure", () => {
    const class1 = [
        {start: 0, end: 24},
        {start: 70, end: 90},
        {start: 12, end: 69},
    ];
    const class2 = [
        {start: 7, end: 10},
        {start: 1, end: 7},
        {start: 2, end: 3},
        {start: 11, end: 15},
    ];
    const class3 = [
        {start: 7, end: 10},
        {start: 2, end: 5},
        {start: 9, end: 12},
    ];

    it("ensures ranges are sorted", () => {
        checkOrder(structure(class1));
        checkOrder(structure(class2));
        checkOrder(structure(class3));
    });

    it("ensures ranges don't overlap", () => {
        checkOverlap(structure(class1));
        checkOverlap(structure(class2));
        checkOverlap(structure(class3));
    });

    it("ensures ranges are separated", () => {
        checkConsecutive(structure(class1));
        checkConsecutive(structure(class2));
        checkConsecutive(structure(class3));
    });
});

describe("intersection", () => {
    it("keeps sub ranges", () => {
        const class1 = [{start: 0, end: 20}];
        const class2 = [{start: 10, end: 15}];
        const class3 = [{start: 10, end: 15}];
        expect(intersection(class1, class2)).toEqual(class3);
        expect(intersection(class2, class1)).toEqual(class3);
    });
    it("keeps intersecting ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 30, end: 40},
            {start: 50, end: 60},
            {start: 70, end: 80},
        ];
        const class2 = [
            {start: 10, end: 50},
            {start: 55, end: 75},
        ];
        const class3 = [
            {start: 10, end: 20},
            {start: 30, end: 40},
            {start: 50, end: 50},
            {start: 55, end: 60},
            {start: 70, end: 75},
        ];
        expect(intersection(class1, class2)).toEqual(class3);
        expect(intersection(class2, class1)).toEqual(class3);
    });
});

describe("union", () => {
    it("interweaves ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
        ];
        const class2 = [{start: 25, end: 35}];
        const class3 = [
            {start: 0, end: 20},
            {start: 25, end: 35},
            {start: 40, end: 50},
        ];
        expect(union(class1, class2)).toEqual(class3);
        expect(union(class2, class1)).toEqual(class3);
    });
    it("combines overlapping ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
        ];
        const class2 = [{start: 15, end: 25}];
        const class3 = [
            {start: 0, end: 25},
            {start: 40, end: 50},
        ];
        expect(union(class1, class2)).toEqual(class3);
        expect(union(class2, class1)).toEqual(class3);

        const class4 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
        ];
        const class5 = [{start: 15, end: 45}];
        const class6 = [{start: 0, end: 50}];
        expect(union(class4, class5)).toEqual(class6);
        expect(union(class5, class4)).toEqual(class6);
    });
    it("combines consecutive ranges", () => {
        const class1 = [{start: 0, end: 20}];
        const class2 = [{start: 21, end: 30}];
        const class3 = [{start: 0, end: 30}];
        expect(union(class1, class2)).toEqual(class3);
        expect(union(class2, class1)).toEqual(class3);
    });
});

describe("difference", () => {
    it("ignores independent ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
        ];
        const class2 = [
            {start: 25, end: 35},
            {start: 55, end: 70},
        ];
        expect(difference(class1, class2)).toEqual(class1);
        expect(difference(class2, class1)).toEqual(class2);
    });
    it("correctly subtract ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
            {start: 70, end: 90},
        ];
        const class2 = [
            {start: 15, end: 20},
            {start: 25, end: 75},
            {start: 85, end: 89},
        ];
        const class3 = [
            {start: 0, end: 14},
            {start: 76, end: 84},
            {start: 90, end: 90},
        ];
        expect(difference(class1, class2)).toEqual(class3);
    });
});

describe("includes", () => {
    it("Deals with partial sub ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
            {start: 70, end: 80},
        ];
        const class2 = [
            {start: 0, end: 5},
            {start: 10, end: 20},
            {start: 40, end: 50},
            {start: 73, end: 78},
        ];
        expect(includes(class1, class2)).toBeTruthy();

        const class3 = [
            {start: 0, end: 5},
            {start: 10, end: 20},
            {start: 40, end: 78},
        ];
        expect(includes(class1, class3)).toBeFalsy();
    });
    it("Deals with crossing ranges", () => {
        const class1 = [
            {start: 0, end: 20},
            {start: 40, end: 50},
            {start: 70, end: 80},
        ];
        const class2 = [{start: 50, end: 50}];
        expect(includes(class1, class2)).toBeTruthy();

        const class3 = [{start: 50, end: 51}];
        expect(includes(class1, class3)).toBeFalsy();
    });
});
