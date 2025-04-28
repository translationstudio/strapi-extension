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

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async validateToken(ctx) {
    const authHeader = ctx.request.header.authorization;
    if (!authHeader) {
      ctx.status = 401;
      ctx.body = { error: 'Missing authorization header' };
      return false;
    }
    const storedToken = await strapi.plugin('translationstudio').service('service').getToken();
    if (!storedToken?.token || authHeader !== storedToken.token) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
      return false;
    }
    return true;
  },
  async getLicense(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').getLicense();
    if (result.license) {
      ctx.status = 200;
    } else {
      ctx.status = 404;
    }
    ctx.body = result;
  },
  async setLicense(ctx) {
    const license = ctx.request.body.license;
    const result = await strapi.plugin('translationstudio').service('service').setLicense(license);
    if (result.success) {
      ctx.status = 200;
    } else {
      ctx.status = 500;
    }
    ctx.body = result;
  },
  async getToken(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').getToken();
    if (result.token) {
      ctx.status = 200;
    } else {
      ctx.status = 404;
    }
    ctx.body = result;
  },
  async generateToken(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').generateToken();
    ctx.status = 200;
    ctx.body = result;
  },
  async getLanguageOptions(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').getLanguageOptions();
    ctx.status = 200;
    ctx.body = result;
  },
  async requestTranslation(ctx) {
    const payload = ctx.request.body;
    const result = await strapi
      .plugin('translationstudio')
      .service('service')
      .requestTranslation(payload);
    ctx.body = result;
  },
  async exportData(ctx) {
    if (!(await this.validateToken(ctx))) {
      ctx.status = 400;
      return;
    }
    const payload = JSON.parse(ctx.request.body);
    const result = await strapi.plugin('translationstudio').service('service').exportData(payload);
    ctx.status = 200;
    ctx.body = [{ fields: result }];
  },
  async importData(ctx) {
    if (!(await this.validateToken(ctx))) {
      ctx.status = 400;
      return;
    }
    const payload = JSON.parse(ctx.request.body);
    const result = await strapi.plugin('translationstudio').service('service').importData(payload);
    ctx.body = result;
  },
  async ping(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').ping();
    ctx.status = 204;
    ctx.body = result;
  },
  async getLanguages(ctx) {
    if (!(await this.validateToken(ctx))) {
      ctx.status = 400;
      return;
    }
    const result = await strapi.plugin('translationstudio').service('service').getLanguages();
    ctx.status = 200;
    ctx.body = result;
  },
  async getEmail(ctx) {
    const result = await strapi.plugin('translationstudio').service('service').getEmail(ctx);
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
        .plugin('translationstudio')
        .service('service')
        .getEntryData(contentTypeID, entryID, locale);
      return entry;
    } catch (error) {
      return ctx.badRequest('Failed to get entry data', { error: error.message });
    }
  },
});

export default controller;
