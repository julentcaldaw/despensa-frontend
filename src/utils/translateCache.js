// utils/translateCache.js

export async function translateWithCache(text, targetLang = 'es') {
  const cacheKey = `translation_${targetLang}_${text}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  // Importar la función original
  const { translateText } = await import('./translate');
  const translated = await translateText(text, targetLang);
  localStorage.setItem(cacheKey, translated);
  return translated;
}
