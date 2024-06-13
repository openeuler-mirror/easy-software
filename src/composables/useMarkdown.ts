import Markdown from 'markdown-it';

import { addCopyBtn } from '@/utils/markdown';

export const useMarkdown = () => {
  // isCopy： 复制功能
  const mkit = (
    data: string,
    options: {
      isCopy?: boolean;
      Tag: string;
    } = { isCopy: false, Tag: '' }
  ) => {
    const md: Markdown = new Markdown({
      html: true,
      linkify: false,
      highlight: function (str: string) {
        const escapeHtmlStr = md.utils.escapeHtml(str);
        const lines = escapeHtmlStr.split(/\n/);
        if (options.isCopy) {
          let copyText = lines[0];
          for (let i = 1, len = lines.length; i < len; i++) {
            copyText += `&#10;${lines[i]}`;
          }
          return (
            `<pre class="hljs">` +
            `<code>${escapeHtmlStr.replace('{Tag}', options.Tag)}</code>` +
            `<div class="pre-copy copy" data-clipboard-text="${copyText.replace('{Tag}', options.Tag)}">` +
            `<i class="icon-copy copy"></i>` +
            `</div>` +
            `</pre>`
          );
        } else {
          return '';
        }
      },
    });

    if (options.isCopy) {
      addCopyBtn();
    }

    return md.render(data);
  };

  return {
    mkit,
  };
};
