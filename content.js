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

function isSiteDark() {
	const bodyStyles = window.getComputedStyle(document.body);
	const backgroundColor = bodyStyles.backgroundColor;
	const color = bodyStyles.color;

	const isDarkBackground = isColorDark(backgroundColor);
	const isLightText = !isColorDark(color);

	return isDarkBackground && isLightText;
}

function isColorDark(color) {
	if (!color) {
		return false;
	}

	const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) {
		return false;
	}

	const r = parseInt(match[1]);
	const g = parseInt(match[2]);
	const b = parseInt(match[3]);

	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance < 128;
}

function applyDarkMode(force) {
	chrome.storage.local.get([location.hostname], (result) => {
		const userPreference = result[location.hostname];

		if (userPreference === undefined) {
			if (!isSiteDark() || force) {
				document.documentElement.classList.add(darkModeClass);
			}
		} else if (userPreference === "dark") {
			document.documentElement.classList.add(darkModeClass);
		} else {
			document.documentElement.classList.remove(darkModeClass);
		}
	});
}

function init() {
	let styleElement = document.createElement("style");
	styleElement.textContent = css;
	document.head.appendChild(styleElement);

	applyDarkMode(false);

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
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
