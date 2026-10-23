#!/usr/bin/env node
import fs from 'node:fs/promises';

const REQUIRED = ['serviceId', 'name', 'description', 'category', 'entryUrl', 'sourcePage', 'platform', 'requiresLogin', 'confidence'];
const REQUIRED_TEXT = ['serviceId', 'name', 'description', 'category', 'entryUrl', 'sourcePage', 'platform'];
const URL_FIELDS = ['entryUrl', 'sourcePage'];
const STRING_ARRAY_FIELDS = ['aliases', 'audiences', 'accessHints', 'tags'];
const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validatePublicUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '必须使用 HTTP 或 HTTPS 协议。';
    if (url.username || url.password) return '不得在 URL 中包含用户名或密码。';
    return null;
  } catch {
    return '不是有效 URL。';
  }
}

export async function validateDirectory(file) {
  const errors = [];
  let document;
  try { document = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { return { valid: false, errors: [`无法读取或解析目录：${error.message}`], serviceCount: 0 }; }

  if (!isRecord(document)) {
    return { valid: false, errors: ['目录必须是 JSON 对象。'], serviceCount: 0 };
  }
  if (document?.schemaVersion !== '0.1') errors.push('schemaVersion 必须为 0.1。');
  if (Object.hasOwn(document, 'sourceUrl')) {
    if (typeof document.sourceUrl !== 'string' || !document.sourceUrl.trim()) errors.push('sourceUrl 必须是非空字符串。');
    else {
      const issue = validatePublicUrl(document.sourceUrl);
      if (issue) errors.push(`sourceUrl ${issue}`);
    }
  }
  if (Object.hasOwn(document, 'generatedAt') && (typeof document.generatedAt !== 'string' || !document.generatedAt.trim() || Number.isNaN(Date.parse(document.generatedAt)))) {
    errors.push('generatedAt 必须是有效的日期时间字符串。');
  }

  if (!Array.isArray(document.services)) {
    errors.push('services 必须是数组。');
    return { valid: false, errors, serviceCount: 0, schemaVersion: document.schemaVersion };
  }

  const seen = new Set();
  for (const [index, service] of document.services.entries()) {
    if (!isRecord(service)) {
      errors.push(`services[${index}] 必须是对象。`);
      continue;
    }

    for (const field of REQUIRED) {
      if (!Object.hasOwn(service, field)) errors.push(`services[${index}] 缺少字段 ${field}。`);
    }

    for (const field of REQUIRED_TEXT) {
      if (!Object.hasOwn(service, field)) continue;
      if (typeof service[field] !== 'string' || !service[field].trim()) {
        errors.push(`services[${index}].${field} 必须是非空字符串。`);
      }
    }

    if (typeof service.serviceId === 'string' && service.serviceId.trim()) {
      const serviceId = service.serviceId.trim();
      if (seen.has(serviceId)) errors.push(`services[${index}] serviceId 重复：${serviceId}。`);
      seen.add(serviceId);
    }

    for (const field of URL_FIELDS) {
      if (typeof service[field] !== 'string' || !service[field].trim()) continue;
      const issue = validatePublicUrl(service[field]);
      if (issue) errors.push(`services[${index}].${field} ${issue}`);
    }

    if (Object.hasOwn(service, 'requiresLogin') && typeof service.requiresLogin !== 'boolean') {
      errors.push(`services[${index}].requiresLogin 必须是布尔值。`);
    }
    if (Object.hasOwn(service, 'confidence') && !CONFIDENCE_LEVELS.includes(service.confidence)) {
      errors.push(`services[${index}].confidence 必须是 high、medium 或 low 之一。`);
    }

    for (const field of STRING_ARRAY_FIELDS) {
      if (Object.hasOwn(service, field) && (!Array.isArray(service[field]) || service[field].some((value) => typeof value !== 'string' || !value.trim()))) {
        errors.push(`services[${index}].${field} 必须是字符串数组，且元素为非空字符串。`);
      }
    }

    if (Object.hasOwn(service, 'status') && (typeof service.status !== 'string' || !service.status.trim())) {
      errors.push(`services[${index}].status 必须是非空字符串。`);
    }
  }

  return { valid: errors.length === 0, errors, serviceCount: document.services.length, schemaVersion: document.schemaVersion };
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  const result = await validateDirectory(process.argv[2]);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}
