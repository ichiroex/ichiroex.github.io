// src/lib/loadYaml.ts
// YAMLファイルを読み込むユーティリティ

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/**
 * YAMLファイルを読み込んで型付きオブジェクトとして返す
 * @param filename - src/data/ ディレクトリ内のファイル名
 * @returns パースされたYAMLオブジェクト
 */
export function loadYaml<T>(filename: string): T {
	const filePath = path.join(process.cwd(), 'src/data', filename);
	const fileContents = fs.readFileSync(filePath, 'utf8');
	return yaml.load(fileContents) as T;
}

/**
 * 絶対パスまたは相対パスからYAMLファイルを読み込む
 * @param filePath - ファイルパス
 * @returns パースされたYAMLオブジェクト
 */
export function loadYamlFromPath<T>(filePath: string): T {
	const absolutePath = path.isAbsolute(filePath) 
		? filePath 
		: path.join(process.cwd(), filePath);
	const fileContents = fs.readFileSync(absolutePath, 'utf8');
	return yaml.load(fileContents) as T;
}
