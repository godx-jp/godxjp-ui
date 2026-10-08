# @godxjp/chat

Conversational UI for GoDX apps, built on `@godxjp/ui`'s public primitives and tokens: message
bubbles and lists, the composer with slash / mention suggestions, the conversation list, thought
chains, the welcome block, attachments and the message action bar. IME-safe, ja / en / vi.

These components shipped inside `@godxjp/ui` until v32 and moved here with their APIs unchanged
(#1223). Only the import changes:

```tsx
// before (v31)
import { ChatBubble, ChatBubbleList } from "@godxjp/ui/data-display";
import { ChatComposer, ChatSuggestion, Attachments } from "@godxjp/ui/data-entry";
import { Conversations } from "@godxjp/ui/navigation";
import { Actions } from "@godxjp/ui/general";

// v32
import {
  Actions,
  Attachments,
  ChatBubble,
  ChatBubbleList,
  ChatComposer,
  ChatSuggestion,
  Conversations,
  ThoughtChain,
  Welcome,
} from "@godxjp/chat";
```

They read the kit's stylesheet and tokens, so an app that already imports `@godxjp/ui/styles`
needs nothing more, and they sit under the same `<AppProvider>` (locale, time zone, theme).
