import {
  Cog,
  BrainCircuit,
  Settings2,
  Wrench,
  Bot,
  RefreshCw,
  LucideProps,
} from "lucide-react";
import { ComponentType } from "react";

const icons: Record<string, ComponentType<LucideProps>> = {
  Cog,
  BrainCircuit,
  Settings2,
  Wrench,
  Bot,
  RefreshCw,
};

export function ServiceIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = icons[name] ?? Cog;
  return <Icon {...props} />;
}
