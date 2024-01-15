import {ICharClass} from "../../charClass/_types/ICharClass";

export type IRegex =
    | IEmpty
    | INever
    | IChar
    | IAlternation
    | IConcatenation
    | IIteration
    | ICapture;

export type IEmpty = {type: "empty"};
export type INever = {type: "never"};
export type IChar = {type: "char"; charClass: ICharClass};

export type IAlternation = {type: "alternation"; opt1: IRegex; opt2: IRegex};
export type IConcatenation = {type: "concatenation"; head: IRegex; tail: IRegex};
export type IIteration = {type: "iteration"; expr: IRegex};
export type ICapture = {type: "capture"; expr: IRegex; id: number};
