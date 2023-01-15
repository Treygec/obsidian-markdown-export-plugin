// All allowed filetypes in obsidian as of 1/10/2023 https://help.obsidian.md/How+to/Embed+files
export const ALL_ATTACHMENT_REGEXP = /!\[\[((.*?)\.((png|gif|jpg|jpeg|bmp|svg|mp3|webm|wav|m4a|ogg|3gp|flac|mp4|ogv|mov|mkv|pdf)))\]\]/gi;
//Future plans to have seperate folders for different kinds of attachments
// export const IMAGE_ATTACHMENT_REGEXP = /!\[\[((.*?)\.(?i)(png|gif|jpg|jpeg|bmp|svg)(?-i))\]\]/gi;
// export const AUDIO_ATTACHMENT_REGEXP = /!\[\[((.*?)\.(?i)(mp3|wav|m4a|ogg|3gp|flac)(?-i))\]\]/gi;
// export const VIDEO_ATTACHMENT_REGEXP = /!\[\[((.*?)\.(?i)(mp4|ogv|mov|mkv|webm)(?-i))\]\]/gi;
// export const PDF_ATTACHMENT_REGEXP = /!\[\[((.*?)\.(?i)(pdf)(?-i))\]\]/gi;
// export const ATTACHMENT_URL_REGEXP = /!\[\[((.*?)\.(\w+))\]\]/gi; not sure this is needed or will work because filenames can have periods in them
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
