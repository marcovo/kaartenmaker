
export default interface Action {
    apply(): void;

    revert(): void;

    merge(newAction: Action): boolean;
}
