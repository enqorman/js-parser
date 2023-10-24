// @ts-ignore: allowImportingTsExtensions
import { ScopeBlock } from "../parser/ast.ts";

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
	constructor(public readonly body: ScopeBlock) {}
}

export class Interpreter {
	private _scope: Scope;

	private has_hit_debugger: boolean;

	constructor() {
		this._scope = new Scope();
	}

	halt() {
		this.has_hit_debugger = true;
	}

	has_halted() {
		return this.has_hit_debugger;
	}

	scope() {
		return this._scope;
	}

	enter_scope(scope) {
		/// todo
	}

	exit_scope(scope) {
		/// todo
	}
}
