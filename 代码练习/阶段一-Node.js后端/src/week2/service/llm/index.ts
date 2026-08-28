export async function callLLM(prompt: string) {
    const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        }),
    })
    if (!res.ok) throw new Error(`LLM 调用失败`)
    const data = await res.json()
    return data.choices[0].text
}

export const callDeepSeek = async (prompt: string) => {
    const res = await fetch('https://api.deepseek.ai/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'DeepSeek',
            messages: [{ role: 'user', content: prompt }],
        }),
    })
    if (!res.ok) throw new Error(`DeepSeek 调用失败`)
    const data = await res.json()
    return data.choices[0].text
}

export const callWeather = async (prompt: string) => {
    const res = await fetch('https://api.weather.com/v1/current_conditions.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WEATHER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        }),
    })
    if (!res.ok) throw new Error(`Weather 调用失败`)
    const data = await res.json()
    return data.choices[0].text
}
