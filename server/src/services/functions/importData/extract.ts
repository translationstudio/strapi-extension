// extract contentTypeID and entryID from elementuid
export function extractContentAndEntryIds(elementuid: string): [string, string | undefined] {
  const [contentTypeID, entryID] = elementuid.split('#');
  return [contentTypeID, entryID];
}
