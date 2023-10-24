// @ts-ignore: allowImportingTsExtensions
import { FunctionArgument, ScopeBlock } from "../parser/ast.ts";

export class Scope {
	private _functions: Map<string, _Function>;
	private _variables: Map<string, Value>;
	constructor() {
		this._functions = new Map();
		this._variables = new Map();
	}

	functions() {
		return this._functions;
	}

	variables() {
		return this._variables;
	}
}

export class _Function {
	constructor(
		public readonly body: ScopeBlock,
		public readonly args: FunctionArgument[],
	) {}
}

export class _Object {}

export enum ValueType {
	UNDEFINED,
	NULL,
	NUMBER,
	BOOLEAN,
	STRING,
	OBJECT,
	FUNCTION,
}

export class Value {
	constructor(public readonly type: ValueType, public readonly value: any) {}

	static of(
		data?:
			| undefined
			| null
			| number
			| boolean
			| string
			| _Object
			| _Function,
	): Value {
		const type = typeof data;
		switch (type) {
			case "undefined":
				return new Value(ValueType.UNDEFINED, undefined);
			case "number":
				return new Value(ValueType.NUMBER, data as number);
			case "boolean":
				return new Value(ValueType.STRING, data as boolean);
			case "string":
				return new Value(ValueType.STRING, data as string);
			// todo: _Object, _Function
			default: {
				if (data == null) return new Value(ValueType.NULL, null);
				else if (data instanceof _Function)
					return new Value(ValueType.FUNCTION, data);
				else if (data instanceof _Object)
					return new Value(ValueType.OBJECT, data);
				else if ((data as any) instanceof Value) return data as any;
				throw new Error("TODO: value from raw of " + type);
			}
		}
	}
}

export class Interpreter {
	private _scope_stack: Scope[];

	private has_hit_debugger: boolean;

	constructor() {
		this._scope_stack = [new Scope()];
	}

	halt() {
		this.has_hit_debugger = true;
	}

	has_halted() {
		return this.has_hit_debugger;
	}

	scope() {
		return this._scope_stack[this._scope_stack.length - 1];
	}

	global_scope() {
		return this._scope_stack[0];
	}

	enter_scope(scope: Scope) {
		this._scope_stack.push(scope);
	}

	exit_scope(): Scope | null {
		if (this._scope_stack.length == 1)
			throw new Error(
				"bro why you trying to get rid of the global scope???",
			);
		return this._scope_stack.pop()!;
	}
}
