import { useEffect, useState } from 'react'
import { DashboardService } from '@/modules/dashboard/services/dashboard'

export function useDashboard() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const result = await DashboardService.getDashboard()
                setData(result)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])
    return { loading, data }
}