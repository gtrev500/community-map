export type ToolType = 'Ice' | 'Homeless Shelter' | 'Food bank' | null;

export interface Coordinates {
	lng: number;
	lat: number;
}

let selectedTool = $state<ToolType>(null);
let dialogueOpen = $state<boolean>(false);
let clickedCoordinates = $state<Coordinates | null>(null);

export const mapToolsStore = {
	get selectedTool() {
		return selectedTool;
	},
	get dialogueOpen() {
		return dialogueOpen;
	},
	get clickedCoordinates() {
		return clickedCoordinates;
	},
	selectTool(tool: ToolType) {
		selectedTool = tool;
	},
	clearSelection() {
		selectedTool = null;
	},
	openDialogue(coordinates: Coordinates) {
		clickedCoordinates = coordinates;
		dialogueOpen = true;
	},
	closeDialogue() {
		dialogueOpen = false;
		clickedCoordinates = null;
	}
};
