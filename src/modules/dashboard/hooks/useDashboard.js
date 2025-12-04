import { useEffect, useState } from 'react'
import { getDashboard } from '@/modules/dashboard/services/dashboard'

export function useDashboard() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const result = await getDashboard()
                setData(result)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])
    return { loading, data }
}