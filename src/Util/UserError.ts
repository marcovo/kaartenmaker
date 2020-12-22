
export default class UserError extends Error {
    readonly isUserError = true;

    constructor(...args) {
        super(...args); // (1)
        this.name = "UserError"; // (2)
    }
}
