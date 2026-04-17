const fs = require('fs');
let code = fs.readFileSync('app/api/chat/route.ts', 'utf-8');

code = code.replace(
  `import { streamText } from "ai";`,
  `import { streamText, convertToCoreMessages } from "ai";`
);

code = code.replace(
  `messages,`,
  `messages: convertToCoreMessages(messages),`
);

fs.writeFileSync('app/api/chat/route.ts', code);
