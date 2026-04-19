export function addConcatOp(exp: string) {
    let output = '';

    for (let i = 0; i < exp.length; i++) {
        const token = exp[i];
        output += token;

        if (token === '(' || token === '|') {
            continue;
        }

        if (i < exp.length - 1) {
            const lookahead = exp[i + 1];

            if (lookahead === '*' || lookahead === '?' || lookahead === '+' || lookahead === '|' || lookahead === ')') {
                continue;
            }

            output += '.';
        }
    }

    return output;
};



const operatorPrecedence: {[key:string]:number} = {
    '|': 0,
    '.': 1,
    '?': 2,
    '*': 2,
    '+': 2
};

function peek(stack: string[]) {
    return stack[stack.length - 1];
}

export function postfix(exp: string) {
    let output = '';
    const operator_stack: string[] = [];

    for (let i = 0; i < exp.length; i++) {
        const token = exp[i];

        if (token === '.' || token === '|' || token === '*' || token === '?' || token === '+') {
            while (operator_stack.length && (peek(operator_stack) !== '(')
                && (operatorPrecedence[peek(operator_stack)] >= operatorPrecedence[token])) {
                output += operator_stack.pop();
            }
            operator_stack.push(token);

        }

        else {
            if (token === '(' || token === ')') {
                if (token === '(') {
                    operator_stack.push(token);
                } else {
                    while (peek(operator_stack) !== '(') {
                        output += operator_stack.pop();
                    }
                    operator_stack.pop();
                }
            }

            else {
                output += token;
            }
        }


    }

    while (operator_stack.length) {
        output += operator_stack.pop();
    }

    return output;
};