import interpret, { memory, clearMemory, output, VariableDeclaration, Identifier, Numeral,
     BooleanLiteral, Assignment, 
     FunctionDeclation, CallExpression, UnaryExpression, 
     BinaryExpression, WhileStament, Block, ConditionalExpression, 
     PrintStatement, SubscriptExpression, ArrayLiteral, Program } from "../src/bella.js";
import { equal, deepEqual } from "assert";

// We will be using the bella memory to perfom our assertions
describe("Bella", () => {

    // Reset the memory after every test
    afterEach(() => {
        clearMemory()
        // Hacky way to clear the output
        output.length = 0
    })

    it("should save variables in memory", () => {
        const x = new VariableDeclaration(new Identifier('x'), new Numeral(10))
        const xy = new VariableDeclaration(new Identifier('yz'), new BooleanLiteral(false))
        x.interpret()
        xy.interpret()
        equal(memory.get('x'), 10)
        equal(memory.get('yz'), false)
    });

    it("should be able to assign to variables", () => {
        const x = new VariableDeclaration(new Identifier('x'), new Numeral(10))
        x.interpret()
        equal(memory.get('x'), 10)
        const xAssignment = new Assignment(new Identifier('x'), new Numeral(20))
        xAssignment.interpret()
        equal(memory.get('x'), 20)
    });

    it("should not be able to assign to variables that are not declared", () => {
        try {
            const xAssignment = new Assignment(new Identifier('x'), new Numeral(20))
            xAssignment.interpret()
        } catch (error: any) {
            equal(error.message, "Variable not declared")
        }
    });

    it("should be able to assign values of different types to variables", () => {
        new VariableDeclaration(new Identifier('x'), new Numeral(10)).interpret()
        new Assignment(new Identifier('x'), new BooleanLiteral(false)).interpret()

        equal(memory.get('x'), false)
    })

    it("should be able to declare a function and call it", () => {
        const funcDec = new FunctionDeclation(new Identifier("timesTwo"), 
            [new Identifier("x")], new BinaryExpression("*", 
                new Identifier("x"), new Numeral(2)))
        funcDec.interpret()
        const funcCall = new CallExpression(new Identifier("timesTwo"), [new Numeral(10)])
        const value = funcCall.interpret()
        equal(value as number, 20)
    })

    it("should be able to not modify global memory in a function call", () => {
        
        new VariableDeclaration(new Identifier('x'), new Numeral(10)).interpret()
        
        // Define func with param x
        const funcDec = new FunctionDeclation(new Identifier("timesTwo"), 
            [new Identifier("x")], new BinaryExpression("*", 
                new Identifier("x"), new Numeral(2)))
        funcDec.interpret()
        // call func with param 200
        const funcCall = new CallExpression(new Identifier("timesTwo"), [new Numeral(200)])
        funcCall.interpret()
        
        // Verify that X is still 10
        equal(memory.get('x'), 10)
    })

    it("should contain a predefined function", () => {
        equal(memory.has('cos'), true)
    })

    it("should be able to call a predefined function", () => {
        const cosValue = 55;
        const funcCall = new CallExpression(new Identifier("cos"), [new Numeral(cosValue)])
        const value = funcCall.interpret()
        equal(value as number, Math.cos(cosValue))
    })

    it("print an expression", () => {
        new PrintStatement(new Numeral(4342)).interpret()
        deepEqual(output, ["4342"])
    })

    it("use a while loop which can break", () => {
        const x = new Identifier("x")
        const y = new Identifier("y")

        new VariableDeclaration(x, new Numeral(0)).interpret()
        new VariableDeclaration(y, new Numeral(10)).interpret()
        
        // Loop nine times
        new WhileStament(
            new BinaryExpression("<", x, y),
            new Block([
                new Assignment(x, new BinaryExpression("+", x, new Numeral(1)))
            ])
        ).interpret()

        // Check that x is 9
        equal(memory.get('x'), 10)
    })
    
    it("Conditional Expressions", () => {
        const alternateValue = new ConditionalExpression(new BinaryExpression(">=", new Numeral(3), new Numeral(10)), new Numeral(1), new Numeral(0)).interpret()
        equal(alternateValue, 0)

        const consequentValue = new ConditionalExpression(new BinaryExpression("<=", new Numeral(3), new Numeral(10)), new Numeral(1), new Numeral(0)).interpret()
        equal(consequentValue, 1)
    })

    it("Unary Expressions should work", () => {
        // Testing negation on boolean
        const negationTrue = new UnaryExpression("!", new BooleanLiteral(true)).interpret()
        equal(negationTrue, false)

        // Testing negation on numeral
        const negationNumeral = new UnaryExpression("!", new Numeral(10)).interpret()
        equal(negationNumeral, false)
        
        const negative20 = new UnaryExpression("-", new Numeral(20)).interpret()
        equal(negative20, -20)
    })

    it("should be able to subscript into an array correctly", () => {
        const array = new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)])
        const valueAtIndex1 = new SubscriptExpression(array, new Numeral(1)).interpret()

        equal(valueAtIndex1, 2)
    })

    it("should throw an error if trying to index into a function declations", () => {
        const funcDec = new FunctionDeclation(new Identifier("timesTwo"), 
            [new Identifier("x")], new BinaryExpression("*", 
                new Identifier("x"), new Numeral(2))).interpret()
        try {
            const valueAtIndex1 = new SubscriptExpression(new Identifier("timesTwo"), new Numeral(1)).interpret()
        } catch (error: any) {
            equal(error.message, "Cannot subscript a function")
        }
    })
    
    it('Binary Expressions: mathematical operators should work', function() {
        const addition = new BinaryExpression('+', new Numeral(45), new Numeral(40)).interpret();
        equal(addition, 85);

        const subtraction = new BinaryExpression('-', new Numeral(45), new Numeral(40)).interpret();
        equal(subtraction, 5);

        const multiplication = new BinaryExpression('*', new Numeral(2), new Numeral(3)).interpret();
        equal(multiplication, 6);

        const division = new BinaryExpression('/', new Numeral(45), new Numeral(5)).interpret();
        equal(division, 9);

        const modulo = new BinaryExpression('%', new Numeral(10), new Numeral(10)).interpret();
        equal(modulo, 0);

        const exponentiation = new BinaryExpression('**', new Numeral(2), new Numeral(2)).interpret();
        equal(exponentiation, 4);
    });

    it('Binary Expressions: should return true for binary ==, !=, <, <=, >, >=, &&, ||', function() {
        const equalityNumeral = new BinaryExpression('==', new Numeral(45), new Numeral(45)).interpret();
        equal(equalityNumeral, true);

        const notEqual = new BinaryExpression('!=', new Numeral(40), new Numeral(45)).interpret();
        equal(notEqual, true);

        const lessThan = new BinaryExpression('<', new Numeral(40), new Numeral(45)).interpret();
        equal(lessThan, true);

        const LessThanOrEqual = new BinaryExpression('<=', new Numeral(40), new Numeral(45)).interpret();
        equal(LessThanOrEqual, true);

        const GreaterThan = new BinaryExpression('>', new Numeral(60), new Numeral(45)).interpret();
        equal(GreaterThan, true);

        const GreaterThanOrEqual = new BinaryExpression('>=', new Numeral(70), new Numeral(45)).interpret();
        equal(GreaterThanOrEqual, true);

        const andOperator = new BinaryExpression('&&', new BooleanLiteral(true), new Numeral(1)).interpret();
        equal(andOperator, true);

        const orOperator = new BinaryExpression('||', new BooleanLiteral(true), new BooleanLiteral(false)).interpret();
        equal(orOperator, true);
    });

    it('should return false for for binary ==, !=, <, <=, >, >=, &&, ||', function() {
        const equalityNumeral = new BinaryExpression('==', new Numeral(30), new Numeral(45)).interpret();
        equal(equalityNumeral, false);

        const notEqual = new BinaryExpression('!=', new Numeral(40), new Numeral(40)).interpret();
        equal(notEqual, false);

        const lessThan = new BinaryExpression('<', new Numeral(50), new Numeral(45)).interpret();
        equal(lessThan, false);

        const LessThanOrEqual = new BinaryExpression('<=', new Numeral(60), new Numeral(45)).interpret();
        equal(LessThanOrEqual, false);

        const GreaterThan = new BinaryExpression('>', new Numeral(40), new Numeral(45)).interpret();
        equal(GreaterThan, false);

        const GreaterThanOrEqual = new BinaryExpression('>=', new Numeral(30), new Numeral(45)).interpret();
        equal(GreaterThanOrEqual, false);

        new VariableDeclaration(new Identifier('trueBool'), new BooleanLiteral(true)).interpret()

        const andOperator = new BinaryExpression('&&', new Identifier('trueBool'), new Numeral(1)).interpret();
        equal(andOperator, true);

        const orOperator = new BinaryExpression('||', new BooleanLiteral(false), new BooleanLiteral(false)).interpret();
        equal(orOperator, false);
    });

    it("should be able to interpret a whole program correctly", () => {
        const x = new Identifier("x")
        const y = new Identifier("y")
        const programTest = new Program(
            new Block([
                new VariableDeclaration(x, new Numeral(5)),
                new VariableDeclaration(y, new Numeral(10)),
                new PrintStatement(new BinaryExpression('*', x, y)),
                new WhileStament(
                    new BinaryExpression("<", x, y),
                    new Block([
                        new Assignment(x, new BinaryExpression("+", x, new Numeral(1))),
                        new PrintStatement(x)
                    ])
                )
            ])
        )
        interpret(programTest)
        deepEqual(output, [50, 6, 7, 8, 9, 10])
    })
})