/**
 * MY ARGUMENTS PARSER, TRANSLATED FROM C++ to TYPESCRIPT
 * - protoqen
 */

export class Argument {
    constructor(public readonly name: string | null, public readonly value: string | null = null) {}
}

export default class ArgumentsParser {
    private arguments: Argument[] = [];

    constructor(private readonly argv: string[]) {}

    get length() {
        return this.arguments.length;
    }

    has(key: string): boolean {
        for (let i = 0; i < this.arguments.length; ++i) {
            const arg = this.arguments[i];
            if (arg && arg.name == key)
                return true;
        }
        return false;
    }

    get(key: string | number): Argument | null {
        if (typeof key == "string") {
            for (let i = 0; i < this.arguments.length; ++i) {
                const arg = this.arguments[i];
                if (arg && arg.name == key)
                    return arg;
            }
            return null;
        } else if (typeof key == "number") {
            const args = [...this.arguments.values()];
            if (key < 0 || key > args.length)
                return null;false
            return args[key];
        } else 
            throw "unreachable";
    }

    parse(): boolean {
        while (this.argv.length > 0) {
            const arg = this.argv.shift()!.trim().toLowerCase();
            const arg_len = arg.length;
            if (arg[0] != '-') {
                this.arguments.push(new Argument(null, arg));
                continue;
            }
            if (arg[0] == '-' && arg_len == 1) {
                console.error("Invalid argument format provided.");
                return false;
            }
            const name = arg.slice(1, arg_len);
            const name_len = name.length;
            if (name_len == 0)
                throw "unreachable";
            const eqIndex = name.indexOf('=');
            if (eqIndex >= 0) {
                throw "todo (argument with value)";
            }
            this.arguments.push(new Argument(name));
        }
        return true;
    }
}