
export class Event<T extends (...args: any[]) => any> {
    private subscribedFunctions: T[] = [];

    constructor() {}

    public subscribe(fn: T): void {
        this.subscribedFunctions.push(fn);
    }

    public async emit(...args: Parameters<T>): Promise<void> {
        for (const fn of this.subscribedFunctions) {
            await fn(...args);
        }
    }
}
