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

function init() {
	let styleElement = document.createElement("style");
	styleElement.textContent = css;
	document.head.appendChild(styleElement);

	chrome.storage.local.get([location.hostname], (result) => {
		const userPreference = result[location.hostname];

		if (userPreference === "dark") {
			document.documentElement.classList.add(darkModeClass);
		} else if (userPreference === "light") {
			document.documentElement.classList.remove(darkModeClass);
		}
	});

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
