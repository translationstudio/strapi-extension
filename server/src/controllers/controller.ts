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
        if (result.license) {
            ctx.status = 200;
        } else {
            ctx.status = 404;
        }
        ctx.body = result;
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
            const payload = typeof ctx.request.body === "string" ? JSON.parse(ctx.request.body) : ctx.request.body;
            const result = await strapi.plugin(APP_NAME).service('service').exportData(payload);
            ctx.status = 200;
            ctx.body = [{ fields: result }];
        }
        catch (ex) {
            ctx.status = 500;
            ctx.body = { error: ex.message ?? "Generic error" };
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
        if (url) {
            ctx.status = 200;
            ctx.body = { url: url };
        } else {
            ctx.status = 404;
            ctx.body = { url: "" };
        }
    },
    async importData(ctx) {
        if (!(await this.validateToken(ctx))) {
            ctx.status = 400;
            return;
        }

        try {
            const payload = typeof ctx.request.body === "object" ? ctx.request.body : JSON.parse(ctx.request.body);

            strapi.log.info("Importing");
            const result = await strapi.plugin(APP_NAME).service('service').importData(payload);
            ctx.body = { success: result };
            ctx.status = 200;
            return;
        }
        catch (err) {
            strapi.log.error(err.message ?? err);
        }

        ctx.body = { message: "Could not perform import" };
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
        }
        catch (err) {
            ctx.status = 400;
            ctx.body = {}
        }
    },
    async getEmail(ctx) {
        const result = await strapi.plugin(APP_NAME).service('service').getEmail(ctx);
        ctx.body = result;
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
            return ctx.badRequest('Failed to get entry data', { error: error.message });
        }
    },

});

export default controller;
