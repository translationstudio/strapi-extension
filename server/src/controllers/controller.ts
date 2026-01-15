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

const APP_NAME = 'translationstudio';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
    async validateToken(ctx) {
        const authHeader = ctx.request.header.authorization;
        if (!authHeader) {
            ctx.status = 401;
            ctx.body = { error: 'Missing authorization header' };
            return false;
        }
        const storedToken = await strapi.plugin(APP_NAME).service('service').getToken();
        if (!storedToken?.token || authHeader !== storedToken.token) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid token' };
            return false;
        }
        return true;
    },
    async getLicense(ctx) {
        const result = await strapi.plugin(APP_NAME).service('service').getLicense();
        if (typeof result.license === "string") {
            ctx.status = 204;
        } else {
            ctx.status = 404;
            ctx.body = result;
        }
    },
    async setLicense(ctx) {
        const license = ctx.request.body.license;
        const result = await strapi.plugin(APP_NAME).service('service').setLicense(license);
        if (result.success) {
            ctx.status = 200;
        } else {
            ctx.status = 500;
        }
        ctx.body = result;
    },
    async getToken(ctx) {
        const result = await strapi.plugin(APP_NAME).service('service').getToken();
        if (result.token) {
            ctx.status = 200;
        } else {
            ctx.status = 404;
        }
        ctx.body = result;
    },
    async generateToken(ctx) {
        const result = await strapi.plugin(APP_NAME).service('service').generateToken();
        ctx.status = 200;
        ctx.body = result;
    },
    async getLanguageOptions(ctx) {
        const result = await strapi.plugin(APP_NAME).service('service').getLanguageOptions();
        ctx.status = 200;
        ctx.body = result;
    },
    async requestTranslation(ctx) {
        const payload = ctx.request.body;
        const result = await strapi.plugin(APP_NAME).service('service').requestTranslation(payload);
        ctx.body = result;
    },
    async exportData(ctx) {
        if (!(await this.validateToken(ctx))) {
            ctx.status = 400;
            return;
        }

        try {
            const payload =
                typeof ctx.request.body === 'string' ? JSON.parse(ctx.request.body) : ctx.request.body;
            const result = await strapi.plugin(APP_NAME).service('service').exportData(payload);
            ctx.status = 200;
            ctx.body = [result];
        } catch (ex) {
            ctx.status = 500;
            ctx.body = { error: ex.message ?? 'Generic error' };
        }
    },
    async setDevelopmentUrl(ctx) {
        const url = ctx.request.body.url;
        const result = await strapi.plugin(APP_NAME).service('service').setDevelopmentUrl(url);
        if (result) {
            ctx.status = 200;
            ctx.body = { success: true };
        } else {
            ctx.status = 500;
            ctx.body = { success: false };
        }
    },
    async getDevelopmentUrl(ctx) {
        const url = await strapi.plugin(APP_NAME).service('service').getDevelopmentUrl();
        if (typeof url === "string") {
            ctx.status = 200;
            ctx.body = { url: url };
        } else {
            ctx.status = 404;
            ctx.body = { url: '' };
        }
    },
    async importData(ctx) {
        if (!(await this.validateToken(ctx))) {
            ctx.status = 400;
            return;
        }

        try {
            const payload =
                typeof ctx.request.body === 'object' ? ctx.request.body : JSON.parse(ctx.request.body);

            strapi.log.info('Importing');
            const result = await strapi.plugin(APP_NAME).service('service').importData(payload);
            ctx.body = { success: result };
            ctx.status = 200;
            return;
        } catch (err) {
            strapi.log.error(err.message ?? err);
        }

        ctx.body = { message: 'Could not perform import' };
        ctx.status = 500;
    },
    async ping(ctx) {
        await strapi.plugin(APP_NAME).service('service').ping();
        ctx.status = 204;
    },
    async getLanguages(ctx) {
        if (!(await this.validateToken(ctx))) {
            ctx.status = 400;
            return;
        }
        try {
            const result = await strapi.plugin(APP_NAME).service('service').getLanguages();
            ctx.status = 200;
            ctx.body = result;
        } catch (error) {
            strapi.log.error(error);
            ctx.status = 400;
            ctx.body = {};
        }
    },
    async getEntryData(ctx) {
        const { uid, locale } = ctx.request.body;
        if (!uid) {
            return ctx.badRequest('Missing uid parameter');
        }
        try {
            const [contentTypeID, entryID] = uid.split('#');
            const entry = await strapi
                .plugin(APP_NAME)
                .service('service')
                .getEntryData(contentTypeID, entryID, locale);
            return entry;
        } catch (error) {
            strapi.log.error(error);
            return ctx.badRequest('Failed to get entry data', { error: error.message });
        }
    },
    async getHistory(ctx) {
        try {
            const { entryUid } = ctx.request.query;
            const decodedEntryUid = entryUid ? decodeURIComponent(entryUid) : undefined;
            const result = await strapi.plugin(APP_NAME).service('service').getHistory(decodedEntryUid);
            ctx.status = 200;
            ctx.body = result;
        } catch (err) {
            strapi.log.error(err);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch history' };
        }
    },
    async deleteHistory(ctx) {
        try {
            const { uid } = ctx.request.body;
            if (!uid)
                throw new Error("Invalid uid. Cannot delete history entry.");

            const success = await strapi.plugin(APP_NAME).service('service').deleteHistory(uid);
            if (success)
            {
                ctx.status = 204;
                return ctx;
            }
        }
        catch (err) {
            strapi.log.error(err);
        }

        ctx.status = 500;
        ctx.body = { error: 'Failed to delete history entry' };
    }
});

export default controller;
