export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();

    const groqBody = {
      model: 'llama-3.3-70b-versatile',
      max_tokens: body.max_tokens || 1000,
      messages: [
        {
          role: 'system',
          content: '당신은 한국 병원 QPS팀을 위한 의료 보고서 작성 도우미입니다. 반드시 한국어로만 답변하세요. 영어, 일본어, 중국어, 베트남어, 한자는 절대 사용하지 마세요. 마크다운 기호(**볼드** 등)도 사용하지 마세요. 의학 전문용어도 한글로 표현하세요.'
        },
        ...(body.messages || [])
      ],
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqBody),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '응답 없음';
    const converted = {
      content: [{ type: 'text', text }]
    };

    return new Response(JSON.stringify(converted), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
