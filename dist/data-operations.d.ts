export type OperationType = 'merge' | 'deepmerge' | 'append' | 'raw';
export interface DataOperation {
    type: OperationType;
    data: unknown;
}
/**
 * Load data from DB file with path traversal
 * @param dbPath - Absolute path to DB file
 * @param requestPath - URL path like '/api/v1/users'
 * @returns Data from DB at the specified path
 */
export declare function loadDataFromDb(dbPath: string, requestPath: string): Promise<unknown>;
/**
 * Apply operation to base data
 * @param baseData - Original data loaded from DB
 * @param operation - Operation to apply (merge, deepmerge, append, raw)
 * @returns Transformed data
 */
export declare function applyOperation(baseData: unknown, operation: DataOperation | null): Promise<unknown>;
//# sourceMappingURL=data-operations.d.ts.map