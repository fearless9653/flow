import Dexie from 'dexie'

import { ColorScheme, useColorScheme, useTranslation } from '@flow/reader/hooks'
import { useSettings } from '@flow/reader/state'

import { Button } from '../Button'
import { Checkbox, Select } from '../Form'
import { Page } from '../Page'

export const Settings: React.FC = () => {
  const { scheme, setScheme } = useColorScheme()
  const [settings, setSettings] = useSettings()
  const t = useTranslation('settings')

  return (
    <Page headline={t('title')}>
      <div className="space-y-6">
        {/* Language selector is hidden as per requirement */}
        {/* <Item title={t('language')}>
          <Select
            value={locale}
            onChange={(e) => {
              push(asPath, undefined, { locale: e.target.value })
            }}
          >
            <option value="en-US">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="ja-JP">日本語</option>
          </Select>
        </Item> */}
        <Item title={t('color_scheme')}>
          <Select
            value={scheme}
            onChange={(e) => {
              setScheme(e.target.value as ColorScheme)
            }}
          >
            <option value="system">{t('color_scheme.system')}</option>
            <option value="light">{t('color_scheme.light')}</option>
            <option value="dark">{t('color_scheme.dark')}</option>
          </Select>
        </Item>
        <Item title={t('text_selection_menu')}>
          <Checkbox
            name={t('text_selection_menu.enable')}
            checked={settings.enableTextSelectionMenu}
            onChange={(e) => {
              setSettings({
                ...settings,
                enableTextSelectionMenu: e.target.checked,
              })
            }}
          />
        </Item>
        {/* Removed Synchronization section */}
        <Item title={t('cache')}>
          <Button
            variant="secondary"
            onClick={() => {
              window.localStorage.clear()
              Dexie.getDatabaseNames().then((names) => {
                names.forEach((n) => Dexie.delete(n))
              })
            }}
          >
            {t('cache.clear')}
          </Button>
        </Item>
      </div>
    </Page>
  )
}

// Removed Synchronization component

interface PartProps {
  title: string
}
const Item: React.FC<PartProps> = ({ title, children }) => {
  return (
    <div>
      <h3 className="typescale-title-small text-on-surface-variant">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

Settings.displayName = 'settings'
