// src/settings.ts
// YAMLファイルから設定を読み込んでエクスポート

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

interface ResearchArea {
	title: string;
	description: string;
	field: string;
}

interface Profile {
	fullName: string;
	title: string;
	institute: string;
	author_name: string;
	research_areas: ResearchArea[];
}

interface Social {
	email: string;
	linkedin: string;
	x: string;
	bluesky: string;
	github: string;
	gitlab: string;
	scholar: string;
	inspire: string;
	arxiv: string;
	orcid: string;
}

interface Template {
	website_url: string;
	menu_left: boolean;
	transitions: boolean;
	lightTheme: string;
	darkTheme: string;
	excerptLength: number;
	postPerPage: number;
	base: string;
}

interface Seo {
	default_title: string;
	default_description: string;
	default_image: string;
}

interface Settings {
	profile: Profile;
	social: Social;
	template: Template;
	seo: Seo;
}

const settingsPath = path.join(process.cwd(), 'src/data/settings.yaml');
const settingsYaml = fs.readFileSync(settingsPath, 'utf8');
const settings = yaml.load(settingsYaml) as Settings;

export const profile = settings.profile;
export const social = settings.social;
export const template = settings.template;
export const seo = settings.seo;
