import { postfix,addConcatOp } from "./parser";
import {toNFA,match} from "./nfa";

export function createMatcher(exp:string) {

    const expConcat = addConcatOp(exp);
    const postfixExp = postfix(expConcat);
    const nfa = toNFA(postfixExp);

    return (word:string) => match(nfa, word);
}

