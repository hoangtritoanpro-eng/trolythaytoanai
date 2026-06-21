import { GoogleGenAI, Content } from "@google/genai";
import { SendMessageParams, Role, ChatMessage } from "../types";

// Initialize the client
// API Key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là "Thầy Phúc", một trợ lý giáo dục chuyên nghiệp, kiên nhẫn và giỏi sư phạm, đặc biệt là môn Toán.

NHIỆM VỤ CỦA BẠN:
1. Hỗ trợ người dùng giải đáp thắc mắc, giải bài tập.
2. Nếu người dùng gửi hình ảnh:
   - Bước 1: "OCR" (Nhận dạng quang học): Bạn phải viết lại chính xác nội dung văn bản có trong ảnh.
   - Bước 2: "Giải đáp": Sau khi viết lại đề bài, bạn hãy cung cấp lời giải chi tiết hoặc câu trả lời.
3. Nếu người dùng chỉ gửi văn bản, hãy trả lời trực tiếp.

QUY TẮC ĐỊNH DẠNG TOÁN HỌC (RẤT QUAN TRỌNG):
- TẤT CẢ các công thức toán học, biểu thức, ký hiệu, biến số (x, y, z...) trong cả phần OCR và phần lời giải ĐỀU PHẢI được viết dưới dạng LaTeX.
- BẮT BUỘC phải bọc code LaTeX trong dấu dollar đơn ($...$) để hiển thị inline hoặc block.
  - Ví dụ đúng: "Giải phương trình $x^2 + 2x + 1 = 0$ ta được..."
  - Ví dụ sai: "Giải phương trình x^2 + 2x + 1 = 0 ta được..."
  - Ví dụ sai: "Giải phương trình \( x^2 \)..."
- Trình bày lời giải gãy gọn, chia thành các bước rõ ràng.

Tông giọng: Thân thiện, khuyến khích, xưng hô là "Thầy" và "em".
`;

export const sendMessageToGemini = async (
  currentMessage: SendMessageParams,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const model = "gemma-4-26b-a4b-it"; // Good balance of speed and vision capabilities

    // Format history for the API
    // We only take the last few turns to save context window if needed, but for now take all valid ones
    // Note: Gemini API requires alternating user/model turns.
    const historyContents: Content[] = history
      .filter(msg => !msg.isError)
      .map((msg) => ({
        role: msg.role === Role.USER ? "user" : "model",
        parts: [
          { text: msg.text }
          // Note: We are not sending back previous images in history to save tokens/bandwidth in this simple implementation,
          // only the text context. Ideally, we would need to handle multi-turn vision chat more carefully.
        ],
      }));

    // Construct the current message content
    const parts: any[] = [];
    
    // Add image if present
    if (currentMessage.imageBase64 && currentMessage.mimeType) {
        // Strip the data:image/png;base64, prefix if strictly needed, 
        // but @google/genai usually expects raw base64 data in inlineData
        const base64Data = currentMessage.imageBase64.split(',')[1]; 
        
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: currentMessage.mimeType
            }
        });
    }

    // Add text prompt
    // If it's an image input, we reinforce the OCR instruction
    let textPrompt = currentMessage.text;
    if (currentMessage.imageBase64) {
        textPrompt = `(Người dùng gửi kèm ảnh) ${textPrompt || "Hãy giúp em giải bài này."}\n\nHãy nhớ thực hiện OCR đề bài trước (viết lại đề bài với công thức LaTeX trong dấu $), sau đó mới giải.`;
    }

    parts.push({ text: textPrompt });

    // Since generateContent is stateless (unless using chat session), we technically send the whole history + new message
    // However, to keep it simple and robust with vision, let's use generateContent with the system instruction.
    // If we want chat history *with* vision, we generally append history to the prompt or use a chat session.
    // Given the complexity of mixing vision + chat history in a simple array, 
    // we will construct a single 'contents' array containing the history + new turn.
    
    const contents = [
        ...historyContents,
        {
            role: "user",
            parts: parts
        }
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more precise math/OCR
      }
    });

    return response.text || "Thầy xin lỗi, thầy không thể đọc được nội dung lúc này.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Có lỗi xảy ra khi kết nối với Thầy Phúc.");
  }
};
