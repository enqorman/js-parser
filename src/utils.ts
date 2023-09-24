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