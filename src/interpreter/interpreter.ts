// @ts-ignore: allowImportingTsExtensions
import { ScopeBlock } from "../parser/ast.ts";

export class Scope {}

export class Value {
	constructor(public readonly value: any) {}
}

export class _Function {
	constructor(public readonly body: ScopeBlock) {}
}

export class Interpreter {
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

	enter_scope(scope) {
		/// todo
	}

	exit_scope(scope) {
		/// todo
	}
}
