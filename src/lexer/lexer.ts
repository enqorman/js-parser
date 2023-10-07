// @ts-nocheck

import Token from "./Token.ts";
import { TokenLocation, TokenType } from "./Token.ts";
import { is_alpha, is_numeric, is_space } from "../utils.ts";

export default class Lexer {
    public readonly file_path: string | null;
    public readonly source: string;
    private cursor: number;
    private row: number;
    private bol: number;
    constructor(file_path: string | null, source?: string) {
        this.file_path = file_path;
        if (typeof source == "string") {
            this.source = source;
        } else {
            if (this.file_path == null)
                this.source = "";
            else 
                throw new Error("[Lexer] TODO: read file");
        }
        this.cursor = 0;
        this.row = 0;
        this.bol = 0;
    }

    private at_end(): boolean {
        return this.cursor >= this.source.length;
    }

    private current(): string | null {
        return this.source[this.cursor] ?? null;
    }

    private peek(): string | null {
        return this.source[this.cursor + 1] ?? null;
    }
    
    private location(): TokenLocation {
        return new TokenLocation(this.file_path, this.cursor, this.row, this.cursor - this.bol);
    }

    private consume(): string | null {
        if (this.at_end())
            return null;
        const ch = this.source[this.cursor++];
        if (ch == "\n") {
            this.row++;
            this.bol = this.cursor;
        }
        return ch;
    }

    private consume_expect(word: string): boolean {
        if (this.at_end())
            return false;
        const value = this.source.substring(this.cursor, this.cursor + word.length);
        if (value == word) 
            this.cursor += word.length;
        return value == word;
    }

    private consume_while(condition: (ch: string) => boolean) {
        while (!this.at_end() && condition(this.current()!)) {
            this.consume();
        }
    }

    private trim_left() {
        this.consume_while((ch: string) => is_space(ch));
    }

    private char_tokens: {[key: string]: TokenType} = {
        "+": TokenType.Plus,
        "-": TokenType.Dash,
        "/": TokenType.Slash,
        "*": TokenType.Asterisk,
        "|": TokenType.Pipe,
        "^": TokenType.Carot,
        "&": TokenType.Ampersand,
        "%": TokenType.Percent,
        "!": TokenType.Exclamation,
        "=": TokenType.Equal,
        ":": TokenType.Colon,
        ";": TokenType.Semicolon,
        ".": TokenType.Period,
        ",": TokenType.Comma,
        "#": TokenType.Hashtag,
        "(": TokenType.OpenParen,
        ")": TokenType.CloseParen,
        "{": TokenType.OpenBracket,
        "}": TokenType.CloseBracket,
        "[": TokenType.OpenSquareBracket,
        "]": TokenType.CloseSquareBracket,
        "<": TokenType.OpenAngleBracket,
        ">": TokenType.CloseAngleBracket,
    };

    private keywords: string[] = [
        "this", "new",
        "async", "function", 
        "return", "yield", "continue", "break",
        "let", "const", "var",
        "private", "public", "protected", "override",
        "interface", "class", "enum",
        "if", "while", "do", "else", "catch",
        "debugger"
    ];

    public next_token(): Token | null {
        this.trim_left();
        if (this.at_end())
            return null;

        const ch = this.current()!;

        // Comments
        if (ch == "/" && this.peek()! == "/") {
            if (!this.consume_expect("//")) {
                console.error("[Lexer] next_token: Failed to lex comment");
                return null;
            }
            this.consume_while((ch: string) => ch != "\n");
            return this.next_token();
        }

        // String
        if (ch == "'" || ch == "\"" || ch == "`") {
            const start = this.cursor;
            const quote = this.consume()!;
         
            while (!this.at_end() && this.current()! != quote) {
                const ch = this.consume();
                if (ch == '\\')
                    this.consume();
            }

            // expecting closing quote
            if (!this.consume_expect(quote)) {
                console.error("[Lexer] next_token: expected closing quote on string");
                return null;
            }

            const string = this.source.substring(start, this.cursor);
            return new Token(TokenType.String, string.slice(1, string.length - 1), string, this.location());
        }

        // Identifiers/Keywords
        if (is_alpha(ch)) {
            const start = this.cursor;
            this.consume_while((ch: string) => is_alpha(ch));
            const word = this.source.substring(start, this.cursor);
            return new Token(this.keywords.includes(word) ? TokenType.Keyword : TokenType.Identifier, word, word, this.location());
        }

        // Numbers
        if (is_numeric(ch)) {
            let value = 0;
            while (!this.at_end() && is_numeric(this.current()!)) {
                value *= 10;
                value += this.consume()!.charCodeAt(0) - 48;
            }
            return new Token(TokenType.Number, value, value.toString(), this.location());
        }

        if (this.char_tokens[ch]) {
            const char = this.consume()!;
            return new Token(this.char_tokens[ch], char, char, this.location());
        }

        else {
            console.error("[Lexer] unexpected char whilst lexing: " + ch);
            return null;
        }
    }
}
