export type ToolType = 'Ice' | 'Homeless Shelter' | 'Food bank' | null;

let selectedTool = $state<ToolType>(null);

export const mapToolsStore = {
	get selectedTool() {
		return selectedTool;
	},
	selectTool(tool: ToolType) {
		selectedTool = tool;
	},
	clearSelection() {
		selectedTool = null;
	}
};
