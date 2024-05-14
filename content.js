const randomId = Math.random().toString(36).substring(7);
const darkModeClass = `dark-mode-${randomId}`;

const css = `
	html.${darkModeClass} {
		filter: invert(100%) hue-rotate(180deg);
	}

	html.${darkModeClass} img,
	html.${darkModeClass} video,
	html.${darkModeClass} svg,
	html.${darkModeClass} canvas {
		filter: invert(100%) hue-rotate(180deg);
	}
`;

let styleElement = document.createElement("style");
styleElement.textContent = css;
document.head.appendChild(styleElement);

function isSiteDark() {
	const bodyStyles = window.getComputedStyle(document.body);
	const backgroundColor = bodyStyles.backgroundColor;
	const color = bodyStyles.color;

	// Simple heuristic: Check if background is dark and text is light
	const isDarkBackground = isColorDark(backgroundColor);
	const isLightText = !isColorDark(color);

	return isDarkBackground && isLightText;
}

function isColorDark(color) {
	if (!color) return false;

	// Extract RGB values
	const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) return false;

	const r = parseInt(match[1]);
	const g = parseInt(match[2]);
	const b = parseInt(match[3]);

	// Calculate luminance
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance < 128; // Threshold for darkness
}

function applyDarkMode(force) {
	chrome.storage.local.get([location.hostname], (result) => {
		const userPreference = result[location.hostname];

		if (userPreference === undefined) {
			// No user preference, use heuristic
			if (!isSiteDark() || force) {
				document.documentElement.classList.add(darkModeClass);
			}
		} else if (userPreference === "dark") {
			// User prefers dark mode
			document.documentElement.classList.add(darkModeClass);
		} else {
			// User prefers light mode
			document.documentElement.classList.remove(darkModeClass);
		}
	});
}

applyDarkMode(false);

// Add event listener for the button to toggle dark mode manually
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "toggleDarkMode") {
		document.documentElement.classList.toggle(darkModeClass);
		const isDark =
			document.documentElement.classList.contains(darkModeClass);
		chrome.storage.local.set({
			[location.hostname]: isDark ? "dark" : "light",
		});
	}
});
