import { postRequest } from "../clients/lagoClient";

async function setContext(appId, userId, conversationId, systemContext) {
  const contextData = {
    app_id: appId,
    user_id: userId,
    conversation_id: conversationId,
    system_context: systemContext,
  };
  const response = await postRequest("/chat/context", contextData);
  return response.data.conversation_id;
}

export { setContext };
