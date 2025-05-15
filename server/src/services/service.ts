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
import type { Core } from '@strapi/strapi';
import type {
  ExportPayload,
  ImportPayload,
  LocaleMap,
  StrapiLocale,
  TranslationRequest,
} from '../../../Types';
import getContentType from './functions/exportData/getContentType';
import parsePayload from './functions/exportData/parsePayload';
import getEntry from './functions/exportData/getEntry';
import transformResponse from './functions/exportData/transformResponse';
import processEntryFields from './functions/exportData/processEntryFields';
import { updateEntry } from './functions/importData/updateEntry';
import { prepareImportData } from './functions/importData/prepareImportData';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const TRANSLATIONTUDIO_URL = 'https://cms-strapi-service-7866fdd79eab.herokuapp.com';
const APP_NAME = 'translationstudio';

const service = ({ strapi }: { strapi: Core.Strapi }) => {
  const pluginStore = strapi.store({
    type: 'plugin',
    name: APP_NAME,
  });
  return {
    // translationstudio Lizenz
    async getLicense() {
      const result = await pluginStore.get({ key: 'license' });
      return { license: result };
    },
    async setLicense(license: string) {
      try {
        await pluginStore.set({
          key: 'license',
          value: license,
        });
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    },
    // Access Token
    async getToken() {
      try {
        const result = await pluginStore.get({ key: 'token' });
        return { token: result };
      } catch (error) {
        return { token: null };
      }
    },
    async generateToken() {
      const secretKey = crypto.randomBytes(64).toString('hex');
      const token = jwt.sign(
        {
          app: APP_NAME,
          iat: Math.floor(Date.now() / 1000),
        },
        secretKey,
        { expiresIn: '10y' }
      );
      await pluginStore.set({
        key: 'token',
        value: token,
      });
      return { token };
    },

    async getLanguageOptions() {
      const { license } = await this.getLicense();
      const response = await fetch(TRANSLATIONTUDIO_URL + '/mappings', {
        headers: { Authorization: `${license}` },
      });
      const responseData = await response.json();
      return responseData;
    },

    async exportData(payload: ExportPayload) {
      const { contentTypeID, entryID, locale } = parsePayload(payload);
      const contentType = await getContentType(contentTypeID); // schema
      const entry = await getEntry(contentTypeID, entryID, locale); // data
      const contentFields = await processEntryFields(entry, contentType.attributes, locale);
      return transformResponse(contentFields);
    },

    async importData(payload: ImportPayload) {
      const { contentTypeID, entryID } = parsePayload(payload);
      const sourceLocale = payload.source;
      const targetLocale = payload.target;

      try {
        const existingEntry = await getEntry(contentTypeID, entryID, targetLocale);
        const targetSchema = await getContentType(contentTypeID);
        const data = prepareImportData(payload.document[0].fields, existingEntry, targetSchema);
        if ((targetSchema.pluginOptions.i18n as any).localized === true) {
          await updateEntry(
            contentTypeID,
            entryID,
            sourceLocale,
            targetLocale,
            data,
            targetSchema.attributes
          );
        }
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    },

    async requestTranslation(payload: TranslationRequest) {
      const { license } = await this.getLicense();
      const response = await fetch(TRANSLATIONTUDIO_URL + '/translate', {
        method: 'POST',
        headers: {
          Authorization: `${license}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 204) return true;
    },
    async getEmail(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return { email: null };
      }
      return { email: user.email };
    },
    async getLanguages(): Promise<LocaleMap> {
      try {
        const locales: StrapiLocale[] = await strapi.plugin('i18n').service('locales').find();
        // Transform to translationstudios format
        const localeMap: LocaleMap = {};
        locales.forEach((locale) => {
          localeMap[locale.code] = locale.name;
        });
        return localeMap;
      } catch (error) {
        return {};
      }
    },
    async ping(): Promise<void> {
      return;
    },
    async getEntryData(contentTypeID, entryID, locale) {
      const entry = await getEntry(contentTypeID, entryID, locale);
      return entry;
    },
  };
};

export default service;
