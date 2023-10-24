import {
	Identifier,
	Statement,
	ReturnStatement,
	VariableDeclarationStatement,
	Expression,
	Literal,
	ExpressionStatement,
	CallExpression,
	Program,
	VariableDeclarator,
	EmptyStatement,
	BlockStatement,
	FunctionArgument,
	MemberExpression,
	AssignmentExpression,
	IfStatement,
	WhileStatement,
	DebuggerStatement,
	ArrayExpression,
	ArrayElement,
	FunctionDeclarationStatement,
	BinaryExpression,
	// @ts-ignore: allowImportingTsExtensions
} from "./ast.ts";

// @ts-ignore: allowImportingTsExtensions
import Token, { TokenLocation } from "../lexer/Token.ts";

// @ts-ignore: allowImportingTsExtensions
import { TokenType } from "../lexer/Token.ts";

// @ts-ignore: allowImportingTsExtensions
import Lexer from "../lexer/lexer.ts";

export default class Parser {
	private tokens: Token[];
	private previous?: Token;
	private cursor: number;
	constructor(lexer: Token[] | Lexer) {
		if (lexer instanceof Lexer) {
			this.tokens = [];
			for (;;) {
				const token: Token | null = lexer.next_token();
				if (!token) break;
				this.tokens.push(token);
			}
		} else this.tokens = lexer; // lexer is Tokens, i hate ts constructors
		this.cursor = 0;
	}

	private is_eof(): boolean {
		return this.cursor >= this.tokens.length;
	}

	private current(): Token | null {
		if (this.is_eof()) return null;
		return this.tokens[this.cursor];
	}

	private peek(): Token {
		if (this.cursor + 1 >= this.tokens.length)
			throw new Error("[Parser] EOF hit which is unexpected");
		return this.tokens[this.cursor + 1];
	}

	private try_consume(type: TokenType, data?: string): boolean | null {
		const tok = this.tokens.shift();
		if (!tok) return false;

		if (tok.type != type && data && tok.data !== data) {
			this.tokens.unshift(tok);
			return false;
		}

		this.previous = tok;
		return true;
	}

	private consume(type?: TokenType, data?: string | number): Token | null {
		if (this.is_eof()) return null;
		const current = this.current();
		if (!current) return null;
		type = type ?? current.type;
		data = data ?? current.data;
		if (current.type != type) return null;
		if (data && current.data != data) return null;
		this.previous = this.tokens.shift()!;
		return current;
	}

	private parse_function_statement(): FunctionDeclarationStatement | null {
		const current = this.current()!;

		const is_async = this.consume(TokenType.Keyword, "async") != null;
		if (!this.consume(TokenType.Keyword, "function")) {
			console.error(
				"[Parser::parse_function_statement] Expected keyword 'function'",
			);
			return null;
		}

		const is_generator = this.consume(TokenType.Asterisk) != null;

		const id = this.consume(TokenType.Identifier);
		if (!id) {
			console.error(
				"[Parser::parse_function_statement] Expected function name",
			);
			return null;
		}

		const params = this.parse_function_args_list();
		const body = this.parse_block_statement();
		if (!body) {
			console.error(
				"[Parser::parse_function_statement] Failed to parse body",
			);
			return null;
		}

		return new FunctionDeclarationStatement(
			new Identifier(id.data as string, id.location),
			is_async,
			is_generator,
			params!,
			body,
			current.location,
		);
	}

	private parse_function_args_list(): FunctionArgument[] | null {
		if (!this.try_consume(TokenType.OpenParen)) {
			console.error(
				"[Parser::parse_function_args_list] Expected open paren whilst parsing args list",
			);
			return null;
		}

		const args: FunctionArgument[] = [];
		while (this.current() && this.current()!.type != TokenType.CloseParen) {
			const identifier = this.parse_identifier();
			if (!identifier) {
				console.error(
					"[Parser::parse_function_args_list] Failed to parse identifier",
				);
				return null;
			}

			let value: Statement | null = null;
			if (this.consume(TokenType.Equal)) {
				value = this.parse_statement();
				if (!value) {
					console.error(
						`[Parser::parse_function_args_list] Failed to parse default value for argument '${identifier.name}'`,
					);
					return null;
				}
			}
			args.push(new FunctionArgument(identifier, value!));

			if (this.consume(TokenType.Comma)) continue;

			break;
		}

		if (!this.try_consume(TokenType.CloseParen)) {
			console.error(
				"[Parser::parse_function_args_list] Expected close paren whilst parsing args list",
			);
			return null;
		}

		return args;
	}

	private parse_identifier(): Identifier | null {
		const current = this.current();
		if (!current) {
			console.error(
				"[Parser::parse_identifier] Failed to get current token.",
			);
			return null;
		}
		if (!this.try_consume(TokenType.Identifier)) {
			console.error(
				"[Parser::parse_identifier] Expected identifier got " +
					current.type,
			);
			return null;
		}
		return new Identifier(current.data as string, current.location);
	}

	private parse_literal(): Literal | null {
		const current = this.current();
		if (!current) {
			console.error(
				"[Parser::parse_literal] Failed to get current token.",
			);
			return null;
		}
		if (
			!this.try_consume(TokenType.Number) ||
			(this.current()!.type != TokenType.Identifier &&
				typeof current.data == "string" &&
				current.data != "true" &&
				current.data != "false" &&
				current.data != "null")
		) {
			console.error(
				`[Parser::parse_literal] Expected either number or identifier but got '${current.type}'`,
			);
			return null;
		}
		return new Literal(current.data, current.raw, current.location);
	}

	private parse_block_statement(): BlockStatement | null {
		const obracket = this.consume(TokenType.OpenBracket);
		if (!obracket) {
			console.error(
				"[Parser::parse_block_statement] Expected open bracket whilst parsing block statement",
			);
			return null;
		}

		const body: Statement[] = [];
		while (
			!this.is_eof() &&
			this.current()!.type != TokenType.CloseBracket
		) {
			const statement = this.parse_statement();
			if (!statement) return null;
			body.push(statement);
		}

		if (!this.consume(TokenType.CloseBracket)) {
			console.error(
				"[Parser::parse_block_statement] Expected close bracket whilst parsing block statement",
			);
			return null;
		}

		return new BlockStatement(body, obracket.location);
	}

	private parse_return_statement(): ReturnStatement | null {
		if (!this.try_consume(TokenType.Keyword, "return")) {
			console.error(
				"[Parser::parse_return_statement] expected word 'return'",
			);
			return null;
		}

		const current = this.current();
		if (
			current!.type == TokenType.Semicolon ||
			current!.type == TokenType.CloseBracket
		) {
			return new ReturnStatement(null, current!.location);
		}

		const expression = this.parse_expression();
		if (!expression) {
			console.error(
				"[Parser::parse_return_statement] expected expression",
			);
			return null;
		}

		return new ReturnStatement(expression, current!.location);
	}

	private parse_variable_declarator(): VariableDeclarator | null {
		const name = this.parse_identifier();
		if (!name) {
			console.error(
				"[Parser::parse_variable_declarator] Failed to parse variable name",
			);
			return null;
		}

		if (!this.consume(TokenType.Equal)) {
			// empty variable
			return new VariableDeclarator(name, null);
		}

		const init = this.parse_expression();
		if (!init) {
			console.error(
				`[Parser::parse_variable_declarator] Failed to parse value for variable '${name.name}'`,
			);
			return null;
		}

		return new VariableDeclarator(name, init);
	}

	private parse_variable_declaration(): VariableDeclarationStatement | null {
		const current = this.current()!;
		const kind = this.consume(TokenType.Keyword, current.data as string);
		if (!kind) {
			console.error(
				"[Parser::parse_variable_declaration] woopdee fucking doo, where tf the keyword go?",
			);
			return null;
		}

		const declarations: VariableDeclarator[] = [];
		while (!this.is_eof() && this.current()!.type != TokenType.Semicolon) {
			const declarator = this.parse_variable_declarator();
			if (!declarator) return null;
			declarations.push(declarator);
			if (this.consume(TokenType.Comma)) continue;
			break;
		}

		return new VariableDeclarationStatement(
			kind.data as string,
			declarations,
			current.location,
		);
	}

	private parse_array_expression(): ArrayExpression | null {
		const osbracket = this.consume(TokenType.OpenSquareBracket);
		if (!osbracket) {
			console.error(
				"[Parser::parse_array_expression] Expected open square bracket '[' whilst parsing array",
			);
			return null;
		}

		const elements: ArrayElement[] = [];
		while (
			!this.is_eof() &&
			this.current()!.type != TokenType.CloseSquareBracket
		) {
			if (this.current()!.type == TokenType.Comma) {
				const comma = this.consume(TokenType.Comma);
				elements.push(new EmptyStatement(comma!.location));
				continue;
			}

			const expr = this.parse_expression();
			if (!expr) {
				console.error(
					"[Parser::parse_array_expression] Failed to parse expression whilst parsing array",
				);
				return null;
			}

			elements.push(expr);

			if (this.consume(TokenType.Comma)) continue;
		}

		if (!this.consume(TokenType.CloseSquareBracket)) {
			console.error(
				"[Parser::parse_array_expression] Expected close square bracket ']' whilst parsing array",
			);
			return null;
		}

		return new ArrayExpression(elements, osbracket.location);
	}

	private parse_member_expression(
		object?: Expression,
	): MemberExpression | CallExpression | null {
		console.log(this.previous);
		object = object ?? this.parse_expression()!;
		if (!object) {
			console.error(
				"[Parser::parse_member_expression] Expected first child",
			);
			return null;
		}

		// TODO: Fix property inheritence
		this.consume(); // [ or .

		let property = this.parse_expression();
		if (!property) {
			console.error(
				"[Parser::parse_member_expression] Expected next child",
			);
			return null;
		}

		const ret = new MemberExpression(
			object as any,
			property!,
			false,
			false,
			null!,
		);
		if (!this.is_eof() && this.current()!.type == TokenType.OpenParen)
			return this.parse_call_expression(ret);

		return ret;
	}

	private parse_assignment_expression(left?: Expression): Expression | null {
		left = left ?? this.parse_expression()!;
		if (!left) {
			console.error(
				"[Parser::parse_variable_assignment] Expected left expr",
			);
			return null;
		}

		const equals = this.consume(TokenType.Equal);
		if (!equals) {
			console.error(
				"[Parser::parse_variable_assignment] Expected equals",
			);
			return null;
		}

		const right = this.parse_expression();
		if (!right) {
			console.error(
				"[Parser::parse_variable_assignment] Expected value (to the right) for assignment",
			);
			return null;
		}

		this.consume(TokenType.Semicolon);
		return new AssignmentExpression(left, right, equals.location);
	}

	private parse_binary_expression(lhs: Expression): BinaryExpression | null {
		const op = this.consume(); // consume the op
		if (!op) {
			console.error("panic on expr not having op?");
			return null;
		}

		const rhs = this.parse_expression();
		if (!rhs) {
			console.error("Expected rhs of binary expression.");
			return null;
		}

		this.consume(TokenType.Semicolon);
		return new BinaryExpression(lhs, op, rhs, lhs.location);
	}

	private BINARY_TYPES: TokenType[] = [
		TokenType.Plus,
		TokenType.Dash,
		TokenType.Percent,
		TokenType.Slash,
	];

	private parse_expression(): Expression | null {
		if (this.is_eof()) return null;

		let current = this.current()!;
		let type = current!.type;
		let data = current!.data;

		if (this.BINARY_TYPES.includes(type)) {
			console.error("[Parser::parse_expression] TODO: unary expr");
			return null;
		}

		if (
			type == TokenType.Identifier ||
			type == TokenType.Number ||
			type == TokenType.String
		) {
			const it = this.consume()!;
			let ret: Expression;
			if (
				current.type == TokenType.Identifier &&
				data != "true" &&
				data != "false" &&
				data != "null"
			)
				ret = new Identifier(it.data as string, current!.location);
			else ret = new Literal(it.data, it.raw, current!.location);
			if (this.is_eof()) return ret;
			current = this.current()!;
			type = current.type;
			data = current.data;
			if (type == TokenType.Period)
				return this.parse_member_expression(ret);
			else if (type == TokenType.Equal)
				return this.parse_assignment_expression(ret);
			else if (type == TokenType.OpenParen)
				return this.parse_call_expression(ret);
			else if (type == TokenType.Colon) {
				console.error(
					"[Parser::parse_expression] TODO: uhh i forgot the name of expr but its like not json yknow",
				);
				return null;
			} else if (this.BINARY_TYPES.includes(type))
				return this.parse_binary_expression(ret);
			return ret;
		}

		// Array Expression
		else if (type == TokenType.OpenSquareBracket) {
			return this.parse_array_expression();
		}

		console.error(`[Parser::parse_expression] Implement expr '${type}'`);
		return null;
	}

	private parse_expression_statement(): ExpressionStatement | null {
		const expression = this.parse_expression();
		if (!expression) return null;
		this.consume(TokenType.Semicolon);
		return new ExpressionStatement(expression, expression.location);
	}

	private parse_call_expression(callee?: Expression): CallExpression | null {
		callee = callee ?? this.parse_expression()!;
		if (!callee) {
			console.error(
				"[Parser::parse_call_expression] Failed to parse, callee not found",
			);
			return null;
		}

		const oparen = this.consume(TokenType.OpenParen);
		if (!oparen) {
			console.error(
				"[Parser::parse_call_expression] Failed to parse, missing open paren",
			);
			return null;
		}

		const args: Expression[] = [];
		while (!this.is_eof() && this.current()!.type != TokenType.CloseParen) {
			const expression = this.parse_expression();
			if (!expression) {
				console.error(
					"[Parser::parse_call_expression] Failed to parse, expression in call",
				);
				return null;
			}

			args.push(expression);
			if (this.is_eof()) break;

			if (this.current()!.type == TokenType.CloseParen) break;

			if (
				this.consume(TokenType.Comma) &&
				this.current()!.type != TokenType.CloseParen
			)
				continue;

			console.error(
				"[Parser::parse_call_expression] Unexpected end of args in call",
			);
			return null;
		}

		// while (this.current().type != TokenType.CloseParen) {
		//     const expr = this.parse_expression();
		//     if (expr == null)
		//         break;

		//     args.push(expr);

		//     if (this.current()!.type == TokenType.CloseParen) {
		//         console.error("[Parser::parse_call_expression] Unexpected end of args list");
		//         return null;
		//     }

		//     if (this.current()!.type != TokenType.Comma) {
		//         console.error("[Parser::parse_call_expression] Failed to parse args list, missing comma");
		//         return null;
		//     }

		//     this.consume(TokenType.Comma);
		// }

		if (!this.consume(TokenType.CloseParen)) {
			console.error(
				"[Parser::parse_call_expression] Missing close paren",
			);
			return null;
		}

		this.consume(TokenType.Semicolon);
		return new CallExpression(callee as any, args, oparen.location);
	}

	private parse_if_statement(): IfStatement | null {
		const ifWord = this.consume(TokenType.Keyword, "if");
		if (!ifWord) {
			console.error(
				"[Parser::parse_if_statement] how did you get here??",
			);
			return null;
		}

		if (!this.consume(TokenType.OpenParen)) {
			console.error("[Parser::parse_if_statement] Expected open paren");
			return null;
		}

		const test = this.parse_expression();
		if (!test) {
			console.error(
				"[Parser::parse_if_statement] Expected test for if statement",
			);
			return null;
		}

		if (!this.consume(TokenType.CloseParen)) {
			console.error("[Parser::parse_if_statement] Expected close paren");
			return null;
		}

		let body: Statement | null;
		if (this.current()!.type == TokenType.OpenBracket)
			body = this.parse_block_statement();
		else body = this.parse_statement();

		if (!body) {
			console.error(
				"[Parser::parse_if_statement] Expected body for if statement",
			);
			return null;
		}

		return new IfStatement(test, body, ifWord.location);
	}

	private parse_while_statement(): WhileStatement | null {
		const whileWord = this.consume(TokenType.Keyword, "while");
		if (!whileWord) {
			console.error(
				"[Parser::parse_while_statement] how did you get here??",
			);
			return null;
		}

		if (!this.consume(TokenType.OpenParen)) {
			console.error(
				"[Parser::parse_while_statement] Expected open paren",
			);
			return null;
		}

		const test = this.parse_expression();
		if (!test) {
			console.error(
				"[Parser::parse_while_statement] Expected test for while statement",
			);
			return null;
		}

		if (!this.consume(TokenType.CloseParen)) {
			console.error(
				"[Parser::parse_while_statement] Expected close paren",
			);
			return null;
		}

		let body: Statement | null;
		if (this.current()!.type == TokenType.OpenBracket)
			body = this.parse_block_statement();
		else body = this.parse_statement();

		if (!body) {
			console.error(
				"[Parser::parse_while_statement] Expected body for while statement",
			);
			return null;
		}

		return new WhileStatement(test, body, whileWord.location);
	}

	private parse_statement(): Statement | null {
		if (this.is_eof()) return null;

		const current = this.current()!;
		const type = current.type;
		const data = current.data;
		const location = current.location;

		if (type == TokenType.Keyword) {
			let ret;
			if (data == "async" || data == "function")
				ret = this.parse_function_statement();
			else if (data == "return") ret = this.parse_return_statement();
			else if (data == "const" || data == "let" || data == "var")
				ret = this.parse_variable_declaration();
			else if (data == "if") ret = this.parse_if_statement();
			else if (data == "while") ret = this.parse_while_statement();
			else if (data == "debugger") {
				this.consume(TokenType.Keyword);
				ret = new DebuggerStatement(location);
			} else if (data == "do" || data == "for") {
				console.error(
					"[Parser::parse_statement] TODO: do/for statements",
				);
				throw -11;
			}
			this.consume(TokenType.Semicolon);
			if (ret) return ret;
			console.error(
				"[Parser::parse_statement] TODO: statement keyword for " + data,
			);
			return null;
		} else if (type == TokenType.OpenBracket)
			return this.parse_block_statement();
		else if (type == TokenType.Semicolon) {
			this.consume(TokenType.Semicolon);
			return new EmptyStatement(location);
		}

		return this.parse_expression_statement();
	}

	public parse(): Program | null {
		const statements: Statement[] = [];
		while (!this.is_eof()) {
			const statement = this.parse_statement();
			if (!statement) return null;
			statements.push(statement);
		}
		return new Program(statements);
	}
}
