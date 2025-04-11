export function parseNewValuesIntoStructure(originalStructure: any, newValues: string[]) {
  let valueIndex = 0; // Track which string in newValues to use

  // Iterate through paragraphs in originalStructure
  originalStructure.forEach((paragraph: any) => {
    // Iterate through the children of each paragraph
    paragraph.children.forEach((child: any) => {
      if (newValues[valueIndex]) {
        child.text = newValues[valueIndex]; // Assign text
        valueIndex++;
      }
    });
  });

  return originalStructure;
}
