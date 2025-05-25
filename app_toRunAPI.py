# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import google.generativeai as genai
# import json
# import re
# # Khởi tạo Flask app
# app = Flask(__name__)
# CORS(app)

# # Cấu hình API Key Gemini
# api_key = "AIzaSyB9ic7dfMcC6Ca8ovbXJP833g8YXturH-s"  # <-- thay bằng key của bạn
# genai.configure(api_key=api_key)
# model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

# # Tạo câu hỏi trắc nghiệm
# def generate_mcq(paragraph, num_questions):
#     prompt = f"""
# Từ đoạn văn sau, hãy tạo {num_questions} câu hỏi trắc nghiệm.
# Mỗi câu gồm 4 phương án (A, B, C, D), chỉ có 1 đáp án đúng.
# Phân loại độ khó: cơ bản (<50), vận dụng (<80), nâng cao (>=80).
# Trả về JSON dạng:
# [{{"question": "...", "options": [...], "answer": "...", "accuracy": ..., "type": "multiple_choice"}}]

# Đoạn văn:
# '''{paragraph}'''
# """
#     return model.generate_content(prompt).text

# # Định dạng lại Json thành text câu hỏi trắc nghiệm:
# def format_questions(questions):
#     output = ""
#     for i, q in enumerate(questions, 1):
#         # Xác định độ khó
#         do_kho = "Cơ bản" if q["accuracy"] < 50 else "Vận dụng" if q["accuracy"] < 80 else "Nâng cao"
#         # Xác định đáp án đúng
#         answer_index = q["options"].index(q["answer"])
#         answer_letter = ["A", "B", "C", "D"][answer_index]

#         output += f"""Câu hỏi {i} ({q["type"]})

# Độ khó: {do_kho}

# Nội dung: {q["question"]}

# • A. {q["options"][0]}
# • B. {q["options"][1]}
# • C. {q["options"][2]}
# • D. {q["options"][3]}

# Đáp án đúng: {answer_letter}

# """
#     return output


# @app.route('/generate-question', methods=['POST'])
# def generate_question():
#     data = request.get_json()
#     paragraph = data.get('paragraph')
#     num_questions = int(data.get('num_questions', 1))
#     try:
#         result = generate_mcq(paragraph, num_questions)
#         return jsonify({"questions": result})
#         # questions = json.loads(result)
#         # formatted = format_questions(questions)
#         # return formatted, 200, {'Content-Type': 'text/plain; charset=utf-8'}
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)

# Cấu hình API Key Gemini
api_key = "AIzaSyB9ic7dfMcC6Ca8ovbXJP833g8YXturH-s"  # <-- thay bằng key của bạn
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

# Hàm tạo câu hỏi trắc nghiệm
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

# Hàm tách JSON từ chuỗi kết quả
def extract_json_string(text):
    match = re.search(r"\[\s*{.*?}\s*\]", text, re.DOTALL)
    return match.group(0) if match else None

# Hàm định dạng thành kiểu text giống file mẫu
def format_questions(questions):
    output = ""
    for i, q in enumerate(questions, 1):
        # Xác định độ khó
        do_kho = "Cơ bản" if q["accuracy"] < 50 else "Vận dụng" if q["accuracy"] < 80 else "Nâng cao"
        # Xác định đáp án đúng
        answer_index = q["options"].index(q["answer"])
        answer_letter = ["A", "B", "C", "D"][answer_index]

        output += f"""Câu hỏi {i} ({q["type"]})

Độ khó: {do_kho}

Nội dung: {q["question"]}

• A. {q["options"][0]}
• B. {q["options"][1]}
• C. {q["options"][2]}
• D. {q["options"][3]}

Đáp án đúng: {answer_letter}

"""
    return output

@app.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.get_json()
    paragraph = data.get('paragraph')
    num_questions = int(data.get('num_questions', 1))
    try:
        result = generate_mcq(paragraph, num_questions)
        json_str = extract_json_string(result)

        if not json_str:
            return jsonify({"error": "Không tìm thấy JSON hợp lệ trong kết quả từ Gemini."}), 500

        questions = json.loads(json_str)
        formatted = format_questions(questions)
        return formatted, 200, {'Content-Type': 'text/plain; charset=utf-8'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
