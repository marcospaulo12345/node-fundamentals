import fs from 'node:fs/promises';
import { ErrorTaskNotFound } from '../errors.js';

const DATABASEPATH = new URL('../database.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(DATABASEPATH, 'utf8')
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist = async () => {
    await fs.writeFile(DATABASEPATH, JSON.stringify(this.#database));
  };

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    return data;
  }

  insert(table, data){
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();
    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(
      (row) => row.id === id
    );
    if (rowIndex > -1) {
      this.#database[table][rowIndex].updated_at = new Date();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) this.#database[table][rowIndex][key] = value;
      });
      this.#persist();
    } else {
      throw ErrorTaskNotFound;
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(
      (row) => row.id === id
    );
    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    } else {
      throw ErrorTaskNotFound;
    }
  }

  updateTaskState(table, id) {
    const rowIndex = this.#database[table].findIndex(
      (row) => row.id === id
    );
    if (rowIndex > -1) {
      if (this.#database[table][rowIndex].is_done) {
        this.#database[table][rowIndex].completed_at = null;
      } else this.#database[table][rowIndex].completed_at = new Date();

      this.#database[table][rowIndex].is_done =
        !this.#database[table][rowIndex].is_done;
      this.#persist();
    } else {
      throw ErrorTaskNotFound;
    }
  }
}
