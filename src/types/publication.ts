// src/types/publication.ts
// 論文データの型定義

export type PublicationType = 
	| 'journal'       // 学術誌（査読あり）
	| 'international' // 国際会議（査読あり）
	| 'domestic'      // 国内発表（査読なし）
	| 'preprint'      // プレプリント
	| 'technical';    // テクニカルレポート

export interface PublicationLinks {
	pdf?: string;
	arxiv?: string;
	github?: string;
	slides?: string;
	poster?: string;
	bibtex?: string;
	huggingface?: string;
}

export interface Publication {
	id?: string;
	title: string;
	authors: string;
	venue: string;
	year: number;
	month?: number;
	type: PublicationType;
	award?: string;
	links?: PublicationLinks;
}

export const publicationTypeLabels: Record<PublicationType, string> = {
	journal: 'Journals (Refereed)',
	international: 'International Conferences (Refereed)',
	domestic: 'Domestic (Non-Refereed)',
	preprint: 'Preprints',
	technical: 'Technical Reports',
};

export const publicationTypeOrder: PublicationType[] = [
	'journal',
	'international',
	'preprint',
	'domestic',
	'technical',
];
