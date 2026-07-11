export interface Service {
  slug: string;
  name: string;
  shortDescription: string;
  description: string[];
  icon: string; // lucide-react icon name
}

export const services: Service[] = [
  {
    slug: "machine-tools",
    name: "Machine Tools",
    shortDescription:
      "Supply of CNC machining centres, lathes, and conventional machine tools for production and tooling shops.",
    description: [
      "Neo Synergy supplies a wide range of CNC machine tools, including vertical machining centres and CNC lathes, sourced to suit production, tooling, and maintenance shops across the UAE and the wider GCC.",
      "Every machine is specified against your application — material, batch size, tolerance, and floor space — so you receive equipment that is right-sized for the job rather than over- or under-specified.",
    ],
    icon: "Cog",
  },
  {
    slug: "automation",
    name: "Automation",
    shortDescription:
      "Robotic cells, automated lines, and control upgrades that reduce manual handling and improve throughput.",
    description: [
      "From single robotic arms to full automated lines for welding, loading and unloading, and pack stacking, Neo Synergy designs automation cells around your existing production flow.",
      "Our automation packages combine GSK control systems, drives, and motors with application-specific tooling, giving you a single point of responsibility for the entire cell.",
    ],
    icon: "BrainCircuit",
  },
  {
    slug: "commissioning-installation",
    name: "Commissioning & Installation",
    shortDescription:
      "On-site rigging, installation, and commissioning so new equipment is production-ready from day one.",
    description: [
      "Our team manages the full installation process — from machine foundation and rigging to electrical connection, geometric alignment, and commissioning trials.",
      "We work alongside your operators during commissioning to confirm performance against spec before final handover, minimizing downtime during the transition to new equipment.",
    ],
    icon: "Settings2",
  },
  {
    slug: "special-purpose-machines",
    name: "Special Purpose Machines",
    shortDescription:
      "Custom-engineered machinery for steel, aluminum, aviation, fiberglass, mining, and industrial applications.",
    description: [
      "Through our design and engineering partner, Synergy International, Neo Synergy designs and builds special-purpose machinery for the steel, aluminum, aviation, fiberglass, mining, and broader industrial sectors.",
      "If a standard machine can't meet your process requirements, our engineering team can develop a purpose-built solution around your part geometry, throughput, and floor layout.",
    ],
    icon: "Wrench",
  },
  {
    slug: "robotics",
    name: "Robotics",
    shortDescription:
      "Industrial robot arms and cells for welding, machine tending, and pack handling.",
    description: [
      "We supply and integrate industrial robot arms — including welding robots and general-purpose models such as the RB50, RJ05, and RB Family — for tasks like arc welding, CNC machine loading and unloading, and food pack stacking.",
      "Each robotic cell is supplied with its control system, drives, and end-of-arm tooling, configured for your part and cycle time.",
    ],
    icon: "Bot",
  },
  {
    slug: "retrofitting",
    name: "Retrofitting",
    shortDescription:
      "Upgrade existing CNC lathes, mills, grinders, and machining centres with modern GSK control systems.",
    description: [
      "We retrofit existing CNC lathes, milling machines, drilling and tapping machines, grinding machines, and machining centres with current-generation GSK control systems, drives, and servo motors.",
      "Retrofitting extends the working life of your existing machine assets, improves accuracy and repeatability, and reduces the operating and maintenance costs associated with obsolete controls.",
    ],
    icon: "RefreshCw",
  },
];
