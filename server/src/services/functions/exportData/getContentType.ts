const getContentType = async (contentTypeID: string) => {
  const contentType = await strapi.contentType(contentTypeID as any);
  if (!contentType?.attributes) {
    throw new Error(`Content type or schema not found: ${contentTypeID}`);
  }
  return contentType;
};

export default getContentType;
