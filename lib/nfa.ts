interface state {
    isEnd:boolean,
    transition: {[key:string]:state},
    epsilonTransitions: state[]
}
interface nfa{
    start:state,
    end:state
}

function createState(isEnd:boolean):state {
    return {
        isEnd,
        transition: {},
        epsilonTransitions: []
    };
}

function addEpsilonTransition(from:state, to:state) {
    from.epsilonTransitions.push(to);
}


function addTransition(from:state, to:state, symbol:string) {
    from.transition[symbol] = to;
}


function fromEpsilon():nfa {
    const start = createState(false);
    const end = createState(true);
    addEpsilonTransition(start, end);

    return { start, end };
}


function fromSymbol(symbol:string):nfa {
    const start = createState(false);
    const end = createState(true);
    addTransition(start, end, symbol);

    return { start, end };
}


function concat(first:nfa, second:nfa):nfa {
    addEpsilonTransition(first.end, second.start);
    first.end.isEnd = false;

    return { start: first.start, end: second.end };
}


function union(first:nfa, second:nfa):nfa {
    const start = createState(false);
    addEpsilonTransition(start, first.start);
    addEpsilonTransition(start, second.start);

    const end = createState(true);

    addEpsilonTransition(first.end, end);
    first.end.isEnd = false;
    addEpsilonTransition(second.end, end);
    second.end.isEnd = false;

    return { start, end };
}



function closure(nfa:nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}



function zeroOrOne(nfa:nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    nfa.end.isEnd = false;

    return { start, end };
}



function oneOrMore(nfa:nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}


export function toNFA(postfixExp:string) {
    if (postfixExp === '') {
        return fromEpsilon();
    }

    const stack:nfa[] = [];
    
    for (const token of postfixExp) {
        if (token === '*') {
            stack.push(closure(stack.pop()!));
        } else if (token === "?") {
            stack.push(zeroOrOne(stack.pop()!));
        } else if (token === "+") {
            stack.push(oneOrMore(stack.pop()!));
        } else if (token === '|') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(union(left!, right!));
        } else if (token === '.') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(concat(left!, right!));
        } else {
            stack.push(fromSymbol(token));
        }
    }

    return stack.pop()!;
}



function addNextState(state:state, nextStates:state[], visited: Set<state>) {
    if (state.epsilonTransitions.length) {
        for (const st of state.epsilonTransitions) {
            if (!visited.has(st)) {
                visited.add(st);
                addNextState(st, nextStates, visited);
            }
        }
    } else {
        nextStates.push(state);
    }
}



function search(nfa:nfa, word:string) {
    let currentStates:state[] = [];
    
    addNextState(nfa.start, currentStates, new Set());

    for (const symbol of word) {
        const nextStates:state[] = [];
        const visited = new Set<state>();

        for (const state of currentStates) {
            const nextState = state.transition[symbol];
            if (nextState) {
                addNextState(nextState, nextStates, visited);
            }
        }

        currentStates = nextStates;
    }

    return currentStates.find(s => s.isEnd) ? true : false;
}

export function match(nfa:nfa, word:string) {
    return search(nfa, word);
}
