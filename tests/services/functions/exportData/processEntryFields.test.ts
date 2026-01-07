/*
Strapi - translationstudio extension
Copyright (C) 2025 I-D Media GmbH, idmedia.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/
import { expect, test } from '@jest/globals';
import processEntryFields from '../../../../server/src/services/functions/exportData/processEntryFields';

import * as fs from 'fs';

const ENTRY = JSON.parse(fs.readFileSync(__dirname + '/entry.json', 'utf-8'));
const SCHEMA = JSON.parse(fs.readFileSync(__dirname + '/schema.json', 'utf-8'));

test('processEntryFields', async () => {
  const res = await processEntryFields(ENTRY, SCHEMA, '');

  expect(res.fields.length).toEqual(25);
  expect(Object.keys(res.keep).length).toEqual(1);
});
