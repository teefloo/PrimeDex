export function getFormDisplayName(name: string, baseLocalizedName: string, lang: string): string {
  const megaPrefix = lang === 'fr' ? 'M' + String.fromCharCode(233) + 'ga' : 'Mega';
  const primalPrefix = lang === 'fr' ? 'Primo' : 'Primal';
  if (name.includes('-mega-x')) {
    return baseLocalizedName + '-' + megaPrefix + ' X';
  }
  if (name.includes('-mega-y')) {
    return baseLocalizedName + '-' + megaPrefix + ' Y';
  }
  if (name.includes('-mega')) {
    return baseLocalizedName + '-' + megaPrefix;
  }
  if (name.includes('-primal')) {
    return baseLocalizedName + '-' + primalPrefix;
  }
  if (name.includes('-ultra')) {
    return lang === 'fr' ? baseLocalizedName + '-Ultra' : 'Ultra-' + baseLocalizedName;
  }
  return baseLocalizedName;
}
