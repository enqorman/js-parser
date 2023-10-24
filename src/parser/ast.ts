// AST based on acorn using https://astexplorer.net/
// with slight changes/alterations

import {
	Interpreter,
	Scope,
	Value,
	_Function,

	// @ts-ignore: allowImportingTsExtensions
} from "../interpreter/interpreter.ts";

// @ts-ignore: allowImportingTsExtensions
import Token, { TokenLocation } from "../lexer/Token.ts";

export class Node {
	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	class_name() {
		return "Node";
	}
}

// Statements
export class Statement extends Node {
	constructor(public readonly location: TokenLocation) {
		super();
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "Statement";
	}
}

export class EmptyStatement extends Statement {
	constructor(public readonly location: TokenLocation) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "EmptyStatement";
	}
}

export class DebuggerStatement extends Statement {
	constructor(public readonly location: TokenLocation) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		interpreter.halt();
		return Value.of(undefined);
	}

	override class_name() {
		return "DebuggerStatement";
	}
}

export class IfStatement extends Statement {
	constructor(
		public readonly test: Expression,
		public readonly body: Statement,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "IfStatement";
	}
}

export class WhileStatement extends Statement {
	constructor(
		public readonly test: Expression,
		public readonly body: Statement,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "WhileStatement";
	}
}

export class ScopeBlock extends Node {
	constructor(public readonly body: Statement[]) {
		super();
	}

	execute(interpreter: Interpreter): Value {
		let last_value: Value = Value.of(undefined);
		for (const block of this.body) {
			if (interpreter.has_halted()) return Value.of(undefined);
			last_value = block.execute(interpreter);
		}
		return last_value;
	}

	override class_name() {
		return "ScopeBlock";
	}
}

export class BlockStatement extends ScopeBlock {
	constructor(body: Statement[], public readonly location: TokenLocation) {
		super(body);
	}

	override class_name() {
		return "BlockStatement";
	}
}

export class ExpressionStatement extends Statement {
	constructor(
		public readonly expression: Expression,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		return this.expression.execute(interpreter);
	}

	override class_name() {
		return "ExpressionStatement";
	}
}

export class FunctionArgument {
	constructor(
		public readonly id: Identifier,
		public readonly value?: Statement | Identifier | Literal,
	) {}
}

export class FunctionDeclarationStatement extends Statement {
	constructor(
		public readonly id: Identifier,
		public readonly async: boolean,
		public readonly generator: boolean,
		public readonly args: FunctionArgument[],
		public readonly body: BlockStatement,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		const _function = new _Function(this.body, this.args);
		interpreter.scope().functions().set(this.id.name, _function);
		return Value.of(_function);
	}

	override class_name() {
		return "FunctionDeclarationStatement";
	}
}

// Variables
export class VariableDeclarator {
	constructor(
		public readonly id: Identifier,
		public readonly init: Expression | null,
	) {}
}

export class VariableDeclarationStatement extends Statement {
	constructor(
		public readonly kind: string,
		public readonly declarations: VariableDeclarator[],
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		for (const decl of this.declarations) {
			const id = decl.id.name;
			let value = decl.init ? decl.init.execute(interpreter) : undefined;
			interpreter.scope().variables().set(id!, Value.of(value));
		}
		return Value.of(undefined);
	}

	override class_name() {
		return "VariableDeclarationStatement";
	}
}

export type ArrayElement = Expression | Statement | Identifier | Literal;

export class ArrayStatement extends Statement {
	constructor(
		public readonly children: ArrayElement[],
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "ArrayStatement";
	}
}

export class ReturnStatement extends Statement {
	constructor(
		public readonly argument: Expression | null,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		if (!this.argument) return Value.of(undefined);
		return this.argument.execute(interpreter);
	}

	override class_name() {
		return "ReturnStatement";
	}
}

// Expressions
export class Expression extends Node {
	constructor(public readonly location: TokenLocation) {
		super();
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "Expression";
	}
}

export class Identifier extends Expression {
	constructor(
		public readonly name: string,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		if (interpreter.scope().variables().has(this.name))
			return interpreter.scope().variables().get(this.name)!;
		return Value.of(undefined);
	}

	override class_name() {
		return "Identifier";
	}
}

export class Literal extends Expression {
	constructor(
		public readonly value: string | number | null,
		public readonly raw: string,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		return Value.of(this.value);
	}

	override class_name() {
		return "Literal";
	}
}

export class ChainExpression extends Expression {
	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "ChainExpression";
	}
}

export class MemberExpression extends Expression {
	constructor(
		public readonly object: Identifier | MemberExpression,
		public readonly property: Expression,
		public readonly computed: boolean,
		public readonly optional: boolean,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "MemberExpression";
	}
}

export class AssignmentExpression extends Expression {
	constructor(
		public readonly left: Identifier,
		public readonly right: Expression,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		const id = this.left.name;
		const value = this.right.execute(interpreter);
		interpreter.scope().variables().set(id!, Value.of(value));
		return Value.of(undefined);
	}

	override class_name() {
		return "AssignmentExpression";
	}
}

export class ArrayExpression extends Expression {
	constructor(
		public readonly elements: ArrayElement[],
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "ArrayExpression";
	}
}

export class Property {
	constructor(
		public readonly kind: string,
		public readonly key: Identifier | Literal,
		public readonly value: Identifier | Literal | Expression,
		public readonly computed: boolean = false,
		public readonly shorthand: boolean = false,
		public readonly method: boolean = false,
	) {}
}

export class ObjectExpression extends Expression {
	constructor(
		public readonly properties: Property[],
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		console.error("todo: implement execute for " + this.class_name());
		return Value.of(undefined);
	}

	override class_name() {
		return "ObjectExpression";
	}
}

export class BinaryExpression extends Expression {
	constructor(
		public readonly lhs: Expression,
		public readonly op: Token,
		public readonly rhs: Expression,
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		const lhs = this.lhs.execute(interpreter);
		const rhs = this.rhs.execute(interpreter);
		switch (this.op.raw) {
			case "+":
				return Value.of(lhs.value + rhs.value);
			case "-":
				return Value.of(lhs.value - rhs.value);
			case "/":
				return Value.of(lhs.value / rhs.value);
			case "*":
				return Value.of(lhs.value * rhs.value);
			case "%":
				return Value.of(lhs.value % rhs.value);
			default:
				throw new Error("unknown binary operation");
		}
	}

	override class_name() {
		return "BinaryExpression";
	}
}

export class CallExpression extends Expression {
	constructor(
		public readonly callee: Identifier,
		public readonly args: any[],
		public readonly location: TokenLocation,
	) {
		super(location);
	}

	execute(interpreter: Interpreter): Value {
		if (!(this.callee instanceof Identifier)) throw -1;

		const name = this.callee.name;
		if (!interpreter.scope().functions().has(name))
			throw new TypeError(name + " is not a function");
		const _function = interpreter.scope().functions().get(name)!;

		interpreter.enter_scope(new Scope());
		const scope = interpreter.scope();
		for (let i = 0; i < _function.args.length; ++i) {
			if (this.args.length == 0) break;
			const arg = _function.args[i];
			const arg_value = this.args[i].execute(interpreter);
			scope.variables().set(arg.id.name, Value.of(arg_value));
		}
		const value = _function!.body.execute(interpreter);
		interpreter.exit_scope();

		return value;
	}

	override class_name() {
		return "CallExpression";
	}
}

// Program
export class Program extends ScopeBlock {
	constructor(body: Statement[]) {
		super(body);
	}

	override class_name(): string {
		return "Program";
	}
}
