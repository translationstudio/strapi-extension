import processEntryFields from '../../../../server/src/services/functions/exportData/processEntryFields';

import * as fs from "fs";

const ENTRY = JSON.parse(fs.readFileSync(__dirname + "/entry.json", "utf-8"));
const SCHEMA = JSON.parse(fs.readFileSync(__dirname + "/schema.json", "utf-8"));

test('processEntryFields', async () => {
  
  const res = await processEntryFields(ENTRY, SCHEMA, "");

  expect(res.fields.length).toEqual(25);
  expect(Object.keys(res.keep).length).toEqual(1);
});
