// src/components/progress/WeightChart.tsx
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { WeightEntry } from '../../types'

export default function WeightChart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [range, setRange] = useState<30 | 60 | 90>(30)
  const [showLogger, setShowLogger] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  const { data: entries = [] } = useQuery({
    queryKey: ['weight_log', user?.id, range],
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - range)
      const { data } = await supabase
        .from('weight_log')
        .select('*')
        .eq('user_id', user!.id)
        .gte('logged_at', since.toISOString().split('T')[0])
        .order('logged_at', { ascending: true })
      return (data ?? []) as WeightEntry[]
    },
    enabled: !!user,
  })

  const logWeight = useMutation({
    mutationFn: async (weight: number) => {
      const { error } = await supabase.from('weight_log').upsert({
        user_id: user!.id,
        weight,
        unit: 'kg',
        logged_at: new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id,logged_at' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight_log', user?.id] })
      setShowLogger(false)
      setNewWeight('')
    },
  })

  const chartData = entries.map((e) => ({
    date: new Date(e.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: e.weight,
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary font-bold">Weight</h2>
        <div className="flex gap-2">
          {([30, 60, 90] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium
                ${range === r ? 'bg-accent-red text-white' : 'bg-bg-elevated text-text-secondary'}`}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: '#6B6B6B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#6B6B6B', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: 12 }}
                labelStyle={{ color: '#B0B0B0' }}
                itemStyle={{ color: '#E53935' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#E53935" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#E53935' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-text-tertiary text-sm text-center py-8">No weight data yet. Log your first entry!</p>
      )}

      <button onClick={() => setShowLogger(true)}
        className="w-full border border-border text-text-secondary py-3 rounded-xl text-sm">
        + Log weight
      </button>

      {showLogger && (
        <div className="bg-bg-elevated rounded-xl p-4 flex gap-3">
          <input
            type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
            placeholder="75.0" className="flex-1 bg-bg-card text-text-primary px-3 py-2 rounded-lg border border-transparent focus:border-accent-red focus:outline-none"
          />
          <button onClick={() => logWeight.mutate(parseFloat(newWeight))}
            className="bg-accent-red text-white px-4 py-2 rounded-lg font-semibold text-sm">
            Save
          </button>
        </div>
      )}
    </div>
  )
}
