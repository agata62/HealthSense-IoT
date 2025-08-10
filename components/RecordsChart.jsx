// components/RecordsChart.jsx
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function RecordsChart({ records, rangeHours }) {
  const toMs = (ts) => (!ts ? 0 : ts < 1e12 ? ts * 1000 : ts)
  const nowMs = Date.now()
  const cutoffMs = nowMs - rangeHours * 3600 * 1000
  const filtered = (records || []).filter((r) => toMs(r.ts) >= cutoffMs)

  const labels = filtered.map((r) => new Date(toMs(r.ts)))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nhịp tim (BPM)',
        data: filtered.map((r) => r.heart_rate ?? r.bpm ?? 0),
        borderColor: '#ff6b6b',
        backgroundColor: (ctx) => {
          const { ctx: gctx, chartArea } = ctx.chart
          if (!chartArea) return 'rgba(255, 107, 107, 0.1)'
          const gradient = gctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(255, 107, 107, 0.25)')
          gradient.addColorStop(1, 'rgba(255, 107, 107, 0.02)')
          return gradient
        },
        fill: 'origin',
        yAxisID: 'y1',
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'SpO₂ (%)',
        data: filtered.map((r) => r.spo2 ?? 0),
        borderColor: '#4ecdc4',
        backgroundColor: (ctx) => {
          const { ctx: gctx, chartArea } = ctx.chart
          if (!chartArea) return 'rgba(78, 205, 196, 0.1)'
          const gradient = gctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(78, 205, 196, 0.25)')
          gradient.addColorStop(1, 'rgba(78, 205, 196, 0.02)')
          return gradient
        },
        fill: 'origin',
        yAxisID: 'y2',
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        type: 'time',
        time: { unit: rangeHours <= 24 ? 'hour' : rangeHours <= 168 ? 'day' : 'week' },
        title: { display: true, text: 'Thời gian' },
        grid: { display: false }
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Nhịp tim (BPM)' },
        min: 50,
        max: 120,
        ticks: { stepSize: 10 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'SpO₂ (%)' },
        min: 90,
        max: 100,
        ticks: { stepSize: 2 },
        grid: { drawOnChartArea: false }
      }
    },
    plugins: {
      title: { display: true, text: 'Biểu đồ theo dõi sức khỏe' },
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items) => items?.[0]?.label || '',
          label: (item) => `${item.dataset.label}: ${item.formattedValue}`
        }
      }
    }
  }

  return (
    <div className="chart-container">
      {filtered.length > 0 ? (
        <div style={{ height: 380 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📈</div>
          <h3>Chưa có dữ liệu</h3>
          <p>Chưa có dữ liệu sức khỏe trong khoảng thời gian này.</p>
          <p>Hãy kết nối thiết bị ESP32 để bắt đầu thu thập dữ liệu.</p>
        </div>
      )}
    </div>
  )
}


