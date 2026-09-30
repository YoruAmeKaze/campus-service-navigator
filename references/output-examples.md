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
    "confidence": "high",
    "verification": "Official entry link observed on the source page; personal login was not tested."
  }]
}
```

Knowledge-base records are JSONL: one service document per line with a searchable `text` field and complete source metadata.

Final response example:

> 学费和住宿费可先查看[学校集中收费平台](https://fees.example.edu.cn/)。该入口由[财务处业务通道页面](https://finance.example.edu.cn/)列出；我确认的是公开页面可访问，个人账单和支付状态需你登录后查看。

If an official current guide documents an initial login rule, cite it and qualify it: “财务处《系统使用指南》（2026版）注明初始密码规则为……；如当前登录页提示不同，以登录页为准。” Do not present a guide's statement as a live-tested login result.
