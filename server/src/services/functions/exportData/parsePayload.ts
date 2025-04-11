import { ExportPayload } from "../../../../../translationstudio/Types";

const parsePayload = (payload: ExportPayload) => {
  const [contentTypeID, entryID] = payload.element.includes("#")
    ? payload.element.split("#")
    : [payload.element, undefined];

  const locale = payload.source.includes("-")
    ? payload.source.split("-")[0]
    : payload.source;
  return { contentTypeID, entryID, locale };
};

export default parsePayload;
