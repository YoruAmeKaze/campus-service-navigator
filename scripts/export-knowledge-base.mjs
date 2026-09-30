#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateDirectory } from './validate-directory.mjs';

export async function exportKnowledgeBase(input, outDir) {
  const validation = await validateDirectory(input);
  if (!validation.valid) return { ...validation, output: null };
  const directory = JSON.parse(await fs.readFile(input, 'utf8'));
  await fs.mkdir(outDir, { recursive: true });
  const lines = directory.services.map((service) => JSON.stringify({
    id: service.serviceId,
    text: [service.name, service.description, ...(service.aliases || []), ...(service.accessHints || [])].filter(Boolean).join('。'),
    metadata: { ...service, source: service.sourcePage }
  }));
  const categories = new Map();
  for (const service of directory.services) categories.set(service.category || '未分类', (categories.get(service.category || '未分类') || 0) + 1);
  const report = `# 校园服务目录报告\n\n- 生成时间：${directory.generatedAt || new Date().toISOString()}\n- 来源入口：${directory.sourceUrl || '未提供'}\n- 服务数量：${directory.services.length}\n\n## 分类统计\n\n${[...categories].map(([name, count]) => `- ${name}：${count}`).join('\n') || '- 暂无'}\n\n## 待复核\n\n${directory.services.filter((s) => s.status !== 'active' || s.confidence === 'low').map((s) => `- ${s.name}（${s.status || 'unknown'}，${s.confidence || 'unknown'}）`).join('\n') || '- 暂无'}\n\n## 限制\n\n仅包含公开页面中的服务元数据和办理线索；登录要求、链接状态和描述均需人工复核。\n`;
  await fs.writeFile(path.join(outDir, 'knowledge-base.jsonl'), `${lines.join('\n')}\n`);
  await fs.writeFile(path.join(outDir, 'REPORT.md'), report);
  await fs.writeFile(path.join(outDir, 'service-directory.json'), `${JSON.stringify(directory, null, 2)}\n`);
  return { ...validation, output: { directory: path.join(outDir, 'service-directory.json'), knowledgeBase: path.join(outDir, 'knowledge-base.jsonl'), report: path.join(outDir, 'REPORT.md') } };
}
