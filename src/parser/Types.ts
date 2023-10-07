// AST based on acorn using https://astexplorer.net/
// with slight changes/alterations

import { TokenLocation } from "../lexer/Token";

// Statements
export class Statement {
    public readonly type: string = "Statement";
    constructor(public readonly location: TokenLocation) {}
}

export class EmptyStatement extends Statement {
    public readonly type = "EmptyStatement";
    constructor(public readonly location: TokenLocation) {
        super(location);
    }
}

export class DebuggerStatement extends Statement {
    public readonly type = "DebuggerStatement";
    constructor(public readonly location: TokenLocation) {
        super(location);
    }
}

export class IfStatement extends Statement  {
    public override readonly type = "IfStatement";
    constructor(public readonly test: Expression, public readonly body: Statement, public readonly location: TokenLocation) {
        super(location);
    }
}

export class WhileStatement extends Statement  {
    public override readonly type = "WhileStatement";
    constructor(public readonly test: Expression, public readonly body: Statement, public readonly location: TokenLocation) {
        super(location);
    }
}

export class BlockStatement extends Statement {
    public override readonly type = "BlockStatement";
    constructor(public readonly body: Statement[], public readonly location: TokenLocation) {
        super(location);
    }
}

export class ExpressionStatement extends Statement {
    public override readonly type = "ExpressionStatement";
    constructor(public readonly expression: Expression, public readonly location: TokenLocation) {
        super(location);
    }
}

export class FunctionArgument {
    constructor(public readonly id: Identifier, public readonly value?: Statement | Identifier | Literal) {}
}

export class FunctionDeclarationStatement extends Statement {
    public override readonly type = "FunctionDeclarationStatement";
    constructor(public readonly id: Identifier, public readonly async: boolean, public readonly generator: boolean, public readonly args: FunctionArgument[], public readonly body: BlockStatement, public readonly location: TokenLocation) {
        super(location);
    }
}

// Variables
export class VariableDeclarator {
    public readonly type = "VariableDeclarator";
    constructor(public readonly id: Identifier, public readonly init: Expression | null) {}
}

export class VariableDeclarationStatement extends Statement {
    public override readonly type = "VariableDeclarationStatement";
    constructor(public readonly kind: string, public readonly declarations: VariableDeclarator[], public readonly location: TokenLocation) {
        super(location);
    }
}

export type ArrayElement = (Expression | Statement | Identifier | Literal);

export class ArrayStatement extends Statement {
    public override readonly type = "ArrayStatement";
    constructor(public readonly children: ArrayElement[], public readonly location: TokenLocation) {
        super(location);
    }
}

export class ReturnStatement extends Statement {
    public override readonly type = "ReturnStatement";
    constructor(public readonly argument: Expression | null, public readonly location: TokenLocation) {
        super(location);
    }
}

// Expressions
export class Expression {
    public readonly type: string = "Expression";
    constructor(public readonly location: TokenLocation) {}
}

export class Identifier extends Expression {
    public readonly type = "Identifier";
    constructor(public readonly name: string, public readonly location: TokenLocation) {
        super(location);
    }
}

export class Literal extends Expression {
    public readonly type = "Literal";
    constructor(public readonly value: string | number | null, public readonly raw: string, public readonly location: TokenLocation) {
        super(location);
    }
}

export class ChainExpression extends Expression {
    public readonly type: string = "ChainExpression";
}

export class MemberExpression extends Expression {
    public readonly type: string = "MemberExpression";
    constructor(public readonly object: Identifier | MemberExpression, public readonly property: Expression, public readonly computed: boolean, public readonly optional: boolean, public readonly location: TokenLocation) {
        super(location);
    }
}

export class AssignmentExpression extends Expression {
    public readonly type: string = "AssignmentExpression";
    constructor(public readonly left: Identifier | Expression, public readonly right: Expression, public readonly location: TokenLocation) {
        super(location);
    }
}

export class ArrayExpression extends Expression {
    public override readonly type = "ArrayExpression";
    constructor(public readonly elements: ArrayElement[], public readonly location: TokenLocation) {
        super(location);
    }
}

export class Property {
    constructor(public readonly kind: string, 
                public readonly key: Identifier | Literal, 
                public readonly value: Identifier | Literal | Expression, 
                public readonly computed: boolean = false, 
                public readonly shorthand: boolean = false, 
                public readonly method: boolean = false) {}
}

export class ObjectExpression extends Expression {
    public override readonly type = "ObjectExpression";
    constructor(public readonly properties: Property[], public readonly location: TokenLocation) {
        super(location);
    }
}

export class BinaryExpression extends Expression {
    public override readonly type = "BinaryExpression";
}

export class CallExpression extends Expression {
    public override readonly type = "CallExpression";
    constructor(public readonly callee: Expression, public readonly args: any[], public readonly location: TokenLocation) {
        super(location);
    }
}

// Program
export class Program {
    constructor(public readonly body: Statement[]) {}
}