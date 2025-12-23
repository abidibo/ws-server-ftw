export interface ParsedData {
    merge?: boolean;
    deepmerge?: boolean;
    append?: boolean;
    obj?: Record<string, unknown>;
    arr?: unknown[];
    data?: unknown;
}
export declare function stdinParse(d: Buffer | {
    toString(): string;
}): ParsedData | undefined;
//# sourceMappingURL=stdin.d.ts.map