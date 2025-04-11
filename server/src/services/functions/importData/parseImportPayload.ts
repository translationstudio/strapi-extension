import { ImportPayload } from "../../../../../translationstudio/Types";

const parseImportPayload = (payload: ImportPayload) => {
  const [contentTypeID, entryID] = payload.element.includes("#")
    ? [payload.element.split("#")[0], payload.element.split("#")[1]]
    : [payload.element, undefined];
  return { contentTypeID, entryID };
};
export default parseImportPayload;
