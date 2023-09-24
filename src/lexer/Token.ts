export class TokenLocation {
    constructor(
        public readonly file_path: string | null, 
        public readonly cursor: number, 
        public readonly row: number, 
        public readonly col: number)  {
    }

    toString(): string {
        return `${this.file_path ? this.file_path : "_"}:${this.row}:${this.col}`;
    }
}

export enum TokenType {
    Identifier = "identifier",
    Keyword = "keyword",
    String = "string",
    Number = "number",

    Plus = "plus",
    Dash = "dash",
    Slash = "slash",
    Asterisk = "asterisk",
    Pipe = "pipe",
    Carot = "carot",
    Ampersand = "ampersand",
    Percent = "percent",
    Exclamation = "exclamation",
    Equal = "equal",

    Colon = "colon",
    Semicolon = "semicolon",
    Period = "period",
    Comma = "comma",
    Hashtag = "hashtag",

    OpenParen = "open_paren",
    CloseParen = "close_paren",
    OpenBracket = "open_bracket",
    CloseBracket = "close_bracket",
    OpenSquareBracket = "open_square_bracket",
    CloseSquareBracket = "close_square_bracket",
    OpenAngleBracket = "open_angle_bracket",
    CloseAngleBracket = "close_angle_bracket",
}

export default class Token {
    constructor(
        public readonly type: TokenType, 
        public readonly data: string | number, 
        public readonly raw: string,
        public readonly location: TokenLocation) {
    }

    toString() {
        const locationString = this.location.toString();
        const typePadSize = 20 - this.type.length;
        const locationPadSize = (5 + (this.location.file_path?.length ?? 0)) - this.location.toString().length;
        return `[${this.type}]${" ".repeat(typePadSize)} ${locationString}${" ".repeat(locationPadSize)} "${this.data}"`;
    }
}
