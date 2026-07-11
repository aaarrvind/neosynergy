-- ============================================================
-- Neo Synergy — Seed v2
-- Tree-structured categories + unified products
-- Run AFTER schema.sql
-- ============================================================

-- ---------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------
insert into services (slug, name, short_description, description, icon, sort_order) values
('machine-tools','Machine Tools','Supply of CNC machining centres, lathes, and conventional machine tools for production and tooling shops.','["Neo Synergy supplies a wide range of CNC machine tools, including vertical machining centres and CNC lathes, sourced to suit production, tooling, and maintenance shops across the UAE and the wider GCC.","Every machine is specified against your application — material, batch size, tolerance, and floor space — so you receive equipment that is right-sized for the job."]','Cog',1),
('automation','Automation','Robotic cells, automated lines, and control upgrades that reduce manual handling and improve throughput.','["From single robotic arms to full automated lines for welding, loading and unloading, and pack stacking, Neo Synergy designs automation cells around your existing production flow.","Our automation packages combine GSK control systems, drives, and motors with application-specific tooling."]','BrainCircuit',2),
('commissioning-installation','Commissioning & Installation','On-site rigging, installation, and commissioning so new equipment is production-ready from day one.','["Our team manages the full installation process — from machine foundation and rigging to electrical connection, geometric alignment, and commissioning trials.","We work alongside your operators during commissioning to confirm performance against spec before final handover."]','Settings2',3),
('special-purpose-machines','Special Purpose Machines','Custom-engineered machinery for steel, aluminum, aviation, fiberglass, mining, and industrial applications.','["Through our design and engineering partner, Synergy International, Neo Synergy designs and builds special-purpose machinery for the steel, aluminum, aviation, fiberglass, mining, and broader industrial sectors.","If a standard machine cannot meet your process requirements, our engineering team can develop a purpose-built solution."]','Wrench',4),
('robotics','Robotics','Industrial robot arms and cells for welding, machine tending, and pack handling.','["We supply and integrate industrial robot arms for tasks like arc welding, CNC machine loading and unloading, and food pack stacking.","Each robotic cell is supplied with its control system, drives, and end-of-arm tooling, configured for your part and cycle time."]','Bot',5),
('retrofitting','Retrofitting','Upgrade existing CNC lathes, mills, grinders, and machining centres with modern GSK control systems.','["We retrofit existing CNC lathes, milling machines, drilling and tapping machines, grinding machines, and machining centres with current-generation GSK control systems, drives, and servo motors.","Retrofitting extends the working life of your existing machine assets and improves accuracy and repeatability."]','RefreshCw',6);

-- ---------------------------------------------------------------
-- CATEGORY TREE
-- Level 1: Machine Tools | Automation & Robotics | Accessories & Tooling
-- ---------------------------------------------------------------

-- ===== LEVEL 1 =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0000-000000000001', null,
   'machine-tools', 'Machine Tools', 'Machine Tools',
   'CNC and conventional machine tools for production, tooling, and maintenance shops',
   '["Neo Synergy supplies a comprehensive range of CNC and conventional machine tools, sourced to meet the requirements of production shops, toolrooms, and maintenance workshops across the UAE and GCC.","Every machine is specified against your application — material, batch size, tolerance, and available floor space."]',
   '/images/vmc-850.jpg',
   'Machine tools supplier Dubai UAE — CNC machining centres, lathes, tapping machines and more from Neo Synergy.',
   1),

  ('00000000-0000-0000-0000-000000000002', null,
   'automation-robotics', 'Automation & Robotics', 'Automation',
   'Industrial automation, robot arms, and control systems for UAE production facilities',
   '["From single robotic arms to complete automated production lines, Neo Synergy designs, supplies, and commissions automation cells built around GSK robot platforms and control systems.","We handle the full scope — robot, controller, drives, motors, tooling, and safety enclosures — configured for your cycle time and part."]',
   '/images/robot-welding.jpg',
   'Industrial automation and robotics supplier Dubai UAE — welding robots, machine tending cells, GSK automation from Neo Synergy.',
   2),

  ('00000000-0000-0000-0000-000000000003', null,
   'accessories-tooling', 'Accessories & Tooling', 'Accessories',
   'Machine accessories, cutting tools, DRO systems, and CNC retrofit controllers',
   '["Neo Synergy stocks and sources the everyday accessories, measurement systems, and retrofit controllers that keep machine tools running and improving.","Add any item to your quote request and our team will confirm specification, availability, and pricing for your machine."]',
   '/images/coolant-pumps.jpg',
   'Machine tool accessories, DRO systems, CNC retrofit controllers and cutting tools from Neo Synergy, Dubai UAE.',
   3);

-- ===== LEVEL 2 under Machine Tools =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'machining-centers', 'Machining Centers', 'Machining Centers',
   'CNC vertical and horizontal machining centres with BT40 spindle and arm-type ATC',
   '["Our CNC machining centre range covers compact-footprint to large-table vertical machining centres built around BT40 GSK servo spindle units, suited to mould, die, and general production milling in steel, aluminum, and other metals.","Both models come with an automatic arm-type tool changer, fully enclosed guarding, and a GSK CNC control as standard."]',
   '/images/vmc-850.jpg',
   'CNC machining centres supplier Dubai — VMC 650 and VMC 850 vertical machining centres with BT40 spindle and GSK control from Neo Synergy.',
   1),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'cnc-lathes', 'CNC Lathes', 'CNC Lathes',
   'Heavy-duty horizontal CNC lathes with GSK 988T control and 8-inch hollow chuck',
   '["Our CNC lathe range is built for heavy turning work, with an 8-inch hollow chuck, 8-station horizontal turret, and 1000mm turning length as standard.","Each lathe is supplied fully enclosed with telescopic guards, automatic lubrication, coolant system, and an air-conditioned electrical cabinet."]',
   '/images/cnc-lathe.jpg',
   'CNC lathes supplier Dubai UAE — heavy-duty GSK 988T lathes with 8-inch chuck and 1000mm turning length from Neo Synergy.',
   2),

  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'tapping-machines', 'Tapping Machines', 'Tapping Machines',
   'Pneumatic arm tapping machines for M3–M24 taps',
   '["The RTM-U-324 series is a flexible-arm pneumatic tapping machine for taps from M3 to M24 (5/32\" to 3/8\"), suited to bench and floor-mounted tapping stations.","Each unit ships with a quick tapper spindle, parallel arm, safety clutch tapper adapters, air processor, lubricating oil, and a tooling kit."]',
   '/images/tapping-machines.jpg',
   'Pneumatic arm tapping machines Dubai UAE — RTM-U-324 series for M3 to M24 taps from Neo Synergy.',
   3);

-- ===== LEVEL 3 under Machining Centers =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'vertical-machining-centers', 'Vertical Machining Centers', 'VMC',
   'BT40 vertical machining centres for general production milling',
   '["Our VMC range covers compact-footprint to large-table vertical machining centres built around BT40 GSK servo spindle units, suited to mould, die, and general production milling.","Available in two table sizes — the VMC 650 for space-constrained workshops and the VMC 850 for larger fixtures and heavier stock removal."]',
   '/images/vmc-850.jpg',
   'Vertical machining centres Dubai UAE — VMC 650 and VMC 850 with BT40 spindle, arm-type ATC and GSK CNC control.',
   1);

-- ===== LEVEL 2 under Automation & Robotics =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0001-000000000004',
   '00000000-0000-0000-0000-000000000002',
   'industrial-robots', 'Industrial Robots', 'Robots',
   'GSK industrial robot arms for welding, machine tending, and material handling',
   '["We supply and integrate the full GSK robot range — from compact 6-axis arms for machine tending to heavy-payload welding robots — configured for your production application.","Each robot cell is supplied with the controller, drives, servo motors, teach pendant, and application-specific end-of-arm tooling."]',
   '/images/robot-rb50.jpg',
   'Industrial robots Dubai UAE — GSK welding robots, machine-tending robots and robot cells from Neo Synergy.',
   1),

  ('00000000-0000-0000-0001-000000000005',
   '00000000-0000-0000-0000-000000000002',
   'automated-lines', 'Automated Lines & Cells', 'Automated Lines',
   'Complete automated production cells and lines for punching, welding, and palletising',
   '["From punching automatic lines to food pack stacking cells, Neo Synergy designs complete turnkey automation cells around your existing production flow.","We handle mechanical integration, control wiring, safety fencing, programming, and commissioning."]',
   '/images/punching-line.jpg',
   'Automated production cells and lines Dubai UAE — turnkey automation from Neo Synergy.',
   2),

  ('00000000-0000-0000-0001-000000000006',
   '00000000-0000-0000-0000-000000000002',
   'cnc-control-systems', 'CNC Control & Drive Systems', 'CNC Controls',
   'GSK CNC controllers, servo drives, and motors for new builds and retrofits',
   '["Neo Synergy supplies the complete range of GSK CNC controllers, servo drives, and servo motors — for both new machine builds and retrofit upgrades of existing equipment.","Retrofit packages are available for CNC lathes, milling machines, drilling and tapping machines, grinding machines, and machining centres."]',
   '/images/gsk988t.jpg',
   'GSK CNC controllers, servo drives and retrofit packages Dubai UAE — from Neo Synergy.',
   3);

-- ===== LEVEL 3 under Industrial Robots =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000004',
   'welding-robots', 'Welding Robots', 'Welding',
   '6-axis arc welding robots with integrated wire feeder and safety cell',
   '["Our welding robot offering covers 6-axis arc welding robots supplied with integrated wire feeder, welding power source, and safety enclosure — ready to commission on your production floor.","Standard applications include MIG/MAG welding of structural steel, brackets, and fabricated components."]',
   '/images/robot-welding.jpg',
   'Welding robots Dubai UAE — 6-axis arc welding robot cells with safety enclosure from Neo Synergy.',
   1),

  ('00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0001-000000000004',
   'handling-robots', 'Handling & Tending Robots', 'Handling',
   'Robot arms for CNC machine loading/unloading, palletising, and material handling',
   '["Compact and mid-payload 6-axis robot arms configured for CNC machine loading and unloading, component transfer, and palletising applications.","Models include the RB50, RJ05, and RB Family — all available with the GSK robot control system and teach pendant."]',
   '/images/robot-rb50.jpg',
   'Handling and tending robots Dubai UAE — CNC machine loading, palletising and material handling robots from Neo Synergy.',
   2);

-- ===== LEVEL 2 under Accessories & Tooling =====
insert into categories (id, parent_id, slug, name, short_name, intro, description, hero_image, meta_description, sort_order)
values
  ('00000000-0000-0000-0001-000000000007',
   '00000000-0000-0000-0000-000000000003',
   'machine-accessories', 'Machine Accessories', 'Accessories',
   'Spares and accessories for CNC and conventional machine tools',
   '["Neo Synergy stocks and sources the everyday accessories that keep machine tools running — from motion components like ball screws, linear guides, and bearings, to workholding, coolant, and lubrication equipment.","Add any item to your quote request and our team will confirm specification, lead time, and pricing for your machine model."]',
   '/images/coolant-pumps.jpg',
   'Machine tool accessories and spares Dubai UAE — ball screws, coolant pumps, chucks, rotary tables and more from Neo Synergy.',
   1),

  ('00000000-0000-0000-0001-000000000008',
   '00000000-0000-0000-0000-000000000003',
   'dro-scales', 'Digital Readouts & Scales', 'DRO & Scales',
   'Newall digital readout systems and linear scales up to 13,000mm with 5-year warranty',
   '["Digital readout (DRO) systems and linear glass and magnetic tape scales for retrofitting conventional lathes, mills, and grinders with precise digital positioning.","Scales are supplied up to 13,000mm in length, and DRO units carry a 5-year warranty."]',
   '/images/dro-readout.jpg',
   'Digital readouts and scales Dubai UAE — Newall DRO systems and magnetic tape scales up to 13,000mm from Neo Synergy.',
   2),

  ('00000000-0000-0000-0001-000000000009',
   '00000000-0000-0000-0000-000000000003',
   'retrofit-controllers', 'CNC Retrofit Controllers', 'Retrofit',
   'GSK CNC retrofit packages for lathes, mills, grinders, and machining centres',
   '["Complete GSK CNC controller retrofit packages for existing machines — replacing obsolete controls with current-generation CNC systems, drives, and servo motors.","Retrofit packages available for CNC lathes, milling machines, drilling and tapping machines, grinding machines, and machining centres."]',
   '/images/gsk988t.jpg',
   'CNC retrofit controllers Dubai UAE — GSK retrofit packages for lathes, mills and machining centres from Neo Synergy.',
   3);

-- ---------------------------------------------------------------
-- PRODUCTS (unified — all former products + catalog items)
-- ---------------------------------------------------------------

-- VMC 650
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order)
values ('vmc-650', '00000000-0000-0000-0002-000000000001',
  'VMC 650 Vertical Machining Centre',
  'Compact-footprint BT40 machining centre with 20-tool ATC',
  '["The VMC 650 is a BT40 vertical machining centre suited to general production and tooling work where floor space is at a premium. A GSK servo spindle unit and 600/320/450mm X/Y/Z travel cover most mould, fixture, and small-batch part work.","A 20-tool arm-type tool changer with a 3-second change time keeps cycle times tight, while a 1000 x 320mm table and 300kg maximum load suit fixtures and vices for steel and aluminum components."]',
  '/images/vmc-650.jpg',
  '["VMC 650","vertical machining centre Dubai","BT40 CNC mill UAE","GSK servo spindle"]', 1);

-- VMC 850
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order)
values ('vmc-850', '00000000-0000-0000-0002-000000000001',
  'VMC 850 Vertical Machining Centre',
  'Large-table BT40 machining centre with 24-tool ATC',
  '["The VMC 850 steps up to a 1000 x 500mm table and 800/500/500mm X/Y/Z travel, with a 500kg maximum load — suited to larger fixtures, multi-part setups, and heavier stock removal.","A 24-tool arm-type tool changer with a 2.5-second change time, 24 m/min rapids, and 0.001mm positioning accuracy make it ideal for production work that needs both capacity and precision."]',
  '/images/vmc-850.jpg',
  '["VMC 850","vertical machining centre Dubai","BT40 CNC mill UAE","large table CNC mill"]', 2);

-- CNC Lathe
insert into products (slug, category_id, name, tagline, description, image, standard_equipment, keywords, sort_order)
values ('cnc-lathe-1020', '00000000-0000-0000-0001-000000000002',
  'CNC Lathe — 1020mm Centre Height',
  'Heavy-duty horizontal CNC lathe with GSK 988T control',
  '["A heavy-duty horizontal CNC lathe with a 1020mm centre height, D550mm maximum swing, and 1000mm turning length — built for shafts, flanges, and general turning work in steel and other metals.","Standard equipment includes an 8-inch hollow chuck, 8-station horizontal turret, fully enclosed guarding, automatic lubrication, and a GSK 988T CNC controller with electronic handwheel."]',
  '/images/cnc-lathe.jpg',
  '["GSK 988T CNC controller","X-axis servo motor with brake","Fully enclosed with telescopic guards","Automatic lubrication system","Coolant system","Air-conditioned electrical cabinet","LED working lamp","Electronic handwheel (MPG)","Operation manual and tool box","Levelling bolts and blocks","Power supply: 380V / 3PH, 50Hz","Face mount (1 pc) and boring mount (3 pcs)"]',
  '["CNC lathe Dubai","GSK 988T lathe","8 inch chuck CNC lathe","heavy duty CNC lathe UAE"]', 1);

-- Tapping machine
insert into products (slug, category_id, name, tagline, description, image, variants, standard_equipment, keywords, sort_order)
values ('rtm-u324', '00000000-0000-0000-0001-000000000003',
  'RTM-U-324 Pneumatic Arm Tapping Machine',
  'Flexible-arm pneumatic tapper for M3–M24 taps',
  '["The RTM-U-324 is a flexible-arm pneumatic tapping machine for taps from M3 to M24, suited to bench or floor-mounted tapping stations on brackets, flanges, and fabricated parts.","Available in two work-range variants — 1500 mm and 1900 mm — both running on 220V single-phase power and 0–300 RPM tapping speed."]',
  '/images/tapping-machines.jpg',
  '["RTM-U-324-1500 RPM","RTM-U-324-1900 RPM"]',
  '["Quick tapper spindle","Parallel arm","Any six safety clutch tapper adapters","Air processor","Tooling kit","Lubricating oil"]',
  '["pneumatic tapping machine","RTM-U-324","arm tapping machine UAE","M3 to M24 tapper Dubai"]', 1);

-- Welding Robot
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order)
values ('welding-robot', '00000000-0000-0000-0002-000000000002',
  'GSK Welding Robot', '6-axis arc welding robot with integrated wire feeder',
  '["6-axis arc welding robot supplied with integrated wire feeder, welding power source, and safety enclosure — ready to commission.","Standard applications include MIG/MAG welding of structural steel, brackets, and fabricated components."]',
  '/images/robot-welding.jpg',
  '["welding robot Dubai","arc welding robot UAE","GSK welding robot","robotic welding cell"]', 1);

-- Robot RB50
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order)
values ('robot-rb50', '00000000-0000-0000-0002-000000000003',
  'GSK Robot RB50', 'General-purpose 6-axis industrial robot arm — 50kg payload',
  '["The RB50 is a general-purpose 6-axis industrial robot arm with 50kg payload capacity, suited to machine tending, component transfer, and palletising applications.","Supplied with the GSK robot control system, teach pendant, and servo drives."]',
  '/images/robot-rb50.jpg',
  '["robot RB50","industrial robot Dubai","CNC machine tending robot UAE","GSK robot"]', 1);

-- Robot RJ05
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order)
values ('robot-rj05', '00000000-0000-0000-0002-000000000003',
  'GSK Robot RJ05', 'Compact 6-axis robot for machine tending — 5kg payload',
  '["The RJ05 is a compact 6-axis robot designed for CNC machine loading and unloading, small-part handling, and assembly tasks where workspace is limited.","Supplied with GSK controller, teach pendant, and mounting hardware."]',
  '/images/robot-rj05.jpg',
  '["robot RJ05","compact robot Dubai","machine loading robot UAE","GSK RJ05"]', 2);

-- Machine accessories (former catalog items — now unified products)
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order) values
('ball-screws', '00000000-0000-0000-0001-000000000007', 'Ball Screws', 'Precision ground ball screw assemblies for X/Y/Z axis motion', '["Precision ground ball screw assemblies including screw shaft, nut, and end supports for CNC machine axis drives.","Available in a range of diameters and leads to suit most common machine tool configurations."]', '/images/ball-screw.jpg', '["ball screws Dubai","CNC ball screw UAE","precision ball screw"]', 1),
('coolant-pumps', '00000000-0000-0000-0001-000000000007', 'Coolant Pumps', 'Coolant delivery pumps for machining centres and lathes', '["Coolant delivery pumps in a range of flow rates and head pressures to suit machining centres, CNC lathes, and conventional machine tools.","Supplied as direct replacement units or as new fitments."]', '/images/coolant-pumps.jpg', '["coolant pump Dubai","machine tool coolant pump UAE"]', 2),
('cnc-rotary-tables', '00000000-0000-0000-0001-000000000007', 'CNC Rotary Tables', '4th-axis rotary tables for indexing and contouring work', '["4th-axis CNC rotary tables for use with machining centres — enabling indexed positioning and full contouring in the rotary axis.","Compatible with BT40 machining centres and most CNC control systems."]', '/images/cnc-rotary-table.jpg', '["CNC rotary table Dubai","4th axis table UAE"]', 3),
('collets-toolholding', '00000000-0000-0000-0001-000000000007', 'ER Collets & Tool Holders', 'Collet sets and tool holders for CNC and conventional machines', '["ER collet sets and reduction sleeves for tool holding on machining centres, milling machines, and drilling machines.","Available in ER16, ER20, ER32, and ER40 sizes."]', '/images/collets.jpg', '["ER collets Dubai","tool holders UAE","CNC tool holding"]', 4);

-- DRO items
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order) values
('newall-dro', '00000000-0000-0000-0001-000000000008', 'Newall Digital Readout System', '2 & 3-axis DRO consoles with 5-year warranty', '["Newall digital readout systems for 2 and 3-axis position display on lathes, mills, and grinders.","Supplied with glass scale encoders and mounting hardware. 5-year warranty on all DRO units."]', '/images/dro-readout.jpg', '["DRO Dubai","digital readout UAE","Newall DRO"]', 1),
('magnetic-tape-scale', '00000000-0000-0000-0001-000000000008', 'Magnetic Tape Scales', 'Magnetic tape and reader head scales supplied up to 13,000mm', '["Magnetic tape and reader head linear scales for DRO and CNC position feedback applications.","Supplied in lengths up to 13,000mm with stainless steel tape and aluminium housing."]', '/images/magnetic-tape-scale.jpg', '["magnetic scale Dubai","linear scale UAE","DRO scale"]', 2);

-- CNC retrofit controllers
insert into products (slug, category_id, name, tagline, description, image, keywords, sort_order) values
('gsk-988t', '00000000-0000-0000-0001-000000000009', 'GSK 988T CNC Controller', 'Advanced CNC turning controller for lathes', '["The GSK 988T is an advanced CNC turning controller with integrated operation panel, suited to high-performance CNC lathe applications.","Features include full servo spindle control, 8-station turret support, and Ethernet connectivity."]', '/images/gsk988t.jpg', '["GSK 988T","CNC controller Dubai","lathe controller UAE"]', 1),
('gsk-218mc', '00000000-0000-0000-0001-000000000009', 'GSK 218MC-V CNC Controller', 'CNC milling controller for 3–4 axis machining centres', '["The GSK 218MC-V is a CNC milling controller for 3 to 4-axis machining centre applications, with a vertical-format operation panel.","Compatible with most BT40 and BT50 machining centres for new builds and retrofits."]', '/images/gsk218mc-v.jpg', '["GSK 218MC","CNC mill controller Dubai","machining centre controller UAE"]', 2),
('gsk-980tdc', '00000000-0000-0000-0001-000000000009', 'GSK 980TDc CNC Controller', 'Economy CNC lathe controller with integrated panel', '["The GSK 980TDc is an economy CNC lathe controller with integrated operation panel, suited to standard 2-axis turning applications.","Available in horizontal (TDc-H) and vertical (TDc-V) panel configurations."]', '/images/gsk980tdc.jpg', '["GSK 980TDc","economy CNC controller Dubai","retrofit lathe controller UAE"]', 3);

-- ---------------------------------------------------------------
-- SPEC GROUPS + ROWS for VMC 650
-- ---------------------------------------------------------------
with p as (select id from products where slug='vmc-650')
insert into spec_groups (product_id, title, sort_order)
select p.id, t.title, t.ord from p,
(values ('Table',1),('Travel',2),('Spindle',3),('Feed',4),('Accuracy',5),('Arm tool changer',6),('General',7)) t(title,ord);

with g as (select sg.id, sg.title from spec_groups sg join products p on p.id=sg.product_id where p.slug='vmc-650')
insert into spec_rows (spec_group_id, label, value, sort_order)
select g.id, s.label, s.value, s.ord from g join lateral (select * from (values
  ('Table','Table size','1000 x 320 mm',1),
  ('Table','T-slot','18 x 3 x 100 mm',2),
  ('Table','Maximum load','300 kg',3),
  ('Travel','X / Y / Z travel','600 / 320 / 450 mm',1),
  ('Travel','Spindle nose to table','70 - 520 mm',2),
  ('Spindle','Spindle taper','BT40',1),
  ('Spindle','Spindle speed','80 - 8000 rpm',2),
  ('Spindle','Spindle motor power','7.5 / 11 kW GSK servo spindle unit',3),
  ('Feed','Rapid feed X / Y / Z','15 / 15 / 12 m/min',1),
  ('Feed','X / Y / Z motor torque','15 / 15 / 15 Nm',2),
  ('Accuracy','Positioning accuracy','0.008 mm',1),
  ('Accuracy','Positioning repeatability','0.003 mm',2),
  ('Arm tool changer','Number of tools','20 tools',1),
  ('Arm tool changer','Maximum tool length','300 mm',2),
  ('Arm tool changer','Maximum tool weight','8 kg',3),
  ('Arm tool changer','Tool changing time','3 sec',4),
  ('General','Power','380 V 3PH, 50/60 Hz, 12 kVA',1),
  ('General','Air consumption','6 kg/cm², 0.6 MPa',2),
  ('General','Dimensions (L x W x H)','2100 x 1700 x 2400 mm',3),
  ('General','Weight','3,500 kg',4)
) t(grp,label,value,ord)) s on s.grp=g.title;

-- ---------------------------------------------------------------
-- SPEC GROUPS + ROWS for VMC 850
-- ---------------------------------------------------------------
with p as (select id from products where slug='vmc-850')
insert into spec_groups (product_id, title, sort_order)
select p.id, t.title, t.ord from p,
(values ('Table',1),('Travel',2),('Spindle',3),('Feed',4),('Accuracy',5),('Arm tool changer',6),('General',7)) t(title,ord);

with g as (select sg.id, sg.title from spec_groups sg join products p on p.id=sg.product_id where p.slug='vmc-850')
insert into spec_rows (spec_group_id, label, value, sort_order)
select g.id, s.label, s.value, s.ord from g join lateral (select * from (values
  ('Table','Table size','1000 x 500 mm',1),
  ('Table','T-slot','18 x 5 x 100 mm',2),
  ('Table','Maximum load','500 kg',3),
  ('Travel','X / Y / Z travel','800 / 500 / 500 mm',1),
  ('Travel','Spindle nose to table','150 - 650 mm',2),
  ('Travel','Spindle centre to column','550 mm',3),
  ('Spindle','Spindle taper','BT40',1),
  ('Spindle','Spindle speed','80 - 8000 rpm',2),
  ('Spindle','Spindle motor power','7.5 / 11 kW GSK servo spindle unit',3),
  ('Feed','Rapid feed X / Y / Z','24 / 24 / 20 m/min',1),
  ('Feed','Cutting feed rate','10 m/min',2),
  ('Feed','X / Y / Z motor torque','15 / 15 / 22 Nm',3),
  ('Accuracy','Positioning accuracy','0.001 mm',1),
  ('Accuracy','Positioning repeatability','0.006 mm',2),
  ('Arm tool changer','Number of tools','24 tools',1),
  ('Arm tool changer','Maximum tool length','250 mm',2),
  ('Arm tool changer','Maximum tool weight','7 kg',3),
  ('Arm tool changer','Tool changing time','2.5 sec',4),
  ('General','Power','380 V 3PH, 50/60 Hz, 22 kVA',1),
  ('General','Air consumption','250 L/min, 0.6 MPa',2),
  ('General','Dimensions (L x W x H)','2600 x 2400 x 2700 mm',3),
  ('General','Weight','5,000 kg',4)
) t(grp,label,value,ord)) s on s.grp=g.title;

-- ---------------------------------------------------------------
-- SPEC GROUPS + ROWS for CNC Lathe
-- ---------------------------------------------------------------
with p as (select id from products where slug='cnc-lathe-1020')
insert into spec_groups (product_id, title, sort_order)
select p.id, t.title, t.ord from p,
(values ('Capacity',1),('Spindle',2),('Turret & tooling',3),('Accuracy & control',4),('General',5)) t(title,ord);

with g as (select sg.id, sg.title from spec_groups sg join products p on p.id=sg.product_id where p.slug='cnc-lathe-1020')
insert into spec_rows (spec_group_id, label, value, sort_order)
select g.id, s.label, s.value, s.ord from g join lateral (select * from (values
  ('Capacity','Max swing','D550 mm',1),
  ('Capacity','Swing over slide','D360 mm',2),
  ('Capacity','Recommended standard turning diameter','D250 mm',3),
  ('Capacity','Max turning diameter','D360 mm (flange) / D320 mm (shaft)',4),
  ('Capacity','Loading capacity','200 kg (flange) / 500 kg (shaft)',5),
  ('Capacity','Turning length','1000 mm',6),
  ('Capacity','Max pulling through job','D50 mm',7),
  ('Spindle','Spindle type','A2-6',1),
  ('Spindle','Spindle taper','D70 mm, 1:20',2),
  ('Spindle','Spindle diameter','D66 mm',3),
  ('Spindle','Spindle speed','50 - 400 rpm (servo)',4),
  ('Spindle','Spindle motor power','11 kW',5),
  ('Spindle','Centre height','1020 mm',6),
  ('Turret & tooling','Chuck','8 inch hollow',1),
  ('Turret & tooling','Turret','8 station, horizontal',2),
  ('Turret & tooling','Tool shank','25 x 25 mm (D40 boring bar)',3),
  ('Turret & tooling','Rapid speed X / Z','24 m/min',4),
  ('Accuracy & control','Positioning accuracy','0.022 mm',1),
  ('Accuracy & control','Positioning repeatability','0.006 mm',2),
  ('Accuracy & control','CNC system','GSK 988T / GS',3),
  ('General','Power','380 V +10%, 50 Hz, 35 kVA',1),
  ('General','Dimensions (L x W x H)','4000 x 2000 x 2050 mm',2),
  ('General','Weight','5,200 kg',3)
) t(grp,label,value,ord)) s on s.grp=g.title;

-- SPEC GROUP for Tapping Machine
with p as (select id from products where slug='rtm-u324')
insert into spec_groups (product_id, title, sort_order) select p.id,'Specification',1 from p;

with g as (select sg.id from spec_groups sg join products p on p.id=sg.product_id where p.slug='rtm-u324')
insert into spec_rows (spec_group_id,label,value,values,sort_order) values
  ((select id from g),'For taps','M3 - M24 / 5/32" - 3/8"',null,1),
  ((select id from g),'Speed','0 - 300 rpm',null,2),
  ((select id from g),'Work range',null,'{"RTM-U-324-1500 RPM":"15 - 1500 mm","RTM-U-324-1900 RPM":"15 - 1900 mm"}',3),
  ((select id from g),'Power','220 V, 50 Hz',null,4);

-- Product images (gallery seed — hero image duplicated as first gallery image)
insert into product_images (product_id, url, alt, sort_order)
select id, image, name, 1 from products where image != '';
