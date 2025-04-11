const extractRichtextContent = (content: any): string[] => {
  const extractText = (node: any): string[] => {
    if (node?.text) {
      return [node.text];
    } else if (Array.isArray(node?.children)) {
      return node.children.flatMap(extractText);
    } else {
      return [];
    }
  };

  if (Array.isArray(content)) {
    return content.flatMap(extractText);
  } else {
    return extractText(content);
  }
};


export default extractRichtextContent;
