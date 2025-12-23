export function isArray(val) {
    return Array.isArray(val);
}
export function isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}
//# sourceMappingURL=utils.js.map