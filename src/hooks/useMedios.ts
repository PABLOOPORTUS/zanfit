import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo } from 'react'
import { db } from '../db'

/** Fotos y videos propios de un ejercicio, del más nuevo al más antiguo. `undefined` mientras carga. */
export function useMediosPropios(exerciseId: number | undefined) {
  return useLiveQuery(
    async () => (exerciseId === undefined ? [] : (await db.medios.where('exerciseId').equals(exerciseId).toArray()).sort((a, b) => b.creadoEn - a.creadoEn)),
    [exerciseId],
  )
}

/** URL temporal para mostrar un Blob; se libera al desmontar o al cambiar el Blob. */
export function useUrlBlob(blob: Blob | undefined): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob])
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url])
  return url
}
