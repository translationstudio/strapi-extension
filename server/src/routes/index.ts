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
