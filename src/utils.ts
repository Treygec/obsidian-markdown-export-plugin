import * as path from "path";
import md5 from "md5";
import { TAbstractFile, TFile, TFolder, htmlToMarkdown } from "obsidian";

import { EMBED_URL_REGEXP, GMT_IMAGE_FORMAT, NO_MKDWN_FORMAT, LINK_URL_REGEXP, ALL_ATTACHMENT_REGEXP } from "./config";
import MarkdownExportPlugin from "./main";

type CopyMarkdownOptions = {
	file: TAbstractFile;
	outputSubPath: string;
};

export async function getImageLinks(markdown: string) {
	const imageLinks = markdown.matchAll(ALL_ATTACHMENT_REGEXP);
	return Array.from(imageLinks);
}

export async function getEmbeds(markdown: string) {
	const embeds = markdown.matchAll(EMBED_URL_REGEXP);
	return Array.from(embeds);
}

export async function getLinks(markdown: string) {
	const links = markdown.matchAll(LINK_URL_REGEXP);
	return Array.from(links)
}

export async function getEmbedBlock(markdown: string, text: string) {
	let contentList = markdown.split('\n')

	let content = contentList.find(e => e.includes(text));
	content = '> ' + content
	return content
}
export async function getHeadingContent(markdown: string, text: string) {
	let contentList = markdown.split('\n')
	const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el[0] === val ? [...acc, i] : acc), []);
	let headingsIndex = indexOfAll(contentList, "#")
	let headings = headingsIndex.map(i => contentList[i])
	let startOfContentIndex = headings.findIndex(e => e.includes(text))
	let endOfContentIndex = contentList.length - 1
	let startofContentLevel = contentList[headingsIndex[startOfContentIndex]].split(" ")[0].split("#").length - 1

	for (let index = startOfContentIndex + 1; index < headings.length; index++) {
		let headingLevel = headings[index].split(" ")[0].split("#").length - 1;
		if (startofContentLevel >= headingLevel) {
			endOfContentIndex = headingsIndex[index]
			break
		}
	}

	let releventContent = contentList.slice(headingsIndex[startOfContentIndex], endOfContentIndex);
	releventContent = releventContent.map(e => "> " + e + " \n")
	let content = releventContent.join('')
	return content
}

// get all markdown parameters
export function allMarkdownParams(
	file: TAbstractFile,
	out: Array<CopyMarkdownOptions>,
	outputSubPath = ".",
	parentPath = ""
): Array<CopyMarkdownOptions> {
	try {
		//  dir
		if (!(<TFile>file).extension) {
			for (const absFile of (<TFolder>file).children) {
				if (!(<TFile>absFile).extension) {
					const extname = absFile.path
						.replace(file.path, "")
						.slice(1);
					const outputSubPath = path.join(parentPath, extname);
					allMarkdownParams(
						absFile,
						out,
						outputSubPath,
						outputSubPath
					);
				} else {
					out.push({
						file: absFile,
						outputSubPath,
					});
				}
			}
		} else {
			out.push({
				file,
				outputSubPath,
			});
		}
	} catch (e) {
		console.warn("Path Error:" + parentPath);
	}
	return out;
}

export async function tryRun(
	plugin: MarkdownExportPlugin,
	file: TAbstractFile
) {
	// recursive functions are not suitable for this case
	// if ((<TFile>file).extension) {
	// 	return new Promise((resolve) => {
	// 		setTimeout(
	// 			() =>
	// 				resolve(tryCopyMarkdownByRead(plugin, file, outputSubPath)),
	// 			1000
	// 		);
	// 	});
	// }

	try {
		const params = allMarkdownParams(file, []);
		for (const param of params) {
			await tryCopyMarkdownByRead(plugin, param);
		}
	} catch (error) {
		if (!error.message.contains("file already exists")) {
			throw error;
		}
	}
}

export async function tryCreateFolder(
	plugin: MarkdownExportPlugin,
	path: string
) {
	try {
		await plugin.app.vault.createFolder(path);
	} catch (error) {
		if (!error.message.contains("Folder already exists")) {
			throw error;
		}
	}
}

export async function tryCopyImage(
	plugin: MarkdownExportPlugin,
	contentPath: string,
	fileName: string
) {
	try {
		await plugin.app.vault.adapter
			.read(contentPath)
			.then(async (content) => {
				const imageLinks = await getLinks(content);
				for (const index in imageLinks) {
					var imageLink = imageLinks[index][1];

					const imageLinkMd5 = md5(imageLink);
					const imageExt = path.extname(imageLink);
					if (imageLink.contains("#")) {
						imageLink = imageLink.split("#")[0]
					}

					const ifile = plugin.app.metadataCache.getFirstLinkpathDest(imageLink, contentPath);
					if (ifile) {
						if (plugin.settings.individual_folders) {
							plugin.app.vault.adapter
								.copy(
									ifile.path,
									path.join(
										plugin.settings.output,
										fileName,
										plugin.settings.attachments,
										ifile.name
									)
								)
								.catch((error) => {
									if (
										!error.message.contains("file already exists")
									) {
										throw error;
									}
								});
						} else {
							plugin.app.vault.adapter
								.copy(
									ifile.path,
									path.join(
										plugin.settings.output,
										plugin.settings.attachments,
										imageLink
									)
								)
								.catch((error) => {
									if (
										!error.message.contains("file already exists")
									) {
										throw error;
									}
								});

						}
					}
				}
			});
	} catch (error) {
		if (!error.message.contains("file already exists")) {
			throw error;
		}
	}
}

export async function tryCopyMarkdown(
	plugin: MarkdownExportPlugin,
	contentPath: string,
	contentName: string
) {
	try {
		await plugin.app.vault.adapter.copy(
			contentPath,
			path.join(plugin.settings.output, contentName)
		);
	} catch (error) {
		if (!error.message.contains("file already exists")) {
			throw error;
		}
	}
}

export async function getEmbedMap(plugin: MarkdownExportPlugin, content: string, path: string) {
	// key：link url
	// value： embed content parse from html document
	const embedMap = new Map();
	const newAttachmentsList = await getImageLinks(content)
	const attachmentNames = newAttachmentsList.map(x => x[0]);
	const newEmbedList = (await getEmbeds(content)).filter(embed => !attachmentNames.includes(embed[0]))

	let contentPath = path
	for (let index in newEmbedList) {

		let file = newEmbedList[index][1]
		let content = null
		if (file.contains("#")) {
			content = file.split("#").slice(-1)[0]
			file = file.split("#")[0]


		}



		const filePath = plugin.app.metadataCache.getFirstLinkpathDest(file, contentPath);

		const text = await this.app.vault.read(filePath)
		// still need to address when links and embeds have display text. Haven't tested at all yet. 
		if (content && content.startsWith('^')) {
			let embedContent = await getEmbedBlock(text, content)
			let embedValue = embedContent;
			embedValue = '\n > FROM: ' + plugin.settings.attachments + "/" + file + "\n" + embedContent;
			let embedKey = newEmbedList[index][1];
			embedMap.set(embedKey, embedValue);

		}

		else if (content) {
			let embedContent = await getHeadingContent(text, content)
			let embedValue = embedContent;
			embedValue = '\n > FROM: ' + plugin.settings.attachments + "/" + file + "\n" + embedContent;
			let embedKey = newEmbedList[index][1];
			embedMap.set(embedKey, embedValue);


		}

		else {
			let embedText = text.split("\n").map(e => "> " + e + "\n").join('')
			let embedValue = "\n > FROMs: " + plugin.settings.attachments + "/" + file + "\n" + embedText
			let embedKey = newEmbedList[index][1]
			embedMap.set(embedKey, embedValue)
		}


		if (newAttachmentsList) {
			newAttachmentsList.forEach(e => {
				console.log("ATTACHMENT", e)
				let embedValue = e[1];
				embedValue = plugin.settings.attachments + "/" + embedValue;
				const embedKey = e[1];
				embedMap.set(embedKey, embedValue);
			})
		}

	}
	return embedMap;
}


export async function tryCopyMarkdownByRead(
	plugin: MarkdownExportPlugin,
	{ file, outputSubPath = "." }: CopyMarkdownOptions
) {
	try {
		await plugin.app.vault.adapter.read(file.path).then(async (content) => {
			const imageLinks = await getLinks(content);

			for (const index in imageLinks) {
				const rawImageLink = imageLinks[index][0];
				const imageLink = imageLinks[index][1];
				const imageLinkMd5 = md5(imageLink);
				const imageExt = path.extname(imageLink);

				const hashLink = path.join(
					path.parse(file.name).name,
					plugin.settings.attachments,
					imageLinkMd5.concat(imageExt)
				);

				if (plugin.settings.GTM) {
					content = content.replace(
						rawImageLink,
						GMT_IMAGE_FORMAT.format(imageLink, "<" + imageLink + ">")
					);
				}
				else if (plugin.settings.No_Mkdwn) {
					content = content.replace(rawImageLink, NO_MKDWN_FORMAT.format(imageLink))
				}
			}
			const cfile = plugin.app.workspace.getActiveFile();


			if (file != undefined) {
				const embedMap = await getEmbedMap(plugin, content, file.path);
				const embeds = await getEmbeds(content);
				for (const index in embeds) {
					const url = embeds[index][1];
					content = content.replace(embeds[index][0], embedMap.get(url));
				}
			}

			await tryCopyImage(plugin, file.path, path.parse(file.name).name);

			await tryCreateFolder(
				plugin,
				path.join(plugin.settings.output, outputSubPath)
			);
			if (plugin.settings.individual_folders) {

				plugin.app.vault.adapter.write(
					path.join(plugin.settings.output, path.parse(file.name).name, outputSubPath, file.name),
					content
				);
			} else {

				plugin.app.vault.adapter.write(
					path.join(plugin.settings.output, outputSubPath, file.name),
					content
				);

			}
		});
	} catch (error) {
		if (!error.message.contains("file already exists")) {
			throw error;
		}
	}
}
