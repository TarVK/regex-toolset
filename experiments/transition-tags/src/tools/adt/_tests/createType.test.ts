import {createType} from "../createType";

const {
    constructors: {leaf, node},
    type: TreeType,
} = createType({
    leaf: {children: [], id: {value: 0}},
    node: {children: ["left", "right"] as const, id: {}},
});

const tree = node({left: leaf({value: 4}), right: leaf({value: 4})});
