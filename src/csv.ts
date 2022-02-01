import stringify from "csv-stringify/lib/sync";

export class CSV<T> {
  constructor(private headers: Array<keyof T>) {}

  public renderHeader(): string {
    return stringify([this.headers]);
  }

  public render(records: T[]): string {
    return stringify(
      records.map((record) => this.headers.map((h) => record[h]))
    );
  }
}
