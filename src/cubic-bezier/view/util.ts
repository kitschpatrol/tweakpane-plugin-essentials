/**
 * Calls `callback` once an element is added to the document, so views can
 * measure their size after they are inserted.
 */
export function waitToBeAddedToDom(element: HTMLElement, callback: () => void): void {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== 'childList') {
				continue
			}

			for (const node of mutation.addedNodes) {
				if (!node.contains(node)) {
					continue
				}

				callback()
				observer.disconnect()
			}
		}
	})

	observer.observe(element.ownerDocument.body, {
		attributes: true,
		childList: true,
		subtree: true,
	})
}
