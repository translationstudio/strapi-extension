# translationstudio Strapi Extension

## Installation

Install this plugin via 

```bash
npm i @translationstudio/translationstudio-strapi-extension
```

## Configuration 

Once the plugin is installed, navigate to the extension's configuration entry in Strapi's admin panel

Generate your access token and add it to your account.translationstudio.tech Strapi configuration

Add your translationstudio license (account.translationstudio.tech) and click on save

## Development

Follow these steps:

1. run `npm install -g yalc` in this folder
2. run `npm install` (if there are errors, add `--legacy-peer-deps`)
3. run `npm run:watch link` in this folder
4. Create a new strapi project and enter the folder
5. run `npx yalc add --link _translationstudio-strapi-extension_`
6. start strapi in development mode

### Publish package update

1. Update version number
2. run `npm run build`
3. run `npm publish --access public`

