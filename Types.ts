/**
 * Translatable content
 */
export interface TranslationstudioTranslatable {
  field: string;
  type: 'text' | 'html';
  translatableValue: string[];
  realType: string;
  componentInfo?: {
    namePath: string[];
    id: number;
    schemaName: string;
  };
}

// for /languages handling
export interface StrapiLocale {
  id: number;
  documentId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  isDefault: boolean;
}

// Mapped result format at /languages
export interface LocaleMap {
  [code: string]: string;
}

export type MappingsResponse = {
  connector: string;
  id: string;
  'limit-to-cms-projects': any[];
  machine?: boolean;
  name: string;
  source: string;
  targets: string[];
};

export interface FieldSchema {
  type: string;
  private?: boolean;
  component?: string;
  repeatable?: boolean;
}

export interface ConfigurationPayload {
  id: string;
  token: string;
}

export type TranslationRequestTranslations = {
  source: string;
  target: string;
  connector: string;
};

export type TranslationRequestCustomData = {
  key: string;
  value: string;
};

export type TranslationRequestTranslatables = {
  owner: {
    uid: string;
    'display-name': string;
  };
  elements: {
    uid: string;
    'display-name': string;
    version: string;
  };
};

export type TranslationRequestTranslatablesElement = {
  uid: string;
  'display-name': string;
  version?: string;
};

/**
 * Dieser Translation Request geht an das
 * translationstudio - hierzu könnt ihr euch einen MOCK Server bauen,
 * der den Reqeuest entgegen nimmt.
 */
export interface TranslationRequest {
  duedate: number;
  email: string;
  urgent: boolean;
  'project-name': string;
  translations: TranslationRequestTranslations[];
  entry: {
    uid: string;
    name: string;
  };
}

// Type for export request coming from TS
export type ExportRequestElementsInfo = {
  'owner-id': string;
  version: string;
  elements: string[];
};

// Type for import request coming from TS
export type ImportRequestBody = {
  metdata: {
    'cms-project-uid': string;
    'element-uid': string;
    'source-language': string;
    'target-language': string;
    'cms-region': string;
    'client-id': string;
    'cms-environment': string;
  };
  configuration: {
    url: string;
  };
  document: any[];
};

export interface ExportRequestPayload {
  // ---> export route
  data: {
    clientid: string;
    'x-trace-id': string;
    'project-uid': string;
    source: string;
    target: string;
  };
  configuration: string;
  elements: ExportRequestElementsInfo;
}

export type TranslationStatusData = {
  'element-uid': string;
  'element-name': string;
  'target-language': string;
  'time-updated': number;
  'time-requested': number;
  'time-intranslation': number;
  'time-imported': number;
  'project-name': string;
};

export interface OrganizedFields {
  regularFields: TranslationstudioTranslatable[];
  componentFieldsMap: Map<string, TranslationstudioTranslatable[]>;
  dynamicZoneFields: Map<number, TranslationstudioTranslatable[]>;
}

export interface ExportPayload {
  source: string;
  target: string;
  element: string;
}

// {
//   "source": "de",
//   "target":"nyn-UG"
//   "element":"api::collection-component.collection-component#c94ucr8jvtfpuydbaluhadkf"
// }

export interface ImportPayload {
  element: string;
  source: string;
  target: string;
  document: [{ fields: [] }];
}
