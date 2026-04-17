const fs = require('fs');
let code = fs.readFileSync('app/api/chat/route.ts', 'utf-8');

code = code.replace(
  `return result.toTextStreamResponse();`,
  `return result.toUIMessageStreamResponse();`
);

fs.writeFileSync('app/api/chat/route.ts', code);
