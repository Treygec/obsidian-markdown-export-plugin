import {
	App,
	MenuItem,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import * as path from "path";


import { MarkdownExportPluginSettings, DEFAULT_SETTINGS } from "./config";
import { tryCreateFolder, tryRun } from "./utils";

export default class MarkdownExportPlugin extends Plugin {
	settings: MarkdownExportPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MarkdownExportSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				const addMenuItem = (item: MenuItem) => {
					item.setTitle("Export all to package");
					item.onClick(async () => {
						// try create attachment directory
						if (this.settings.individual_folders) {

							await tryCreateFolder(
								this,
								path.join(
									this.settings.output,
									path.parse(file.name).name,
									this.settings.attachments
								)
							);
						} else {
							await tryCreateFolder(
								this,
								path.join(
									this.settings.output,
									this.settings.attachments
								)
							);

						}

						// run
						await tryRun(this, file);

						new Notice(
							`Exporting ${file.path} to ${path.join(
								this.settings.output,
								file.name
							)}`
						);
					});
				};
				menu.addItem(addMenuItem);
			})
		);
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MarkdownExportSettingTab extends PluginSettingTab {
	plugin: MarkdownExportPlugin;

	constructor(app: App, plugin: MarkdownExportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Markdown Export" });

		new Setting(containerEl)
			.setName("Custom default output path")
			.setDesc("default directory for one-click export")
			.addText((text) =>
				text
					.setPlaceholder("Enter default output path")
					.setValue(this.plugin.settings.output)
					.onChange(async (value) => {
						this.plugin.settings.output = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Custom attachment path(optional)")
			.setDesc("attachment path")
			.addText((text) =>
				text
					.setPlaceholder("Enter attachment path")
					.setValue(this.plugin.settings.attachments)
					.onChange(async (value) => {
						this.plugin.settings.output = value;
						await this.plugin.saveSettings();
					})
			);
		// TODO: #25 Make Markdown settings a dropdown with 3 options. Github, standard, and None
		new Setting(containerEl)
			.setName("Use GitHub Flavored Markdown Format")
			.setDesc(
				"The format of markdown is more inclined to choose Github Flavored Markdown"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.GTM)
					.onChange(async (value: boolean) => {
						this.plugin.settings.GTM = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("No Markdown Formatting")
			.setDesc(
				"For sharing with others who arent familiar with markdown"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.No_Mkdwn)
					.onChange(async (value: boolean) => {
						this.plugin.settings.No_Mkdwn = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Export to individual folder")
			.setDesc(
				"Create a single folder that contains the entire export for a note"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.individual_folders)
					.onChange(async (value: boolean) => {
						this.plugin.settings.individual_folders = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
