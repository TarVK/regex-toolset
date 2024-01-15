export type IRegexSyntax =
    | IAnyCharSyntax
    | IEmptySyntax
    | IImplicitEmptySyntax
    | INeverSyntax
    | ICharClassSyntax
    | INamedCharClassSyntax
    | ICharSyntax
    | IAlternationSyntax
    | IConcatenationSyntax
    | IIterationSyntax
    | IOptIterationSyntax
    | IMinIterationSyntax
    | IMinMaxIterationSyntax
    | IExactIterationSyntax
    | IOptSyntax
    | ICaptureSyntax
    | IGroupSyntax;

export type IAnyCharSyntax = {type: "anyChar"};
export type IEmptySyntax = {type: "empty"};
export type IImplicitEmptySyntax = {type: "implicitEmpty"};
export type INeverSyntax = {type: "never"};

export type INamedCharClassSyntax = {type: "namedCharClass"; name: string};
export type ICharClassSyntax = {
    type: "charClass";
    negated: boolean;
    elements: (INamedCharClassSyntax | ICharRangeSyntax | ICharSyntax)[];
};
export type ICharRangeSyntax = {type: "charRange"; start: ICharSyntax; end: ICharSyntax};
export type ICharSyntax =
    | ISimpleCharSyntax
    | IEscapedLiteralCharSyntax
    | IEscapedSpecialCharSyntax
    | IDoubleHexCharSyntax
    | IQuadHexCharSyntax
    | IDynamicHexCharSyntax;
export type ISimpleCharSyntax = {type: "simpleChar"; char: string};
export type IEscapedLiteralCharSyntax = {type: "escapedChar"; char: string};
export type IEscapedSpecialCharSyntax = {type: "specialChar"; char: string};
export type IDoubleHexCharSyntax = {type: "doubleHexChar"; char: string};
export type IQuadHexCharSyntax = {type: "quadHexChar"; char: string};
export type IDynamicHexCharSyntax = {type: "dynamicHexChar"; char: string};

export type IAlternationSyntax = {
    type: "alternation";
    opt1: IRegexSyntax;
    opt2: IRegexSyntax;
};
export type IConcatenationSyntax = {
    type: "concatenation";
    head: IRegexSyntax;
    tail: IRegexSyntax;
};
export type IIterationSyntax = {type: "iteration"; expr: IRegexSyntax};
export type ICaptureSyntax = {type: "capture"; expr: IRegexSyntax};
export type IGroupSyntax = {type: "group"; expr: IRegexSyntax};
export type IOptIterationSyntax = {type: "optIteration"; expr: IRegexSyntax};
export type IOptSyntax = {type: "optional"; expr: IRegexSyntax};
export type IMinIterationSyntax = {
    type: "minIteration";
    expr: IRegexSyntax;
    min: number;
};
export type IMinMaxIterationSyntax = {
    type: "minMaxIteration";
    expr: IRegexSyntax;
    min: number;
    max: number;
};
export type IExactIterationSyntax = {
    type: "exactIteration";
    expr: IRegexSyntax;
    amount: number;
};
