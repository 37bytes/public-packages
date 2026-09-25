interface Saver {
    save(): void;
}

export class RemoteSaver implements Saver {
    public async save(): Promise<void> {
        await Promise.resolve();
    }
}
