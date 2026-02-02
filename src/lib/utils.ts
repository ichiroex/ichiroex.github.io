import { profile, template } from '../settings';

export function highlightAuthor(authors: string): string {
	let result = authors;
	for (const name of profile.author_names) {
		if (authors.includes(name)) {
			result = result.replace(name, `<span class='font-bold'>${name}</span>`);
		}
	}
	return result;
}

export function trimExcerpt(excerpt: string): string {
	const excerptLength = template.excerptLength
	return excerpt.length > excerptLength ? `${excerpt.substring(0, excerptLength)}...` : excerpt
}
