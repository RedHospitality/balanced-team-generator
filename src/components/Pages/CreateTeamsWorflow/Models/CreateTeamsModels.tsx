export interface PlayerModel {
    name: string;
    rating: number;
}

export interface TeamModel {
    players: PlayerModel[];
    totalRating: number;
}
