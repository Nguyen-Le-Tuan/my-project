// import React, { useState } from 'react'
// import { generateQuestions } from '@/ai/flows/generate-questions'

// export default function QuestionGenerator() {
//   const [inputText, setInputText] = useState('')
//   const [questions, setQuestions] = useState('')

//   const handleGenerate = async () => {
//     const res = await generateQuestions(inputText, 3)
//     setQuestions(res)
//   }

//   return (
//     <div>
//       <h2>Nhập đoạn văn:</h2>
//       <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={6} cols={50} />
//       <button onClick={handleGenerate}>Tạo câu hỏi</button>
//       <h3>Kết quả:</h3>
//       <pre>{questions}</pre>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { generateQuestions } from '@/ai/flows/generate-questions'
import { Button } from '@/components/ui/button'

type Props = {
  profilePicture: string | null
}

export default function QuestionGenerator({ profilePicture }: Props) {
  const [paragraph, setParagraph] = useState('')
  const [result, setResult] = useState<string>('')

  const handleClick = async () => {
    try {
      const res = await generateQuestions(paragraph, 10) // lấy 10 câu hỏi
      setResult(res)
    } catch (err) {
      setResult('Lỗi khi gọi API Flask')
    }
  }

  return (
    <div className="space-y-4 pl-[200px]">
      <h2 className="text-xl font-semibold">Sinh câu hỏi trắc nghiệm từ đoạn văn</h2>
      <textarea
        value={paragraph}
        onChange={(e) => setParagraph(e.target.value)}
        placeholder="Nhập đoạn văn ở đây..."
        rows={3}
        className="w-full border rounded p-1"
      />
      <Button onClick={handleClick}>Tạo câu hỏi</Button>
      {result && (
        <div className="mt-4 p-4 bg-muted rounded">
          <h3 className="font-bold mb-2">Kết quả:</h3>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
