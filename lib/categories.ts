import {
  Trophy, Circle, Cpu, Car, Wallet, HeartPulse, Plane, Clapperboard,
  Dumbbell, Footprints, Flower2, ChefHat, Coffee, Mountain, PawPrint,
  Music, Gamepad2, Dices, PartyPopper, Palette, Camera, BookOpen, Shirt,
  BrainCircuit, FlaskConical, Bitcoin, Landmark, Leaf, HeartHandshake, GraduationCap,
  Bike, Waves, Snowflake, Gauge, Fish, Wine, Salad, Sprout, Hammer, Sofa,
  Sparkles, MoonStar, Hourglass, Languages, Podcast, Brain, Rocket, Telescope,
  Megaphone, Scissors,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
}

/**
 * A választható témakörök kanonikus listája — a regisztráció utáni érdeklődés-választóhoz,
 * az "Egyéni hírfolyam" szűrőhöz és az új téma kategóriájához.
 * FIGYELEM: a már kiadott nevek nem módosíthatók — meglévő posztok és mentett
 * preferenciák hivatkoznak rájuk (átnevezés helyett újat adj hozzá).
 */
export const CATEGORIES: Category[] = [
  // Sport & mozgás
  { name: 'Sport', icon: Trophy },
  { name: 'Futball', icon: Circle },
  { name: 'Fitnesz & edzés', icon: Dumbbell },
  { name: 'Futás', icon: Footprints },
  { name: 'Kerékpár', icon: Bike },
  { name: 'Úszás', icon: Waves },
  { name: 'Télisportok', icon: Snowflake },
  { name: 'Motorsport & F1', icon: Gauge },
  { name: 'Jóga & mindfulness', icon: Flower2 },
  // Test & lélek
  { name: 'Egészség', icon: HeartPulse },
  { name: 'Pszichológia & önismeret', icon: Brain },
  // Gasztró
  { name: 'Gasztró & főzés', icon: ChefHat },
  { name: 'Vegán & tudatos étkezés', icon: Salad },
  { name: 'Kávé', icon: Coffee },
  { name: 'Bor & sör', icon: Wine },
  // Kint a világban
  { name: 'Utazás', icon: Plane },
  { name: 'Természet & túrázás', icon: Mountain },
  { name: 'Horgászat', icon: Fish },
  { name: 'Kertészkedés', icon: Sprout },
  { name: 'Állatok', icon: PawPrint },
  // Szórakozás & kultúra
  { name: 'Zene', icon: Music },
  { name: 'Podcastok', icon: Podcast },
  { name: 'Film & Sorozat', icon: Clapperboard },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Társasjátékok', icon: Dices },
  { name: 'Buli & fesztivál', icon: PartyPopper },
  { name: 'Művészet', icon: Palette },
  { name: 'Fotózás', icon: Camera },
  // Hobbi & otthon
  { name: 'Kézművesség', icon: Scissors },
  { name: 'Barkács & DIY', icon: Hammer },
  { name: 'Lakberendezés', icon: Sofa },
  { name: 'Olvasás & könyvek', icon: BookOpen },
  { name: 'Történelem', icon: Hourglass },
  { name: 'Nyelvtanulás', icon: Languages },
  // Stílus
  { name: 'Divat & stílus', icon: Shirt },
  { name: 'Szépségápolás', icon: Sparkles },
  { name: 'Asztrológia & spiritualitás', icon: MoonStar },
  // Tech & tudomány
  { name: 'Technológia', icon: Cpu },
  { name: 'AI & jövő', icon: BrainCircuit },
  { name: 'Tudomány', icon: FlaskConical },
  { name: 'Űr & csillagászat', icon: Telescope },
  { name: 'Autók', icon: Car },
  // Pénz & közélet
  { name: 'Pénzügy', icon: Wallet },
  { name: 'Kripto', icon: Bitcoin },
  { name: 'Vállalkozás & startup', icon: Rocket },
  { name: 'Közösségi média', icon: Megaphone },
  { name: 'Politika & közélet', icon: Landmark },
  { name: 'Környezet & klíma', icon: Leaf },
  // Élet
  { name: 'Család & kapcsolatok', icon: HeartHandshake },
  { name: 'Oktatás & karrier', icon: GraduationCap },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/** Ennyi témakört kell legalább kiválasztani az egyéni hírfolyamhoz. */
export const MIN_INTERESTS = 5;
