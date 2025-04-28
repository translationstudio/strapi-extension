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
export default [
  {
    method: 'POST',
    path: '/setLicense',
    handler: 'controller.setLicense',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/getLicense',
    handler: 'controller.getLicense',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/getToken',
    handler: 'controller.getToken',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/generateToken',
    handler: 'controller.generateToken',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/mappings',
    handler: 'controller.getLanguageOptions',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/translate',
    handler: 'controller.requestTranslation',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/import',
    handler: 'controller.importData',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/export',
    handler: 'controller.exportData',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/',
    handler: 'controller.ping',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/languages',
    handler: 'controller.getLanguages',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/email',
    handler: 'controller.getEmail',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/entrydata',
    handler: 'controller.getEntryData',
    config: {
      policies: [],
    },
  },
];
