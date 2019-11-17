// This base class is meant to mimic Java's static constructor concept.
// The static constructor is meant to be run once on the first object's initialization.
// The `staticCopy` variable is to enable polymorphism. In other words, each subclass
// should keep track if its static constructor has been called.
export class StaticConstructor {
    private static staticConstructorCalled = false;

    protected static staticConstructor(): void {
        return;
    }

    constructor() {
        const staticCopy = this.constructor as typeof StaticConstructor;
        if (!staticCopy.staticConstructorCalled) {
            staticCopy.staticConstructor();
            staticCopy.staticConstructorCalled = true;
        }
    }
}
