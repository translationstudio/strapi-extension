import { TranslationStatus } from "../../../../Types";

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
export type StatusVariant = 'success' | 'warning' | 'neutral';

export function GetStatusColor(input:TranslationStatus|"mixed"|""):StatusVariant
{
  switch(input)
  {
    case "translated":
      return "success";
    case "intranslation":
      return "warning";
    default: 
      return "neutral";
  }
}

export function GetStatusText(input:TranslationStatus|"mixed"|"")
{
  switch(input)
  {
    case "mixed":
      return "mixed";
    case "translated":
      return "translated";
    case "intranslation":
      return "in translated";
    case "queued":
      return "queued";
    default: 
      return "";
  }
}