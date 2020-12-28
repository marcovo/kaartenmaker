import Serializer, {Serialization} from "./Serializer";
import UserInterface from "./UserInterface";
import UserError from "../Util/UserError";

export type Bookmark = {
    name: string,
    date: number,
    state: Serialization,
};

export default class Bookmarks {

    static readonly LOCALSTORAGE_KEY = 'bookmarks';

    constructor(private userInterface: UserInterface) {

    }

    getUserInterface(): UserInterface {
        return this.userInterface;
    }

    private fetchBookmarks(): Record<string, Bookmark> {
        const item = window.localStorage.getItem(Bookmarks.LOCALSTORAGE_KEY);
        if(item === null) {
            return {};
        }

        return JSON.parse(item);
    }

    getBookmarks(): Bookmark[] {
        const bookmarks = Object.values(this.fetchBookmarks());
        bookmarks.sort((a, b) => -(a.date - b.date)); // Sort by date descending
        return bookmarks;
    }

    getBookmark(name: string): Bookmark {
        const bookmarks = this.fetchBookmarks();
        if(bookmarks[name] === undefined) {
            throw new UserError('Bookmark does not exist');
        }
        return bookmarks[name];
    }

    hasBookmark(name: string): boolean {
        const bookmarks = this.fetchBookmarks();
        return (bookmarks[name] !== undefined);
    }

    applyBookmark(name: string): Promise<void> {
        const bookmark = this.getBookmark(name);
        return (new Serializer()).unserialize(bookmark.state, this.userInterface);
    }

    setBookmark(name: string): void {
        const bookmark: Bookmark = {
            name: name,
            date: +(new Date()),
            state: (new Serializer()).serializeWorkspace(this.userInterface),
        };

        name = name.trim();
        if(name === '') {
            throw new UserError('Bookmark name cannot be empty');
        }

        const bookmarks = this.fetchBookmarks();
        bookmarks[name] = bookmark;

        window.localStorage.setItem(Bookmarks.LOCALSTORAGE_KEY, JSON.stringify(bookmarks));
    }

    deleteBookmark(name: string): void {
        const bookmarks = this.fetchBookmarks();
        if(bookmarks[name] === undefined) {
            throw new UserError('Bookmark does not exist');
        }
        delete bookmarks[name];
        window.localStorage.setItem(Bookmarks.LOCALSTORAGE_KEY, JSON.stringify(bookmarks));
    }

}
