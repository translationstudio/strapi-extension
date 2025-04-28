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
function formatText(child: any): string {
  if (child.type === 'link') {
    return `<a href="${child.url}">${child.children.map((sub: any) => sub.text).join('')}</a>`;
  }

  let text = child.text || '';
  if (child.bold) text = `<strong>${text}</strong>`;
  if (child.italic) text = `<em>${text}</em>`;
  if (child.underline) text = `<u>${text}</u>`;
  if (child.strikethrough) text = `<del>${text}</del>`;

  return text;
}

function renderChildren(children: any[]): string {
  return children.map(formatText).join('');
}

function renderHeading(element: any): string {
  return `<h${element.level}>${renderChildren(element.children)}</h${element.level}>`;
}

function renderParagraph(element: any): string {
  return `<p>${renderChildren(element.children)}</p>`;
}

function renderList(element: any): string {
  const tag = element.format === 'unordered' ? 'ul' : 'ol';
  const items = element.children.map(renderListItem).join('');
  return `<${tag}>${items}</${tag}>`;
}

function renderListItem(item: any): string {
  const content = item.children.map(formatText).join('');
  return `<li>${content}</li>`;
}

function jsonToHtml(jsonData: any): string {
  return jsonData
    .map((element: any) => {
      switch (element.type) {
        case 'heading':
          return renderHeading(element);
        case 'paragraph':
          return renderParagraph(element);
        case 'list':
          return renderList(element);
        default:
          return '';
      }
    })
    .join('');
}

export default jsonToHtml;
