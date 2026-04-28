export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();

const { messages } = req.body;
const response = await fetch(‘https://api.groq.com/openai/v1/chat/completions’, {
method: ‘POST’,
headers: {
Authorization': Bearer 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,
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({
model: “llama3-70b-8192”,
messages: [
{role: “system”, content: “You are Richard, an ancient Hebrew Biblical scholar with deep knowledge of the Torah, Dead Sea Scrolls, Second Temple Judaism, and Masoretic traditions. Speak with wisdom and warmth.”},
…messages
]
})
});

const data = await response.json();
res.status(200).json(data);
}

