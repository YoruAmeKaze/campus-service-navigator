#!/usr/bin/env node
import fs from 'node:fs/promises';

const REQUIRED = ['serviceId', 'name', 'entryUrl', 'sourcePage', 'platform', 'requiresLogin', 'confidence'];

export async function validateDirectory(file) {
  const errors = [];
  let document;
  try { document = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { return { valid: false, errors: [`无法读取或解析目录：${error.message}`], serviceCount: 0 }; }
  if (!document || typeof document !== 'object' || Array.isArray(document)) errors.push('目录必须是 JSON 对象。');
  if (document?.schemaVersion !== '0.1') errors.push('schemaVersion 必须为 0.1。');
  if (!Array.isArray(document?.services)) errors.push('services 必须是数组。');
  const seen = new Set();
  for (const [index, service] of (document?.services || []).entries()) {
    for (const field of REQUIRED) if (!(field in (service || {}))) errors.push(`services[${index}] 缺少字段 ${field}。`);
    if (service?.serviceId && seen.has(service.serviceId)) errors.push(`services[${index}] serviceId 重复：${service.serviceId}。`);
    if (service?.serviceId) seen.add(service.serviceId);
    for (const field of ['entryUrl', 'sourcePage']) {
      try { if (service?.[field]) new URL(service[field]); }
      catch { errors.push(`services[${index}].${field} 不是有效 URL。`); }
    }
    if (typeof service?.requiresLogin !== 'boolean') errors.push(`services[${index}].requiresLogin 必须是布尔值。`);
  }
  return { valid: errors.length === 0, errors, serviceCount: document?.services?.length || 0, schemaVersion: document?.schemaVersion };
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  const result = await validateDirectory(process.argv[2]);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}
