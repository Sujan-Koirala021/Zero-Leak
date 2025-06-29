import { CopilotKit } from '@copilotkit/react-core'
import React from 'react'
import ZeroLeakAgent from './expanded-view'

function ExplorePage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="zeroleak-agent">
    <ZeroLeakAgent/>
    </CopilotKit>
  )
}

export default ExplorePage