import React from 'react'
import dynamic from 'next/dynamic'

const StudyTimer = dynamic(() => import('../../../../components/StudyTimer'), { ssr: false })

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Study Timer</h1>
      <p>Simple Pomodoro-style timer. Adjust lengths in component props if needed.</p>
      <StudyTimer />
    </div>
  )
}
