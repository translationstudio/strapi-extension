import { prepareImportData } from '../../../../server/src/services/functions/importData/prepareImportData';
import * as fs from "fs";

const ENTRY = JSON.parse(fs.readFileSync(__dirname + "/entry.json", "utf-8"));
const SCHEMA = JSON.parse(fs.readFileSync(__dirname + "/schema.json", "utf-8"));
const TRANSLATED = JSON.parse(fs.readFileSync(__dirname + "/translated.json", "utf-8"));


describe("prepareImportData", () => {

    test("ony simple text fields", () => {

        let expectedFieldCount = 0;

        const document = {
            fields: [...TRANSLATED.fields],
            keep: { }
        }

        document.fields.filter(e => typeof e.uuid === "undefined").forEach(e => {
            if (e.translatableValue[0].startsWith("###"))
                expectedFieldCount++;
        });

        expectedFieldCount += Object.keys(document.keep).length;

        const res = prepareImportData(document.fields, document.keep, { ... ENTRY }, SCHEMA);
        console.log(JSON.stringify(res, null, 2));
        expect(res).not.toBeNull();
        expect(Object.keys(res!).length).toEqual(expectedFieldCount);
    });

    test("ony components", () => {

        const document = {
            fields: [...TRANSLATED.fields.filter(e => typeof e.uuid !== "undefined")],
            keep: { ...TRANSLATED.keep }
        }

        const expectedFieldCount = Object.keys(document.keep).length;

        const res = prepareImportData(document.fields, document.keep, { ... ENTRY }, SCHEMA);
        //console.log(JSON.stringify(res, null, 2));
        expect(res).not.toBeNull();
        expect(Object.keys(res!).length).toEqual(expectedFieldCount);
    });

    /*
    test("prepareImportData", () => {

        let expectedFieldCount = 0;
        let keepFieldsMap:any = { }        
        TRANSLATED.fields.filter(e => typeof e.uuid === "undefined").forEach(e => {
            if (e.translatableValue[0].startsWith("###"))
                expectedFieldCount++;
        });

        expectedFieldCount += Object.keys(TRANSLATED.keep).length;

        const res = prepareImportData(TRANSLATED.fields, TRANSLATED.keep, ENTRY, SCHEMA);
        console.log(JSON.stringify(res, null, 2));
        expect(res).not.toBeNull();
        expect(Object.keys(res!).length).toEqual(expectedFieldCount);
    });
    */

});

