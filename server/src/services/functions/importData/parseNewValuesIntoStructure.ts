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
