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
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { SettingsIcon } from './components/SettingsIcon';
import TranslationMenu from './components/TranslationMenu';
import { HistoryIcon } from './components/HistoryIcon';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: SettingsIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "translationstudio Settings",
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}/history`,
      icon: HistoryIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.history`,
        defaultMessage: 'translationstudio Dashboard',
      },
      Component: async () => {
        const { HistoryPage } = await import('./pages/HistoryPage');

        return HistoryPage;
      },
    });

    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'translation-menu',
      Component: TranslationMenu,
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTranslations = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: getTranslation(data),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return importedTranslations;
  },
};
