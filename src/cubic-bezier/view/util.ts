/**
 * Calls `callback` once `element` is connected to its document, so views can
 * measure their size after they are inserted. Calls it immediately if `element`
 * is already connected.
 */
export function waitToBeAddedToDom(element: HTMLElement, callback: () => void): void {
	if (element.isConnected) {
		callback()
		return
	}

	const observer = new MutationObserver(() => {
		if (!element.isConnected) {
			return
		}

		observer.disconnect()
		callback()
	})

	observer.observe(element.ownerDocument.body, {
		childList: true,
		subtree: true,
	})
}
