// Defining the types
type PredefinedFunc = (...args: number[]) => Value
type FuncDec = [Identifier[], Expression]
type Value = number | boolean | Value[] | PredefinedFunc | FuncDec

// helper function to determine if we have a function declaration instead of just a Value[]
function isFuncDec(arg: any): arg is FuncDec {
    return Array.isArray(arg) && arg.length === 2 && Array.isArray(arg[0]) && typeof arg[1] === 'object' && arg[1] !== null;
}

// Only one memory store for all the variables.
// Global and local variables are stored in the same memory
export let memory = new Map<string, Value>()
export let output: String[] = []

export function clearMemory() {
    memory.clear()
    memory.set("π", Math.PI);
    memory.set("sqrt", (x: number) => Math.sqrt(x));
    memory.set("sin", (x: number) => Math.sin(x));
    memory.set("cos", (x: number) => Math.cos(x));
    memory.set("exp", (x: number) => Math.exp(x));
    memory.set("ln", (x: number) => Math.log2(x));
    memory.set("hypot", (x: number) => Math.hypot(x));
}


interface Statement {
    interpret(): void
}

interface Expression {
    interpret(): Value
}

export class Numeral implements Expression {
    constructor(public value: number) { }

    interpret(): Value {
        return this.value
    }
}

export class BooleanLiteral implements Expression {
    constructor(public value: boolean) { }

    interpret(): Value {
        return this.value
    }
}

export class Identifier implements Expression {
    constructor(public name: string) { }

    interpret(): Value {
        const value = memory.get(this.name)
        if (value === undefined) {
            throw new Error('Variable not declared')
        } else {
            return value
        }
    }
}

export class UnaryExpression implements Expression {
    constructor(public operator: string, public argument: Expression) { }

    interpret(): Value {
        switch (this.operator) {
            case '-':
                return -this.argument.interpret()
            case '!':
                return !this.argument.interpret()
            default:
                throw new Error('Invalid unary operator')
        }
    }
}

export class BinaryExpression implements Expression {
    constructor(public operator: string, public left: Expression, public right: Expression) { }
    interpret(): Value {
        const mathOperatos = ['+', '-', '*', '/', '%', '**']
        if (mathOperatos.includes(this.operator)) {
            const left = this.left.interpret()
            const right = this.right.interpret()

            if (typeof left !== 'number' || typeof right !== 'number') {
                throw new Error(`Invalid operand types for binary operator ${this.operator}`)
            } else {
                switch (this.operator) {
                    case '+':
                        return left + right
                    case '-':
                        return left - right
                    case '*':
                        return left * right
                    case '/':
                        return left / right
                    case '%':
                        return left % right
                    case '**':
                        return left ** right
                    default:
                        throw new Error(`Invalid binary operator ${this.operator}`)
                }
            }
        } else {
            switch (this.operator) {
                case '==':
                    return this.left.interpret() === this.right.interpret()
                case '!=':
                    return this.left.interpret() !== this.right.interpret()
                case '<':
                    return this.left.interpret() < this.right.interpret()
                case '<=':
                    return this.left.interpret() <= this.right.interpret()
                case '>':
                    return this.left.interpret() > this.right.interpret()
                case '>=':
                    return this.left.interpret() >= this.right.interpret()
                case '&&':
                    return this.left.interpret() && this.right.interpret()
                case '||':
                    return this.left.interpret() || this.right.interpret()
                default:
                    throw new Error(`Invalid binary operator ${this.operator}`)
            }
        }
    }
}

export class CallExpression implements Expression {
    constructor(public name: Identifier, public args: Expression[]) { }
    interpret(): Value {
        // Checking if the expressions 
        const func = this.name.interpret()
        // Check if the callee is either a predefined function or a user defined function
        if (typeof func === "function") {
            // Evaluating the arguments
            const evaluatedArgs = this.args.map((a) => a.interpret());

            // Loop over the evaluated arguments
            for (const param of evaluatedArgs) {
                if (typeof param !== "number") {
                    throw new Error("Invalid parameter type");
                }
            }
            // Can explicitly cast to number[] because of the check above
            return func(...evaluatedArgs as number[]);
        } else if (Array.isArray(func) && func.length === 2) {
            const [parameters, expression] = func as FuncDec

            // Checking if the number of arguments matches the number of parameters
            if (parameters.length !== this.args.length) {
                throw new Error("Invalid number of arguments");
            }

            // Create a deep copy of the memory
            const memoryCopy = new Map<string, Value>(memory)
            for (let i = 0; i < parameters.length; i++) {
                memory.set(parameters[i].name, this.args[i].interpret())
            }

            const evaluatedExpression = expression.interpret()
            // Setting the memory back
            memory = new Map<string, Value>(memoryCopy)
            return evaluatedExpression
        } else {
            throw new Error("Invalid function call");
        }
    }
}

export class ConditionalExpression implements Expression {
    constructor(public test: Expression, public consequent: Expression, public alternate: Expression) { }
    interpret(): Value {
        return this.test.interpret() ? this.consequent.interpret() : this.alternate.interpret()
    }
}

export class ArrayLiteral implements Expression {
    constructor(public elements: Expression[]) { }
    interpret(): Value {
        return this.elements.map(element => element.interpret())
    }
}

export class SubscriptExpression implements Expression {
    constructor(public array: Expression, public subscript: Expression) { }

    interpret(): Value {
        const arrayValue = this.array.interpret()
        const subscriptValue = this.subscript.interpret()
        if (typeof subscriptValue !== 'number') {
            throw new Error('Subscript must be a number')
        } else if (!Array.isArray(arrayValue)) {
            throw new Error('Subscripted value must be an array')
        } else if (subscriptValue < 0 || subscriptValue >= arrayValue.length) {
            throw new Error('Subscript is out of range');
        }

        // Checking if we are subscripting a function
        if (isFuncDec(arrayValue)) {
            throw new Error('Cannot subscript a function')
        }

        return arrayValue[subscriptValue]
    }
}

export class VariableDeclaration implements Statement {
    constructor(public id: Identifier, public expression: Expression) { }

    interpret(): void {
        if (memory.has(this.id.name)) {
            throw new Error('Variable already declared')
        }
        memory.set(this.id.name, this.expression.interpret())
    }
}

export class Assignment implements Statement {
    constructor(public id: Identifier, public expression: Expression) { }

    interpret(): void {
        const value = memory.get(this.id.name)

        if (value === undefined) {
            throw new Error('Variable not declared')
        }

        if (typeof value === 'object' || typeof value === 'function') {
            throw new Error('Can only assign to variables')
        }

        // Checking that we are trying to assign a value of the same type
        // const evaluatedExpression = this.expression.interpret()

        // if (typeof value !== typeof evaluatedExpression) {
        //     throw new Error('Cannot assign to variable of different type')
        // }

        memory.set(this.id.name, this.expression.interpret())
    }
}

export class FunctionDeclation implements Statement {
    constructor(public id: Identifier, public params: Identifier[], public expression: Expression) { }

    interpret(): void {
        if (memory.has(this.id.name)) {
            throw new Error('Function already declared')
        }
        memory.set(this.id.name, [this.params, this.expression])
    }
}

export class PrintStatement implements Statement {
    constructor(public expression: Expression) { }

    interpret(): void {
        const evaludatedExpression = this.expression.interpret()
        output.push(evaludatedExpression.toString())
        console.log(evaludatedExpression)
    }
}

export class WhileStament implements Statement {
    constructor(public test: Expression, public block: Block) { }

    interpret(): void {
        while (this.test.interpret()) {
            this.block.interpret()
        }
    }
}

export class Block {
    constructor(public statements: Statement[]) { }

    interpret() {
        for (let statement of this.statements) {
            statement.interpret()
        }
    }
}

export class Program {
    constructor(public block: Block) { }

    interpret() {
        memory.clear()
        return this.block.interpret()
    }
}

export default function interpret(program: Program): void {
    memory.clear()
    output = []
    program.interpret()
}