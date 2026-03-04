// utils/translate.js

export async function translateText(text, targetLang = 'es') {
  const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLang,
      format: 'text',
    }),
  });

  if (!response.ok) throw new Error('Error al traducir texto');
  const data = await response.json();
  return data.data.translations[0].translatedText;
}
