export const ATTACHMENT_URL_REGEXP = /!\[\[((.*?)\.(\w+))\]\]/g;
export const EMBED_URL_REGEXP = /!\[\[(.*?)\]\]/g;

export const GMT_IMAGE_FORMAT = "![{0}]({1})";
export const NO_MKDWN_FORMAT = "Attachments\\\\{0}";
export interface MarkdownExportPluginSettings {
	output: string;
	attachment: string;
	GTM: boolean;
	No_Mkdwn: boolean;
}

export const DEFAULT_SETTINGS: MarkdownExportPluginSettings = {
	output: "output",
	attachment: "attachment",
	GTM: true,
	No_Mkdwn: false
};
