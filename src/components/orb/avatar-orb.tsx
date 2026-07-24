"use client";

import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import type { AgentState, AvatarIdentity } from "@accidental-revenue/orbsona";

interface AvatarOrbProps {
  identity: AvatarIdentity;
  state: AgentState;
  className?: string;
  inputLevel?: number;
  outputLevel?: number;
}

export function AvatarOrb({ identity, state, className, inputLevel, outputLevel }: AvatarOrbProps) {
  return (
    <AgentAvatar
      identity={identity}
      state={state}
      className={className}
      inputLevel={inputLevel}
      outputLevel={outputLevel}
    />
  );
}
