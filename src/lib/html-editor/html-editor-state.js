/**
 * HTML Editor State
 * Holds state related to the HTML editor mode (active page, preview zoom, etc.)
 * so it doesn't pollute Redux or VM state.
 */

class HtmlEditorState {
    constructor() {
        this.state = {
            activePageId: null,
            width: 1280, // Desktop preset width
            height: 720, // Desktop preset height
            zoom: 100,
            fit: true
        };
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => this.unsubscribe(listener);
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    setState(newState) {
        let changed = false;
        for (const key in newState) {
            if (this.state[key] !== newState[key]) {
                this.state[key] = newState[key];
                changed = true;
            }
        }
        if (changed) {
            this.notify();
        }
    }

    getState() {
        return this.state;
    }

    /**
     * Updates the active page ID based on the selected target and all targets.
     * Rule: If the selected target is an .html file, it becomes active.
     * If not, the active page remains unchanged.
     * If the active page was deleted or renamed (no longer .html), fallback to the first .html file, or null.
     */
    updateActivePage(vm) {
        if (!vm || !vm.editingTarget) return;

        const currentTarget = vm.editingTarget;
        const allTargets = vm.runtime.targets.filter(t => !t.isStage);

        let newActivePageId = this.state.activePageId;

        // If the newly selected target is an .html file, switch to it
        if (/\.html?$/i.test(currentTarget.sprite.name)) {
            newActivePageId = currentTarget.id;
        }

        // Verify if the active page still exists and is still an .html file
        const activeTarget = allTargets.find(t => t.id === newActivePageId);
        if (!activeTarget || !/\.html?$/i.test(activeTarget.sprite.name)) {
            // Active page is invalid. Fallback to the first available .html file
            const firstHtmlTarget = allTargets.find(t => /\.html?$/i.test(t.sprite.name));
            newActivePageId = firstHtmlTarget ? firstHtmlTarget.id : null;
        }

        if (newActivePageId !== this.state.activePageId) {
            this.setState({ activePageId: newActivePageId });
        }
    }
}

const htmlEditorState = new HtmlEditorState();
export default htmlEditorState;
