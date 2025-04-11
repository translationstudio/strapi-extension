const isFieldLocalizable = (fieldSchema: any, parentSchema: any): boolean => {
  // First check if field has explicit localization setting
  if (fieldSchema.pluginOptions?.i18n?.localized !== undefined) {
    return fieldSchema.pluginOptions.i18n.localized;
  }

  // If field doesn't have explicit setting but parent schema has i18n enabled,
  // then basic content fields are localizable by default
  if (parentSchema.pluginOptions?.i18n?.localized === true) {
    // These are the field types that can be localized
    const localizableTypes = ['string', 'text', 'blocks', 'richtext'];
    return localizableTypes.includes(fieldSchema.type);
  }
  return false;
};

export default isFieldLocalizable;
