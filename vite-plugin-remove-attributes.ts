export const removeCrossorigin = () => {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html.replace(/crossorigin/g, '');
    },
  };
};

export const removeModule = () => {
  return {
    name: 'remove-module',
    transformIndexHtml(html: string) {
      return html.replace(/type="module"/g, '');
    },
  };
};
