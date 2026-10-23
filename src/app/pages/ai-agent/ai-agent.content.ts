import { t, type Dictionary } from 'intlayer';

const aiAgentContent = {
  key: 'ai-agent',
  content: {
    title: t({
      en: 'AI Agents & Business Automation',
      hy: 'AI գործակալներ և բիզնես ավտոմատացում',
      ru: 'AI-агенты и автоматизация бизнеса',
    }),
  },
} as const satisfies Dictionary;

export default aiAgentContent;
