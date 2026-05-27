import ko from './i18n/ko.json'
import en from './i18n/en.json'
import { useStore } from './store'

const dicts = { ko, en }
export type Language = keyof typeof dicts

export function useTranslation() {
  const lang = useStore(state => state.language) || 'ko'
  const t = (key: keyof typeof ko) => {
    // @ts-ignore
    return dicts[lang]?.[key] || dicts['en'][key] || key
  }
  return { t, lang }
}
