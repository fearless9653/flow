import useVirtual from 'react-cool-virtual'

import { scale } from '../platform'

export const LIST_ITEM_SIZE = scale(24, 32)
export function useList(array: Readonly<any[]> | undefined = []) {
  return useVirtual<HTMLDivElement>({
    itemCount: array?.length ?? 0,
    itemSize: LIST_ITEM_SIZE,
  })
}
