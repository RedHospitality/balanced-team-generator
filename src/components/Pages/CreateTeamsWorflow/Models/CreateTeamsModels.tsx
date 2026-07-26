export interface PlayerAttributes {
    net?: boolean;
    shooter?: boolean;
}

export interface PlayerModel {
    name: string;
    rating: number;
    attributes?: PlayerAttributes;
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
