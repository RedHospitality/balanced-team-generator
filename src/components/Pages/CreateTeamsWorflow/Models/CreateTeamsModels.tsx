export interface PlayerModel {
    name: string;
    rating: number;
}

export interface TeamModel {
    players: PlayerModel[];
    totalRating: number;
}

export interface PlayerData {
    players: PlayerModel[];
    importType: 'Manual' | 'Dynamic Insert' | 'Spreadsheet';
    importUrl?: string; // For spreadsheet imports
}
