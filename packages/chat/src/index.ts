/**
 * `@godxjp/chat` — the conversational UI family (v32 #1223, R4): message bubbles, the composer and
 * its suggestion popover, the conversation list, the thought chain, the welcome block, the
 * attachment tray and the message action bar. They moved out of `@godxjp/ui` with their APIs
 * unchanged; they compose the kit's public primitives and read its tokens and stylesheet, so an app
 * imports `@godxjp/ui/styles` once for both.
 */
export { ChatBubble, ChatBubbleList } from "./chat-bubble";
export type {
  ChatBubbleListProp,
  ChatBubbleListProps,
  ChatBubblePlacementProp,
  ChatBubbleProp,
  ChatBubbleProps,
  ChatBubbleToneProp,
  ChatBubbleTypingProp,
  ChatBubbleVariantProp,
  ChatMessageProp,
} from "./chat-bubble";
export { ChatComposer } from "./chat-composer";
export type {
  ChatComposerProp,
  ChatComposerProps,
  ChatComposerSubmitTypeProp,
} from "./chat-composer";
export { ChatSuggestion } from "./chat-suggestion";
export type {
  ChatSuggestionProp,
  ChatSuggestionProps,
  ChatSuggestionItemProp,
  ChatSuggestionRenderProp,
} from "./chat-suggestion";
export { Attachments } from "./attachments";
export type {
  AttachmentsProp,
  AttachmentsProps,
  AttachmentsItemProp,
  AttachmentsPlaceholderProp,
  AttachmentsOverflowProp,
  AttachmentsRefProp,
} from "./attachments";
export { Conversations } from "./conversations";
export type {
  ConversationsProp,
  ConversationsProps,
  ConversationsItemProp,
  ConversationsDividerProp,
  ConversationsEntryProp,
  ConversationsMenuProp,
  ConversationsMenuItemProp,
  ConversationsGroupableProp,
  ConversationsCreationProp,
} from "./conversations";
export { ThoughtChain, ThoughtChainItem } from "./thought-chain";
export type {
  ThoughtChainProp,
  ThoughtChainProps,
  ThoughtChainItemsProp,
  ThoughtChainItemProp,
  ThoughtChainItemProps,
  ThoughtChainStatusProp,
  ThoughtChainLineProp,
  ThoughtChainVariantProp,
} from "./thought-chain";
export { Welcome } from "./welcome";
export type { WelcomeProp, WelcomeProps, WelcomeVariantProp } from "./welcome";
export { Actions, ActionsItem, ActionsCopy, ActionsFeedback } from "./actions";
export type {
  ActionsProp,
  ActionsProps,
  ActionsItemsProp,
  ActionsItemProp,
  ActionsItemProps,
  ActionsCopyProp,
  ActionsCopyProps,
  ActionsFeedbackProp,
  ActionsFeedbackProps,
  ActionsVariantProp,
  ActionsStatusProp,
  ActionsFeedbackValueProp,
} from "./actions";
