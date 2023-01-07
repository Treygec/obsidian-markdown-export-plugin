export const ATTACHMENT_URL_REGEXP = /!\[\[((.*?)\.(\w+))\]\]/g;
export const EMBED_URL_REGEXP = /!\[\[(.*?)\]\]/g;
export const LINK_URL_REGEXP = /\[\[(.*?)\]\]/g;

export const GMT_IMAGE_FORMAT = "![{0}]({1})";
export const NO_MKDWN_FORMAT = "Attachments\\\\{0}";

export interface MarkdownExportPluginSettings {
	output: string;
	attachments: string;
	GTM: boolean;
	No_Mkdwn: boolean;
	individual_folders: boolean;
	all_links: boolean;

}

export const DEFAULT_SETTINGS: MarkdownExportPluginSettings = {
	output: "output",
	attachments: "attachments",
	GTM: true,
	No_Mkdwn: false,
	individual_folders: true,
	all_links: true
};
