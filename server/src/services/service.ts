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
import getContentType, { IStrapiSchema } from './functions/exportData/getContentType';
import parsePayload from './functions/exportData/parsePayload';
import getEntry from './functions/exportData/getEntry';
import transformResponse from './functions/exportData/transformResponse';
import processEntryFields, { IsLocalisableSchema } from './functions/exportData/processEntryFields';
import { appendMissingFields, updateEntry } from './functions/importData/updateEntry';
import { prepareImportData } from './functions/importData/prepareImportData';
import * as crypto from "crypto";

const TRANSLATIONTUDIO_URL = 'https://strapi.translationstudio.tech';
const APP_NAME = 'translationstudio';

const Logger = {
    log: typeof strapi !== "undefined" ? strapi.log : console,
    info: (val:any) => Logger.log.info(val),
    warn: (val:any) => Logger.log.warn(val),
    error: (val:any) => Logger.log.error(val),
    debug: (val:any) => Logger.log.debug(val)
}

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
        async getTranslationstudioUrl() {
            try {
                const result = await pluginStore.get({ key: 'developurl' });
                if (typeof result === "string" && result !== "")
                    return result;
            }
            catch (err) {
                strapi.log.warn(err);
            }
            return TRANSLATIONTUDIO_URL;
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
        async setDevelopmentUrl(url: string) {
            try {
                await pluginStore.set({
                    key: 'developurl',
                    value: url,
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        async getDevelopmentUrl() {
            try {
                const result = await pluginStore.get({ key: 'developurl' });
                if (typeof result === "string")
                    return result;
            } catch (error) {

            }
            return "";
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
            await pluginStore.set({
                key: 'token',
                value: secretKey,
            });
            return { token: secretKey };
        },

        async getLanguageOptions() {
            const { license } = await this.getLicense();
            const url = await this.getTranslationstudioUrl();
            const response = await fetch(url + '/mappings', {
                headers: { Authorization: `${license}` },
            });
            const responseData = await response.json();
            return responseData;
        },

        async exportData(payload: ExportPayload) {
            const { contentTypeID, entryID, locale } = parsePayload(payload);
            const contentType = getContentType(contentTypeID); // schema
            if (contentType === null || !IsLocalisableSchema(contentType.entry)) {
                return {
                    fields: [],
                    keep: {}
                }
            }

            const entry = await getEntry(contentTypeID, entryID, locale); // data
            const contentFields = await processEntryFields(entry, contentType, locale);
            return transformResponse(contentFields);
        },

        async importData(payload: ImportPayload) {
            const { contentTypeID, entryID } = parsePayload(payload);
            const sourceLocale = payload.source;
            const targetLocale = payload.target;

            try {
                
                const sourceEntry = await getEntry(contentTypeID, entryID, sourceLocale);
                if (sourceEntry == null)
                    throw new Error("Cannot find source entry " + contentTypeID + "::" + entryID + " in " + sourceLocale);

                const targetSchema = getContentType(contentTypeID);
                if (targetSchema === null || !IsLocalisableSchema(targetSchema.entry))
                    throw new Error("Cannot find schema");

                const data = prepareImportData(
                    payload.document[0].fields, 
                    payload.document[0].keep ?? { },
                    sourceEntry,
                    targetSchema
                );

                strapi.log.info("Loading target language entry");
                const targetLocaleEntry = await getEntry(contentTypeID, entryID, targetLocale);
                appendMissingFields(data, sourceEntry, targetSchema, targetLocaleEntry);
                
                await updateEntry(
                    contentTypeID,
                    entryID,
                    targetLocale,
                    data
                );
                
                return true;
            } 
            catch (error) 
            {
                strapi.log.error(error);
            }

            return false;
        },

        async requestTranslation(payload: TranslationRequest) {
            const { license } = await this.getLicense();
            const url = await this.getTranslationstudioUrl();
            const response = await fetch(url + '/translate', {
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
        }
    };
};

export default service;
