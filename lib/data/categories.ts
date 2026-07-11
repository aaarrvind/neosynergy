import { Category } from "../types";

export const categories: Category[] = [
  {
    slug: "vertical-milling-centers",
    name: "Vertical Milling Center Machines",
    shortName: "Milling Centers",
    intro: "BT40 vertical machining centres for general production milling",
    description: [
      "Our VMC range covers compact-footprint to large-table vertical machining centres built around BT40 GSK servo spindle units, suited to mould, die, and general production milling in steel, aluminum, and other metals.",
      "Both models come with an automatic arm-type tool changer, fully enclosed guarding, and a GSK CNC control as standard. Configurations and tooling packages can be adjusted to match your part envelope and batch sizes.",
    ],
    heroImage: "/images/vmc-850.jpg",
    metaDescription:
      "VMC 650 and VMC 850 vertical machining centres from Neo Synergy, Dubai — BT40 spindle, GSK CNC control, arm-type tool changer. Request a quote.",
  },
  {
    slug: "cnc-lathes",
    name: "CNC Lathes",
    shortName: "CNC Lathes",
    intro: "Heavy-duty horizontal CNC lathes with GSK 988T control",
    description: [
      "Our CNC lathe range is built for heavy turning work, with an 8-inch hollow chuck, 8-station horizontal turret, and a 1000mm turning length as standard.",
      "Each lathe is supplied fully enclosed with telescopic guards, automatic lubrication, coolant system, and an air-conditioned electrical cabinet — ready to commission on arrival.",
    ],
    heroImage: "/images/cnc-lathe.jpg",
    metaDescription:
      "Heavy-duty CNC lathes with GSK 988T control, 8-inch hollow chuck, and 1000mm turning length, supplied and commissioned by Neo Synergy in Dubai.",
  },
  {
    slug: "tapping-machines",
    name: "Tapping Machines & Accessories",
    shortName: "Tapping Machines",
    intro: "Pneumatic arm tapping machines for M3–M24 taps",
    description: [
      "The RTM-U-324 series is a flexible-arm pneumatic tapping machine for taps from M3 to M24 (5/32\" to 3/8\"), with a wide working range suited to bench and floor-mounted tapping stations.",
      "Each unit ships with a quick tapper spindle, parallel arm, a set of safety clutch tapper adapters, an air processor, lubricating oil, and a tooling kit.",
    ],
    heroImage: "/images/tapping-machines.jpg",
    metaDescription:
      "RTM-U-324 pneumatic arm tapping machines for M3–M24 taps, with full standard accessory kit, supplied by Neo Synergy Machinery Trading, Dubai.",
  },
  {
    slug: "machine-accessories",
    name: "Machine Accessories",
    shortName: "Accessories",
    intro: "Spares and accessories for CNC and conventional machines",
    description: [
      "Neo Synergy stocks and sources the everyday accessories that keep machine tools running — from motion components like ball screws, linear guides, and bearings, to workholding, coolant, and lubrication equipment.",
      "Add any item below to your quote request and our team will confirm specification, lead time, and pricing for your machine model.",
    ],
    heroImage: "/images/coolant-pumps.jpg",
    metaDescription:
      "Machine tool accessories and spares — ball screws, linear guides, chucks, coolant pumps, rotary tables, vices, and more — from Neo Synergy, Dubai.",
    catalogItems: [
      { name: "Ball screws", description: "Precision ground ball screw assemblies for X/Y/Z axis motion.", image: "/images/ball-screw.jpg" },
      { name: "Linear guides & bearings", description: "Linear guideways, blocks, and bearing units for machine axes." },
      { name: "Bellows & telescopic covers", description: "Way covers and telescopic covers to protect slides from chips and coolant." },
      { name: "Chucks & cylinders", description: "Lathe chucks and hydraulic/pneumatic actuating cylinders.", image: "/images/machine-vice.jpg" },
      { name: "Chip conveyors", description: "Chip and swarf removal conveyors for CNC machines." },
      { name: "Oil skimmers", description: "Tramp oil removal skimmers for coolant tanks." },
      { name: "Coolant pumps", description: "Coolant delivery pumps for machining centres and lathes.", image: "/images/coolant-pumps.jpg" },
      { name: "Lubrication pumps", description: "Automatic lubrication units for way and ball-screw lubrication." },
      { name: "Machine vices", description: "Precision milling vices for workholding.", image: "/images/machine-vice.jpg" },
      { name: "ER collets & sleeves", description: "Collet sets and reduction sleeves for tool holding.", image: "/images/collets.jpg" },
      { name: "CNC rotary tables", description: "4th-axis rotary tables for indexing and contouring work.", image: "/images/cnc-rotary-table.jpg" },
      { name: "Cable chains", description: "Cable and hose carrier chains for moving axes." },
      { name: "Machine lamps", description: "LED articulated work lamps for machine enclosures.", image: "/images/machine-lamp.png" },
    ],
  },
  {
    slug: "dro-scales",
    name: "Digital Readouts & Scales",
    shortName: "DRO & Scales",
    intro: "Newall digital readouts and magnetic tape scales, up to 13,000mm",
    description: [
      "Digital readout (DRO) systems and linear glass and magnetic tape scales for retrofitting conventional lathes, mills, and grinders with precise digital positioning.",
      "Scales are supplied up to 13,000mm in length, and DRO units carry a 5-year warranty.",
    ],
    heroImage: "/images/dro-readout.jpg",
    metaDescription:
      "Newall digital readouts (DRO) and magnetic tape scales up to 13,000mm with 5-year warranty, supplied by Neo Synergy Machinery Trading, Dubai.",
    catalogItems: [
      { name: "2 & 3-axis digital readouts", description: "Multi-axis DRO consoles for mills, lathes, and grinders.", image: "/images/dro-readout.jpg" },
      { name: "Linear glass scales", description: "High-accuracy linear encoders for axis positioning.", image: "/images/dro-display-blue.jpg" },
      { name: "Magnetic tape scales", description: "Magnetic tape and reader head scales, supplied up to 13,000mm.", image: "/images/magnetic-tape-scale.jpg" },
      { name: "DRO retrofit kits", description: "Complete kits with display, scales, brackets, and mounting hardware.", image: "/images/dro-kit.jpg" },
    ],
  },
  {
    slug: "cnc-retrofit-controllers",
    name: "CNC Control & Retrofit Systems",
    shortName: "CNC Retrofit",
    intro: "GSK CNC controllers and retrofit packages",
    description: [
      "Neo Synergy supplies the full range of GSK CNC controllers and offers complete retrofit packages for CNC lathes, CNC milling machines, drilling and tapping machines, CNC grinding machines, and CNC machining centres.",
      "A retrofit replaces the control system, drives, and servo motors on an existing machine — restoring accuracy and adding modern features without the cost of a new machine.",
    ],
    heroImage: "/images/gsk988t.jpg",
    metaDescription:
      "GSK CNC controllers (GSK25i, GSK980TDc, GSK988T, GSK218MC-V, and more) and full retrofit packages for lathes, mills, and machining centres — Neo Synergy, Dubai.",
    catalogItems: [
      { name: "GSK25i", description: "Compact CNC controller for lathe and milling retrofits.", image: "/images/gsk25i.jpg" },
      { name: "GSK980TDc", description: "CNC lathe controller with integrated operation panel.", image: "/images/gsk980tdc.jpg" },
      { name: "GSK980TDc-V", description: "Vertical-panel CNC lathe controller.", image: "/images/gsk980tdc-v.jpg" },
      { name: "GSK980TDc-H", description: "Horizontal-panel CNC lathe controller.", image: "/images/gsk980tdc-h.jpg" },
      { name: "GSK218MC-V", description: "CNC milling controller for 3–4 axis machining centres.", image: "/images/gsk218mc-v.jpg" },
      { name: "GSK988T", description: "Advanced CNC turning controller with touchscreen interface.", image: "/images/gsk988t.jpg" },
      { name: "GSK980MD", description: "CNC controller for drilling and milling machines.", image: "/images/gsk980md.jpg" },
      { name: "Retrofit package — CNC lathe", description: "Full control, drive, and motor retrofit for CNC lathes." },
      { name: "Retrofit package — CNC milling machine", description: "Full control, drive, and motor retrofit for milling machines." },
      { name: "Retrofit package — drilling & tapping", description: "Control retrofit for drilling and tapping machines." },
      { name: "Retrofit package — CNC grinding machine", description: "Control retrofit for CNC grinding machines." },
      { name: "Retrofit package — machining centre", description: "Full control, drive, and motor retrofit for machining centres." },
    ],
  },
  {
    slug: "robotics-automation",
    name: "Robotics & Automation",
    shortName: "Robotics",
    intro: "Industrial robot arms, control systems, and automated lines",
    description: [
      "Industrial robot arms and complete automation cells for arc welding, machine tending, punching lines, and pack handling, built around GSK robot platforms and control systems.",
      "Each cell is supplied with the robot, controller, drives and motors, and application-specific tooling — configured for your part and cycle time.",
    ],
    heroImage: "/images/robot-welding.jpg",
    metaDescription:
      "Industrial robot arms (RB50, RJ05, RB Family) and automated cells for welding, machine tending, and pack handling from Neo Synergy, Dubai.",
    catalogItems: [
      { name: "Welding robot", description: "6-axis arc welding robot with integrated wire feeder.", image: "/images/robot-welding.jpg" },
      { name: "Robot RB50", description: "General-purpose 6-axis industrial robot arm.", image: "/images/robot-rb50.jpg" },
      { name: "Robot RJ05", description: "Compact 6-axis robot for machine tending and handling.", image: "/images/robot-rj05.jpg" },
      { name: "RB Family robots", description: "Range of payload-class robot arms for varied applications.", image: "/images/robot-rb-family.jpg" },
      { name: "GSK VMC 850L", description: "Horizontal-bed machining centre for automated cells.", image: "/images/gsk-vmc-850l.jpg" },
      { name: "Punching automatic line", description: "Robot-fed automatic punching line for sheet components.", image: "/images/punching-line.jpg" },
      { name: "Safety enclosure for robotic welding", description: "Fenced safety cell for robotic arc welding stations.", image: "/images/safety-box-welding.jpg" },
      { name: "Tool machine loading/unloading", description: "Robot cell for loading and unloading CNC machine tools.", image: "/images/tool-loading.jpg" },
      { name: "Food pack stacking", description: "Robot palletizing cell for packaged goods.", image: "/images/food-pack-stacking.jpg" },
      { name: "Control system, drives & motors", description: "Teach pendants, servo drives, and servo motors for robot cells.", image: "/images/drive-motors.jpg" },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
