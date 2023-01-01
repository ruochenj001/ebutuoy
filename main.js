"use strict";

(async () => {
// default error handler
window.onerror = (message, src, lineno, colno, error) => {
	alert(`Error at "${src}", line ${lineno}:${colno}: \n${error}`, "Error");
};

// load api key
gapi.load("client", () => {
	gapi.client.init({
		apiKey: "AIzaSyBqQGSeJZUdI0itB4t-UW21-DOv3Ae1cAk",
		discoveryDocs: [
			"https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
		]
	});
});

let pageToken = null;

const resultContainer = document.getElementById("results");
const searchBar = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const maxResults = document.getElementById("max-results");
const order = document.getElementById("order");
const loadmore = document.getElementById("loadmore");

searchButton.onclick = () => {
	resultContainer.innerHTML = "";
	pageToken = null;
	run();
};
searchBar.onkeydown = (e) => {
	if (e.key == "Enter") {
		e.preventDefault();
		searchButton.click();
	}
};

/**
 * @param {HTMLInputElement} element 
 * @param {number} def 
 * @param {number} min 
 * @param {number} max 
 */
function correctNumberRange(element, def, min, max) {
	const val = element.value;
	if (val == null || val.length == 0)
		return element.value = def.toString();

	const nVal = parseInt(val);
	if (nVal < min)
		return element.value = min.toString();
	else if (nVal > max)
		return element.value = max.toString();
	else return element.value;
}

function run() {
	search(searchBar.value, correctNumberRange(maxResults, 10, 1, 50), order.value);
}

/**
 * @param {HTMLElement} container 
 * @param {string} videoId 
 */
function createVideoFrame(container, videoId) {
	const frame = document.createElement("iframe");
	frame.setAttribute("type", "text/plain");
	frame.setAttribute("width", "800");
	frame.setAttribute("height", "600");
	frame.setAttribute("loading", "lazy");
	frame.setAttribute("scrolling", "no");
	frame.setAttribute("fetchpriority", "high");
	frame.setAttribute("allowfullscreen", "true");
	frame.setAttribute("referrerpolicy", "no-referrer");
	frame.setAttribute("sandbox", "allow-scripts allow-same-origin");

	const url = new URL("https://www.youtube.com/embed/" + videoId);
	url.searchParams.set("autoplay", "1");
	url.searchParams.set("controls", "1");
	url.searchParams.set("rel", "0");
	url.searchParams.set("color", "white");
	frame.setAttribute("src", url.href);

	container.appendChild(frame);
}

/**
 * @param {string} q 
 * @param {string | number} maxResults 
 * @param {string} order 
 */
async function search(q, maxResults, order) {
	const params = {
		part: "snippet",
		type: "video",
		order,
		maxResults,
		pageToken,
		q
	};

	const result = await gapi.client.youtube.search.list(params);
	const items = result.result.items;
	for (const item of items) {
		const id = item.id.videoId;
		const title = item.snippet.title;
		const description = item.snippet.description;
		const publishTime = item.snippet.publishTime;
		const thumbnail = item.snippet.thumbnails.medium;

		const container = document.createElement("div");
		container.className = "result";
		container.innerHTML = '<div class="result-item"><img class="result-preview" width="160" height="90" /><div class="result-details"><div class="result-title">Example</div><div class="result-description">An example video</div><div class="result-publish-time">A long time ago</div></div></div><div class="video-container"></div>';
		container.getElementsByClassName("result-preview")[0].setAttribute("src", thumbnail.url);
		container.getElementsByClassName("result-title")[0].textContent = title;
		container.getElementsByClassName("result-description")[0].textContent = description;
		container.getElementsByClassName("result-publish-time")[0].textContent = publishTime;

		const videoContainer = container.getElementsByClassName("video-container")[0];
		videoContainer.style.display = "none";

		container.getElementsByClassName("result-item")[0].onclick = () => {
			if (videoContainer.style.display == "none") {
				videoContainer.style.display = "block";
				createVideoFrame(videoContainer, id);
			} else {
				videoContainer.innerHTML = "";
				videoContainer.style.display = "none";
			}
		};

		resultContainer.appendChild(container);
	}

	loadmore.remove();
	loadmore.style.display = "block";

	const nextPageToken = result.result.nextPageToken;
	if (nextPageToken != null) {
		// only show when there are more videos available
		loadmore.onclick = () => {
			pageToken = nextPageToken;
			run();
		};
		resultContainer.appendChild(loadmore);
	}
}

})();
