from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)

# Cấu hình API Key Gemini
api_key = "AIzaSyB9ic7dfMcC6Ca8ovbXJP833g8YXturH-s"  # <-- thay bằng key của bạn
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

# Tạo câu hỏi trắc nghiệm
def generate_mcq(paragraph, num_questions):
    prompt = f"""
Từ đoạn văn sau, hãy tạo {num_questions} câu hỏi trắc nghiệm.
Mỗi câu gồm 4 phương án (A, B, C, D), chỉ có 1 đáp án đúng.
Phân loại độ khó: cơ bản (<50), vận dụng (<80), nâng cao (>=80).
Trả về JSON dạng:
[{{"question": "...", "options": [...], "answer": "...", "accuracy": ..., "type": "multiple_choice"}}]

Đoạn văn:
'''{paragraph}'''
"""
    return model.generate_content(prompt).text

@app.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.get_json()
    paragraph = data.get('paragraph')
    num_questions = int(data.get('num_questions', 1))
    try:
        result = generate_mcq(paragraph, num_questions)
        return jsonify({"questions": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
