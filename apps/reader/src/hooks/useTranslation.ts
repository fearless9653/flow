import { useRouter } from 'next/router'
import { useCallback } from 'react'

import locales from '../../locales'

export function useTranslation(scope?: string) {
  const { locale = 'en-US' } = useRouter()

  return useCallback(
    (key: string) => {
      // @ts-ignore
      const localeData = locales[locale]
      const translationKey = scope ? `${scope}.${key}` : key
      return ((localeData && localeData[translationKey]) as string) || key
    },
    [locale, scope],
  )
}
