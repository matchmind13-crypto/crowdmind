import {
  Trophy, Circle, Cpu, Car, Wallet, HeartPulse, Plane, Clapperboard,
  Dumbbell, Footprints, Flower2, ChefHat, Coffee, Mountain, PawPrint,
  Music, Gamepad2, Dices, PartyPopper, Palette, Camera, BookOpen, Shirt,
  BrainCircuit, FlaskConical, Bitcoin, Landmark, Leaf, HeartHandshake, GraduationCap,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
}

/**
 * A választható témakörök kanonikus listája — a regisztráció utáni érdeklődés-választóhoz,
 * az "Egyéni hírfolyam" szűrőhöz és az új téma kategóriájához.
 * FIGYELEM: az eredeti 8 név (Sport, Futball, Technológia, Autók, Pénzügy, Egészség,
 * Utazás, Film & Sorozat) nem módosítható — meglévő posztok hivatkoznak rájuk.
 */
export const CATEGORIES: Category[] = [
  { name: 'Sport', icon: Trophy },
  { name: 'Futball', icon: Circle },
  { name: 'Fitnesz & edzés', icon: Dumbbell },
  { name: 'Futás', icon: Footprints },
  { name: 'Jóga & mindfulness', icon: Flower2 },
  { name: 'Egészség', icon: HeartPulse },
  { name: 'Gasztró & főzés', icon: ChefHat },
  { name: 'Kávé', icon: Coffee },
  { name: 'Utazás', icon: Plane },
  { name: 'Természet & túrázás', icon: Mountain },
  { name: 'Állatok', icon: PawPrint },
  { name: 'Zene', icon: Music },
  { name: 'Film & Sorozat', icon: Clapperboard },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Társasjátékok', icon: Dices },
  { name: 'Buli & fesztivál', icon: PartyPopper },
  { name: 'Művészet', icon: Palette },
  { name: 'Fotózás', icon: Camera },
  { name: 'Olvasás & könyvek', icon: BookOpen },
  { name: 'Divat & stílus', icon: Shirt },
  { name: 'Technológia', icon: Cpu },
  { name: 'AI & jövő', icon: BrainCircuit },
  { name: 'Tudomány', icon: FlaskConical },
  { name: 'Autók', icon: Car },
  { name: 'Pénzügy', icon: Wallet },
  { name: 'Kripto', icon: Bitcoin },
  { name: 'Politika & közélet', icon: Landmark },
  { name: 'Környezet & klíma', icon: Leaf },
  { name: 'Család & kapcsolatok', icon: HeartHandshake },
  { name: 'Oktatás & karrier', icon: GraduationCap },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/** Ennyi témakört kell legalább kiválasztani az egyéni hírfolyamhoz. */
export const MIN_INTERESTS = 5;
