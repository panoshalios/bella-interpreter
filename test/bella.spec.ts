import interpret, { memory, VariableDeclaration, Identifier, Numeral,
     BooleanLiteral, Assignment, 
     FunctionDeclation, CallExpression, UnaryExpression, BinaryExpression } from "../src/bella.js";
import { equal } from "assert";

// We will be using the bella memory to perfom our assertions
describe("Bella", () => {

    // Reset the memory after every test
    afterEach(() => {
        memory.clear()
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

    it("should be able to call a predefined function", () => {
        const funcCall = new CallExpression(new Identifier("cos"), [new Numeral(10)])
        const value = funcCall.interpret()
        equal(value as number, Math.cos(10))
    })

    
    it("Print statements", () => {
        
    })
    
    it("While statements", () => {
        
    })
    
    
    it("Conditional Expressions", () => {

    })

    it("Unary Expressions", () => {
        // const negation = new UnaryExpression("!", )
        // const negative = new UnaryExpression("-", )
    })

    it("Binary Expressions", () => {
        
    })


    it('Binary Expressions: mathematical operators should work', function() {
        const addition = new BinaryExpression('+', new Numeral(45), new Numeral(40));
        equal(addition, 85);

        const subtraction = new BinaryExpression('+', new Numeral(45), new Numeral(40));
        equal(subtraction, 5);

        const multiplication = new BinaryExpression('+', new Numeral(2), new Numeral(3));
        equal(multiplication, 6);

        const division = new BinaryExpression('+', new Numeral(45), new Numeral(5));
        equal(division, 9);

        const modulo = new BinaryExpression('%', new Numeral(10), new Numeral(10));
        equal(modulo, 0);

        const exponentiation = new BinaryExpression('**', new Numeral(2), new Numeral(2));
        equal(exponentiation, 4);
    });

    it('Binary Expressions: should return true for binary ==, !=, <, <=, >, >=, &&, ||', function() {
        const equalityString = new BinaryExpression('==', new Identifier('dog'), new Identifier('dog'));
        equal.strictEqual(equalityString, true);

        const equalityNumeral = new BinaryExpression('==', new Numeral(45), new Numeral(45));
        equal.strictEqual(equalityNumeral, true);

        const notEqual = new BinaryExpression('!=', new Numeral(40), new Numeral(45));
        equal.strictEqual(notEqual, true);

        const lessThan = new BinaryExpression('<', new Numeral(40), new Numeral(45));
        equal.strictEqual(lessThan, true);

        const LessThanOrEqual = new BinaryExpression('<=', new Numeral(40), new Numeral(45));
        equal.strictEqual(LessThanOrEqual, true);

        const GreaterThan = new BinaryExpression('>', new Numeral(60), new Numeral(45));
        equal.strictEqual(GreaterThan, true);

        const GreaterThanOrEqual = new BinaryExpression('>=', new Numeral(70), new Numeral(45));
        equal.strictEqual(GreaterThanOrEqual, true);

        const andOperator = new BinaryExpression('&&', new BooleanLiteral(true), new Numeral(1));
        equal.strictEqual(andOperator, true);

        const orOperator = new BinaryExpression('||', new BooleanLiteral(true), new BooleanLiteral(false));
        equal.strictEqual(orOperator, true);
    });

    it('should return false for for binary ==, !=, <, <=, >, >=, &&, ||', function() {
        const equalityString = new BinaryExpression('==', new Identifier('cat'), new Identifier('dog'));
        equal.strictEqual(equalityString, false);

        const equalityNumeral = new BinaryExpression('==', new Numeral(30), new Numeral(45));
        equal.strictEqual(equalityNumeral, false);

        const notEqual = new BinaryExpression('!=', new Numeral(40), new Numeral(40));
        equal.strictEqual(notEqual, false);

        const lessThan = new BinaryExpression('<', new Numeral(50), new Numeral(45));
        equal.strictEqual(lessThan, false);

        const LessThanOrEqual = new BinaryExpression('<=', new Numeral(60), new Numeral(45));
        equal.strictEqual(LessThanOrEqual, false);

        const GreaterThan = new BinaryExpression('>', new Numeral(40), new Numeral(45));
        equal.strictEqual(GreaterThan, false);

        const GreaterThanOrEqual = new BinaryExpression('>=', new Numeral(30), new Numeral(45));
        equal.strictEqual(GreaterThanOrEqual, false);

        const andOperator = new BinaryExpression('&&', new Identifier(''), new Numeral(1));
        equal.strictEqual(andOperator, false);

        const orOperator = new BinaryExpression('||', new BooleanLiteral(false), new BooleanLiteral(false));
        equal.strictEqual(orOperator, false);
    });
})

// describe("Bella Statements", () => {

// })