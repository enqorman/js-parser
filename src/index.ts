// AST based on acorn using https://astexplorer.net/
// with slight changes/alterations

import Lexer from "./lexer/lexer";
import Parser from "./parser/parser";
import Token from "./lexer/Token";

function run(file_path: string, input_src: string, printJson: boolean = false) {
    const lexer = new Lexer(file_path, input_src);

    const tokens: Token[] = [];
    for (;;) { 
        const token: Token | null = lexer.next_token();
        if (!token) break;
        tokens.push(token); 
        // console.log(token.toString())
    }

    const parser = new Parser(tokens);
    const program = parser.parse();
    if (!program) {
        console.error(`Failed to parse/run the program!`);
        return;
    }

    if (!printJson) {
        console.dir(program, { depth: null });
    } else {
        console.log(JSON.stringify(program, null, 4));
    }
}

export let DEBUG_MODE = false;

async function main() {
    console.clear();

    const Buffer = globalThis['Buffer']!;
    const Bun = globalThis['Bun']!;
    const process = globalThis['process']!;

    if (!Buffer || !process) {
        console.error;
        run("null", "");
        return;
    }

    let inputFile;
    let printJson = false;
    let useRepl = false;
    if ('Bun' in globalThis) {
        const args = Bun.argv.slice(2, Bun.argc);
        while (args.length > 0) {
            const arg = args.shift().trim().toLowerCase();
            if (arg[0] == '-') {
                const name = arg.slice(-(arg.length - 1));
                if (name == 'repl')
                    useRepl = true;
                else if (name == 'help' || name == 'h') {
                    console.log('usage: index.ts [-repl, -help, -json, ...] <input file>');
                    return;
                }
                else if (name == 'input') {
                    inputFile = args.shift();
                    if (!inputFile) 
                        throw new Error("File path required.");
                } else if (name == 'json')
                    printJson = true;
                else if (name == 'debug')
                    DEBUG_MODE = true;
            } else 
                inputFile = arg;
        }
    }

    if (useRepl) { 
        process.stdout.write("> ");
        for await (const chunk of Bun.stdin.stream()) {
            const chunkText = Buffer.from(chunk).toString();
            if (chunkText.toLowerCase().trim() == 'exit') {
                process.exit(0);
                return;
            }

            const lexer = new Lexer("null", chunkText);
            const parser = new Parser(lexer);
            const program = parser.parse();
            console.log(JSON.stringify(program, null, 4) + "\n");
            process.stdout.write("> ");
        }

        return;
    } 

    else if (inputFile) {
        if ('Bun' in globalThis) {
            const input = Bun.file(inputFile);
            const src = await input.text();
            run(inputFile, src, printJson)
        } else  
            console.error('TODO: deno/node support')
    } else
        run("null", `"yo whats up \\"dawg\\""`);
}

main();
