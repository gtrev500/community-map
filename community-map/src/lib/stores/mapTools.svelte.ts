export type ToolType = 'Ice' | 'Homeless Shelter' | 'Food bank' | null;

export interface Coordinates {
	lng: number;
	lat: number;
}

export interface ScreenPosition {
	x: number;
	y: number;
}

let selectedTool = $state<ToolType>(null);
let dialogueOpen = $state<boolean>(false);
let clickedCoordinates = $state<Coordinates | null>(null);
let screenPosition = $state<ScreenPosition | null>(null);

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
	get screenPosition() {
		return screenPosition;
	},
	selectTool(tool: ToolType) {
		selectedTool = tool;
	},
	clearSelection() {
		selectedTool = null;
	},
	openDialogue(coordinates: Coordinates, position: ScreenPosition) {
		clickedCoordinates = coordinates;
		screenPosition = position;
		dialogueOpen = true;
	},
	closeDialogue() {
		dialogueOpen = false;
		clickedCoordinates = null;
		screenPosition = null;
	}
};
