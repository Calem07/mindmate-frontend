import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listRecentMessagesTool from "./tools/list-recent-messages";
import sendMessageToLunaTool from "./tools/send-message-to-luna";

// The OAuth issuer MUST be the direct Supabase host. VITE_SUPABASE_PROJECT_ID
// is inlined by Vite at build time and survives publish; SUPABASE_URL is
// rewritten to the `.lovable.cloud` proxy which mcp-js rejects.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mindmate-mcp",
  title: "MindMate",
  version: "0.1.0",
  instructions:
    "Tools for MindMate — a student wellness companion. Use `get_profile` to read the signed-in user's level/XP/bond, `list_recent_luna_messages` to read recent Luna chat history, and `send_message_to_luna` to chat with Luna (persists to the user's history).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listRecentMessagesTool, sendMessageToLunaTool],
});
