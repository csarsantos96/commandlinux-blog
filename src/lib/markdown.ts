import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('hcl', plaintext)
hljs.registerLanguage('terraform', plaintext)
hljs.registerLanguage('plaintext', plaintext)

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',

    highlight(code, lang) {
      // Mermaid não pode passar pelo highlight.js
      if (lang === 'mermaid') {
        return code
      }

      const language = hljs.getLanguage(lang) ? lang : 'plaintext'

      return hljs.highlight(code, { language }).value
    },
  })
)

marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === 'mermaid') {
        return `<pre class="mermaid">${escapeHtml(text)}</pre>`
      }

      // Deixa os outros blocos continuarem com o render padrão
      return false
    },
  },
})

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}