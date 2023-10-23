// @ts-ignore: allowImportingTsExtensions
import { EmptyStatement, Expression, ExpressionStatement, FunctionDeclarationStatement, Identifier, Literal, Program, ReturnStatement, Statement } from './parser/Types.ts';

export function is_alpha(ch: string): boolean {
    const alpha = "abcdefghijklmnopqrstuvwxyz";
    return alpha.includes(ch) || alpha.toUpperCase().includes(ch) || ch == "_";
}

export function is_numeric(ch: string): boolean {
    return "0123456789".includes(ch);
}

export function is_alphanumeric(ch: string): boolean {
    return is_alpha(ch) || is_numeric(ch);
}

export function is_space(ch: string): boolean {
    return " \r\n\t".includes(ch);
}

/* ?? -- ?? -- ? CONSTRUCTION ? -- ?? -- ?? */
export function print_indent(str: string): string {
    for (let i = 0; i < 4; ++i)
        str += " ";
    return str;
}

export function print_identifier(str: string, identifier: Identifier): string {
    str += `Identifier(name=${identifier.name}, location=(${identifier.location.toString()}))`
    return str;
}

export function print_literal(str: string, literal: Literal): string {
    str += `Literal(name=${literal.value}, location=(${literal.location.toString()}))`
    return str;
}

export function print_expression(str: string, expression: Expression): string {
    if (expression instanceof Identifier) 
        str = print_identifier(str, expression as Identifier);
    else if (expression instanceof Literal) 
        str = print_literal(str, expression as Literal);
    else {
        str += `TODO[print_expression]: ${expression.type}`
    }
    return str;
}

export function print_expression_statement(str: string, expression_statement: ExpressionStatement): string {
    const expression = expression_statement.expression;
    str += "ExpressionStatement(\n";
    str = print_indent(str);
    str = print_expression(str, expression);
    str += "\n";
    str = print_indent(str);
    str += ")";
    return str;
}

export function print_function_declaration_statement(str: string, func_dcl_statement: FunctionDeclarationStatement): string {
    str = print_indent(str);
    str += "FunctionDeclarationStatement(\n";
    str = print_indent(str);
    str = print_indent(str);
    str += `id=${func_dcl_statement.id.name},\n`;
    str = print_indent(str);
    str = print_indent(str);
    str += `args=[${func_dcl_statement.args.join(', ')}],\n`;
    str = print_indent(str);
    str = print_indent(str);
    str += `async=${func_dcl_statement.async},\n`;
    str = print_indent(str);
    str = print_indent(str);
    str += `generator=${func_dcl_statement.generator},\n`;
    str = print_indent(str);
    str = print_indent(str);
    str += "body=[\n"
    str = print_indent(str);
    str = print_indent(str);
    for (let i = 0; i < func_dcl_statement.body.body.length; ++i) {
        const statement = func_dcl_statement.body.body[i];
        str = print_statement(str, statement);
    }
    str += "\n";
    str = print_indent(str);
    str = print_indent(str);
    str += "]\n";
    str = print_indent(str);
    str = print_indent(str);
    str += `location=(${func_dcl_statement.location.toString()})`;
    // func_dcl_statement.id
    // func_dcl_statement.args
    // func_dcl_statement.async
    // func_dcl_statement.body
    // func_dcl_statement.generator
    // func_dcl_statement.location
    str += "\n";
    str = print_indent(str);
    str += ")";
    return str;
}

export function print_statement(str: string, statement: Statement): string {
    if (statement instanceof ExpressionStatement) {
        str = print_indent(str);
        return print_expression_statement(str, statement as ExpressionStatement);
    } else if (statement instanceof EmptyStatement) {
        str = print_indent(str);
        str += "EmptyStatement";
    } else if (statement instanceof ReturnStatement) {
        str = print_indent(str);
        str += `ReturnStatement(value=`;
        str = print_expression(str, statement.argument!);
        str += `, location=(${statement.location.toString()}))`;
    } else if (statement instanceof FunctionDeclarationStatement) {
        str = print_function_declaration_statement(str, statement as FunctionDeclarationStatement);
    } else {
        str += `TODO[print_statement]: ${statement.type}`
    }
    return str;
}

export function print_program(program: Program) {
    let str = "";
    const statements = program.body;
    const stmts_size = statements.length;
    str += "Program([\n";
    for (let i = 0; i < stmts_size; ++i) {
        const statement = statements[i];
        str = print_statement(str, statement);
        if (i != stmts_size - 1)
            str += ",";
        str += "\n";
    }
    str += "]);\n";
    console.log(str);
}
/* ?? -- ?? -- ? CONSTRUCTION ? -- ?? -- ?? */