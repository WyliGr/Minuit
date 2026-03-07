interface Seance {
  time: string;
  rawTime?: string;
  isVost: boolean;
  isPreview: boolean;
}

interface Film {
  titre: string;
  duree: string | number;
  affiche?: string;
  seances: Record<string, Seance[]>;
}

export interface ApiResponse {
  liste_films?: Film[];
}

export async function fetchMovies(): Promise<Film[]> {
  try {
    const response = await fetch('http://n8n.wyligr.fr/webhook/api/theater');
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
 
    const data = await response.json();
    
    // Handle different API response formats
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].liste_films)) {
      return data[0].liste_films;
    } else if (data && !Array.isArray(data) && Array.isArray(data.liste_films)) {
      return data.liste_films;
    } else if (Array.isArray(data) && data.length > 0 && data[0].titre) {
      return data;
    } else if (Array.isArray(data) && data.length > 0 && data[0].liste_films) {
      return data[0].liste_films;
    } else {
      throw new Error("Le format JSON reçu de n8n n'est pas reconnu.");
    }
  } catch (error) {
    console.error("🚨 ERREUR LORS DU FETCH N8N :", error);
    throw error;
  }
}

export function formatDuration(duree: string | number): string {
  if (!duree) return "N/A";
  if (typeof duree === 'number') {
    const h = Math.floor(duree / 60);
    const m = duree % 60;
    return h > 0 ? `${h}h${m.toString().padStart(2, '0')}min` : `${m}min`;
  }
  return duree;
}