# Output examples

Navigation result:

```json
{
  "query": "我想查期末成绩",
  "matches": [{
    "name": "成绩查询",
    "entryUrl": "https://jwc.example.edu.cn/grade",
    "sourcePage": "https://jwc.example.edu.cn/",
    "requiresLogin": true,
    "confidence": "high"
  }]
}
```

Knowledge-base records are JSONL: one service document per line with a searchable `text` field and complete source metadata.
