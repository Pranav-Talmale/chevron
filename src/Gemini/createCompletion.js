import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";

function createCompletionGemeni(stateSetter, messages, key) {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const abortController = new AbortController();

  return {
    controller: abortController,
    promise: new Promise(async (resolve, reject) => {
      try {
        const prompt = messages.map(msg => msg.content).join("\n");
        const result = await model.generateContent(prompt);
        
        let content = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        stateSetter(content);
        resolve({ content, role: "assistant" });
      } catch (error) {
        reject({ code: error.code, message: error.message });
      }
    }),
  };
}

export default createCompletionGemeni;