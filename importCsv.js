import fs from 'node:fs';
import { parse } from 'csv-parse';
import assert from 'assert';

const nROWS = 10;
const CSV_FILE_NAME = 'data.csv';

const sendRequest = async (payload) => {
  try {
    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  const filePath = new URL(CSV_FILE_NAME, import.meta.url);

  const fileStream = fs.createReadStream(filePath);

  const parser = fileStream.pipe(
    parse({
      delimiter: ';',
      skip_empty_lines: true
    })
  );
  let count = 0;
  process.stdout.write('start\n');
  for await (const record of parser) {
    const [title, description] = record;
    const payload = {
      title,
      description
    };
    await sendRequest(payload);
    process.stdout.write(`${count++} ${record.join(',')}\n`);
  }
  process.stdout.write('...done\n');
  assert.strictEqual(count, nROWS);
})();
