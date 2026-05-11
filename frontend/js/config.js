if (window.location.protocol === 'file:') {
	const currentPage = window.location.pathname.split(/[\\/]/).pop() || 'index.html';
	const targetUrl = `http://localhost:8080/${currentPage}${window.location.search}${window.location.hash}`;
	window.location.replace(targetUrl);
}

const BASE_URL = 'http://localhost:8080';
const WS_URL = 'http://localhost:8080/ws';