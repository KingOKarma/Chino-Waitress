/**
 * Wait in miliseconds
 * @param {number} milliseconds The time in mlliseconds to wait
 */
export function sleep(milliseconds: number): void {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
