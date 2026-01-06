export function stdinParse(d) {
    const input = d.toString().trim();
    let data;
    try {
        if (/^merge /.test(input)) {
            data = {
                merge: true,
                obj: JSON.parse(input.replace(/^merge /, ''))
            };
        }
        else if (/^deepmerge /.test(input)) {
            data = {
                deepmerge: true,
                obj: JSON.parse(input.replace(/^deepmerge /, ''))
            };
        }
        else if (/^append /.test(input)) {
            data = {
                append: true,
                arr: JSON.parse(input.replace(/^append /, ''))
            };
        }
        else if (input) {
            data = {
                data: JSON.parse(input)
            };
        }
    }
    catch (e) {
        console.error(`${e}. Sending original data.`);
    }
    return data;
}
//# sourceMappingURL=stdin.js.map