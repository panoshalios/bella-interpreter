import interpret, { memory, VariableDeclaration, Identifier, Numeral,
     BooleanLiteral, Assignment, 
     FunctionDeclation, CallExpression, UnaryExpression, 
     BinaryExpression, WhileStament, Block } from "../src/bella.js";
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

    })

    it("Unary Expressions", () => {
        // const negation = new UnaryExpression("!", )
        // const negative = new UnaryExpression("-", )
    })

    it("Binary Expressions", () => {
        
    })
})

// describe("Bella Statements", () => {

// })