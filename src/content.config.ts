import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 学习点：四类互斥（见 CONTEXT.md），结构统一
const learningPoint = z.object({
  en: z.string().describe('英文表达本体'),
  gloss: z.string().max(60).describe('英文释义锚（≤10 词）'),
  meaning: z.string().describe('中文释义/辨析'),
  example: z.string().describe('英文例句'),
  note: z.string().optional().describe('补充说明（弱读/语域等）'),
});

const quizItem = z.object({
  question: z.string().describe('英文题干'),
  options: z.array(z.string()).length(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().describe('中文解析'),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    domain: z.string().describe('场景域（月度主题）'),
    subScenario: z.string().describe('子场景（当日情境）'),
    material: z.object({
      platform: z.enum(['bilibili', 'youtube']),
      url: z.string().url().describe('素材源链接（专栏/视频页均可）'),
      videoUrl: z.string().url().nullish().describe('视频直链，待提供时可缺省'),
      duration: z.string().optional().describe('视频时长，如 12:40'),
      source: z.string().describe('素材来源标注（频道名/UP主）'),
    }),
    keywords: z.array(learningPoint).default([]),
    phrases: z.array(learningPoint).default([]),
    idioms: z.array(learningPoint).default([]),
    grammar: z.array(learningPoint).default([]),
    quiz: z.array(quizItem).max(5).default([]),
  }),
});

export const collections = { lessons };
