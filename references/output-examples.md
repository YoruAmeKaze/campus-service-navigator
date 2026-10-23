# Output examples

Navigation result:

```json
{
  "query": "我想办理收入证明",
  "matches": [{
    "name": "收入证明办理",
    "entryUrl": "https://services.example.org/certificate",
    "sourcePage": "https://services.example.org/",
    "requiresLogin": true,
    "confidence": "high",
    "verification": "Official entry link observed on the source page; personal login was not tested."
  }]
}
```

Knowledge-base records are JSONL: one service document per line with a searchable `text` field and complete source metadata.

Final response example:

> 收入证明可先查看[在线证明服务](https://services.example.org/certificate)。该入口由[机构服务中心](https://services.example.org/)列出；我确认的是公开页面可访问，个人申请状态需你登录后查看。

If an official current guide documents an initial login rule, cite the issuing institution's guide and qualify it: “《系统使用指南》（2026版）注明初始登录规则为……；如当前登录页提示不同，以登录页为准。” Do not present a guide's statement as a live-tested login result.
