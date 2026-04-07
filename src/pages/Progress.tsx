// src/pages/Progress.tsx
import Card from '../components/ui/Card'
import WeightChart from '../components/progress/WeightChart'
import StreakDisplay from '../components/progress/StreakDisplay'

export default function Progress() {
  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-text-primary text-3xl font-bold">Progress</h1>
      </div>
      <div className="px-5 space-y-4">
        <Card><WeightChart /></Card>
        <div>
          <h2 className="text-text-primary font-bold mb-3">Streaks</h2>
          <StreakDisplay />
        </div>
      </div>
    </div>
  )
}
