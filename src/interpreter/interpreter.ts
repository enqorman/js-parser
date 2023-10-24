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

export class Value {
	constructor(public readonly value: any) {}
}

export class _Function {
	constructor(
		public readonly body: ScopeBlock,
		public readonly args: FunctionArgument[],
	) {}
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
