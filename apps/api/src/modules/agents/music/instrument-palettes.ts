/**
 * Deterministic genre → instrument palette lookup. Returned verbatim from the
 * suggest_instruments tool so the agent never invents a genre's defining sound.
 */

export interface InstrumentPalette {
  genre: string;
  core: string[];
  textural: string[];
  percussion: string[];
  bpmRange: { min: number; max: number };
  keyCharacteristics: string[];
}

export const PALETTES: Record<string, InstrumentPalette> = {
  'lo-fi-hiphop': {
    genre: 'lo-fi hiphop',
    core: ['warm rhodes / vintage EP', 'upright or vinyl-style bass', 'dusty sampled piano'],
    textural: ['vinyl crackle', 'tape hiss', 'rain / cafe ambience', 'filtered jazz pads'],
    percussion: ['swung boom-bap kit', 'side-stick rimshot', 'shaker 16ths', 'hand claps'],
    bpmRange: { min: 70, max: 90 },
    keyCharacteristics: [
      '7th & 9th jazz chords',
      'slight swing',
      'MPC-style humanization',
      'narrow stereo image',
    ],
  },
  house: {
    genre: 'house',
    core: ['analog-style bass synth', 'chord stabs', 'Rhodes-style pads'],
    textural: ['white-noise sweeps', 'vocal chops', 'filter resonance risers'],
    percussion: [
      'four-on-the-floor kick',
      'open hat off-beats',
      'clap/snare on 2&4',
      'shaker 16ths',
    ],
    bpmRange: { min: 118, max: 128 },
    keyCharacteristics: [
      'side-chain pump',
      'long sustained chords',
      'linear groove',
      'filtered intros/outros',
    ],
  },
  afrobeats: {
    genre: 'afrobeats',
    core: ['dembow-adjacent log drum', 'bright plucked lead', 'bass heavy with space'],
    textural: ['bell / agogo loops', 'flute or kalimba', 'vocal chops'],
    percussion: ['syncopated kick', 'rim clave', 'shakers', 'tom fills'],
    bpmRange: { min: 98, max: 112 },
    keyCharacteristics: [
      'polyrhythm',
      'call & response vocals',
      'mid-forward mix',
      'space on downbeats',
    ],
  },
  pop: {
    genre: 'pop',
    core: ['piano or guitar chord bed', 'wide synth pad', 'modern sub + mid bass'],
    textural: ['pitched vocal fx', 'reverse swells', 'bell lead for hook'],
    percussion: ['layered kick', 'programmed 808', 'snare with clap stack', 'trap-style hats'],
    bpmRange: { min: 95, max: 125 },
    keyCharacteristics: [
      'strong hook',
      'clear verse/chorus lift',
      'wide side image in chorus',
      'vocal-centric mix',
    ],
  },
  'drum-and-bass': {
    genre: 'drum & bass',
    core: ['reese bass or neuro bass', 'sub layer', 'filtered synth pads'],
    textural: ['cinematic drones', 'vocal chops', 'reverse swells', 'risers'],
    percussion: [
      'amen break or programmed equivalent',
      'tight snare',
      'rolling hats',
      'percussion loops',
    ],
    bpmRange: { min: 170, max: 180 },
    keyCharacteristics: [
      'half-time feel vs full-time drop',
      'stereo bass design',
      'cinematic intro',
      'long builds',
    ],
  },
  'indie-rock': {
    genre: 'indie rock',
    core: ['clean + driven electric guitar', 'live-feel bass', 'drum kit'],
    textural: ['tambourine', 'organ / synth pad for lift', 'double-tracked vocals'],
    percussion: ['straight 8ths rock kit', 'ride for build sections'],
    bpmRange: { min: 100, max: 140 },
    keyCharacteristics: [
      'dynamic verse→chorus lift',
      'live-sounding mix',
      'parallel guitar compression',
    ],
  },
};

export function paletteFor(genre: string): InstrumentPalette | null {
  const key = genre.trim().toLowerCase().replace(/\s+/g, '-');
  return PALETTES[key] ?? null;
}

export const ARRANGEMENT_TEMPLATES: Array<{
  id: string;
  bestFor: string[];
  sections: Array<{ label: string; bars: number; purpose: string }>;
}> = [
  {
    id: 'pop-32',
    bestFor: ['pop', 'indie-rock', 'afrobeats'],
    sections: [
      { label: 'Intro', bars: 4, purpose: 'Hook teaser or ambient entry' },
      { label: 'Verse 1', bars: 16, purpose: 'Setup / story' },
      { label: 'Pre-chorus', bars: 4, purpose: 'Lift into chorus' },
      { label: 'Chorus', bars: 8, purpose: 'Hook delivery' },
      { label: 'Verse 2', bars: 16, purpose: 'Deepen story' },
      { label: 'Chorus', bars: 8, purpose: 'Hook repeat' },
      { label: 'Bridge', bars: 8, purpose: 'New angle, drop some elements' },
      { label: 'Chorus 2x', bars: 16, purpose: 'Climactic return' },
      { label: 'Outro', bars: 4, purpose: 'Resolve or fade' },
    ],
  },
  {
    id: 'club-dj',
    bestFor: ['house', 'drum-and-bass'],
    sections: [
      { label: 'DJ intro', bars: 16, purpose: 'Mixable beats + percussion' },
      { label: 'Build 1', bars: 8, purpose: 'Layer elements, filter opens' },
      { label: 'Drop', bars: 16, purpose: 'Full energy — anchor element prominent' },
      { label: 'Breakdown', bars: 16, purpose: 'Vocal / melodic focus' },
      { label: 'Build 2', bars: 8, purpose: 'Return of tension' },
      { label: 'Drop 2', bars: 32, purpose: 'Main drop, slight variation' },
      { label: 'DJ outro', bars: 16, purpose: 'Beat-friendly exit' },
    ],
  },
  {
    id: 'lofi-loop',
    bestFor: ['lo-fi-hiphop'],
    sections: [
      { label: 'Intro', bars: 4, purpose: 'Vinyl crackle + piano/rhodes' },
      { label: 'Main loop', bars: 16, purpose: 'Drums in, bass in' },
      { label: 'Variation', bars: 8, purpose: 'Filter / element swap' },
      { label: 'Bridge', bars: 8, purpose: 'Drop drums, melody alone' },
      { label: 'Main loop', bars: 16, purpose: 'Return full' },
      { label: 'Outro', bars: 4, purpose: 'Filter close' },
    ],
  },
];
