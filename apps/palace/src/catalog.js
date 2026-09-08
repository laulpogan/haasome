// Status and gates reflect docs/GALLERY-HANDOFF.md. Only ready entries can load.
export const catalog = [
  {
    id:'capitoline', title:'Fragments of an Emperor', place:'Capitoline courtyard · Rome',
    status:'Ready', origin:'Licensed modern scan', attachment:'Curated regions',
    promise:'Read power, restoration and divinity in three fragments of Constantine’s colossal statue.',
    source:'https://superspl.at/scene/5ab604fa', bundle:'/curated-court',
    credit:'Scan by artfletch · CC BY 4.0',
  },
  {
    id:'computing', title:'A History of Personal Computing', place:'RE-PC Computer Museum',
    status:'Candidate', origin:'Modern museum scan listing · not yet verified', attachment:'Curated regions proposed',
    promise:'Compare three machines and recall what changed between them.',
    source:'https://superspl.at/scene/04ff1ba2',
    gate:'Confirm scanned machine identities, primary-source facts and exact licensed asset bytes. Similar-looking machines need care.',
    context:'Recommended next. The listing was reviewed; no scene has been prepared or tested here.',
  },
  {
    id:'firehouse', title:'Tools of a Firehouse', place:'Museum exhibit',
    status:'Candidate', origin:'Reconstructed exhibit listing · underlying rights unverified', attachment:'Curated regions proposed',
    promise:'Connect three tools to the jobs they served.',
    source:'https://superspl.at/scene/561345ca',
    gate:'Trace original model and collection rights, then verify object identities before downloading or preparing a tour.',
    context:'The listing describes a reconstructed exhibit, not a photographed historic firehouse.',
  },
  {
    id:'apollo', title:'A Mission in Objects', place:'Lunar lander concept',
    status:'Rights unresolved', origin:'Rendered setting listing · permissions unresolved', attachment:'Curated regions proposed',
    promise:'Explore landing, life support and communications through mission objects.',
    source:'https://superspl.at/scene/797f5c99',
    gate:'Find a permitted downloadable asset. The reviewed listing offered no downloadable license; NASA facts do not license another creator’s model.',
    context:'Proposal only. No Apollo mission identity or historical accuracy has been established for this scene.',
  },
  {
    id:'bunker', title:'Inside a Wartime Bunker', place:'Bunker concept',
    status:'Rights unresolved', origin:'Unreal-source setting listing · permissions unresolved', attachment:'Curated regions proposed',
    promise:'Understand equipment, construction and daily use through a small object journey.',
    source:'https://superspl.at/scene/55792704',
    gate:'Verify underlying scene rights and the claimed historical setting. A WWII association has not been established.',
    context:'Proposal only. No battlefield, soldier identities or historical reconstruction are claimed.',
  },
];
export const readyTour = id => catalog.find(entry => entry.id === id && entry.status === 'Ready');
