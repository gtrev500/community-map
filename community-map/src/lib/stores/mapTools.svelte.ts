export type ToolType = 'Ice sighting' | 'Homeless Shelter' | 'Food bank' | null;
export type DialogueMode = 'create-location' | 'view-location';

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
let dialogueMode = $state<DialogueMode>('create-location');
let selectedLocationId = $state<number | null>(null);
let clickedCoordinates = $state<Coordinates | null>(null);
let screenPosition = $state<ScreenPosition | null>(null);

export const mapToolsStore = {
	get selectedTool() {
		return selectedTool;
	},
	get dialogueOpen() {
		return dialogueOpen;
	},
	get dialogueMode() {
		return dialogueMode;
	},
	get selectedLocationId() {
		return selectedLocationId;
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
		// Also close dialogue and clear any pending location if open
		if (dialogueOpen && dialogueMode === 'create-location') {
			this.closeDialogue();
		}
	},
	openDialogue(coordinates: Coordinates, position: ScreenPosition) {
		clickedCoordinates = coordinates;
		screenPosition = position;
		dialogueMode = 'create-location';
		selectedLocationId = null;
		dialogueOpen = true;
	},
	openLocationView(locationId: number, coordinates: Coordinates, position: ScreenPosition) {
		selectedLocationId = locationId;
		clickedCoordinates = coordinates;
		screenPosition = position;
		dialogueMode = 'view-location';
		dialogueOpen = true;
	},
	closeDialogue() {
		dialogueOpen = false;
		clickedCoordinates = null;
		screenPosition = null;
		selectedLocationId = null;
		dialogueMode = 'create-location';
	}
};
