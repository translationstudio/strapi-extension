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
/**
 * Converts a richtext JSON structure to HTML
 * @param {any} json - The JSON representation of richtext content
 * @returns {string} - The converted HTML string
 */
export default function jsonToHtml(json: any): string {
  if (!json || !Array.isArray(json)) {
    return '';
  }

  return json.map((node) => processNode(node)).join('');
}

/**
 * Process a node and its children in the richtext JSON structure
 * @param {any} node - A node in the richtext JSON structure
 * @returns {string} - The converted HTML string for this node and its children
 */
function processNode(node: any): string {
  if (!node) return '';

  switch (node.type) {
    case 'paragraph':
      return `<p>${node.children.map(processNode).join('')}</p>`;
    case 'heading':
      const level = node.level || 1;
      return `<h${level}>${node.children.map(processNode).join('')}</h${level}>`;
    case 'link':
      const url = node.url || '#';
      return `<a href="${url}">${node.children.map(processNode).join('')}</a>`;
    case 'list':
      const listType = node.format === 'ordered' ? 'ol' : 'ul';
      return `<${listType}>${node.children.map(processNode).join('')}</${listType}>`;
    case 'list-item':
      return `<li>${node.children.map(processNode).join('')}</li>`;
    case 'quote':
      return `<blockquote>${node.children.map(processNode).join('')}</blockquote>`;
    case 'code':
      return `<pre><code>${node.children.map((child: any) => child.text).join('')}</code></pre>`;
    case 'image':
      return `<img src="${node.url}" alt="${node.alt || ''}" />`;
    case 'text':
      return formatText(node);
    default:
      return node.children && Array.isArray(node.children)
        ? node.children.map(processNode).join('')
        : node.text || '';
  }
}

/**
 * Formats a text node with appropriate styling
 * @param {any} child - A text node from the richtext JSON structure
 * @returns {string} - The formatted HTML string
 */
function formatText(child: any): string {
  if (child.type === 'link') {
    return `<a href="${child.url}">${child.children.map((sub: any) => formatText(sub)).join('')}</a>`;
  }

  let text = child.text || '';

  // Apply formatting in a specific order to ensure proper nesting
  if (child.code) text = `<code>${text}</code>`;
  if (child.bold) text = `<strong>${text}</strong>`;
  if (child.italic) text = `<em>${text}</em>`;
  if (child.underline) text = `<u>${text}</u>`;

  // Use markdown format for strikethrough instead of HTML
  if (child.strikethrough) {
    text = `~~${text}~~`; // Markdown strikethrough format
    // Instead of: text = `<del>${text}</del>`;  // HTML strikethrough format
  }

  return text;
}
