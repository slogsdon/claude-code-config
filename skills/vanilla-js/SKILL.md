---
name: vanilla-js
description: Use this skill when you need modern vanilla JavaScript architecture without framework dependencies. Examples include designing modular ES6 architectures with clear separation of concerns; implementing Web Components with Custom Elements API; creating efficient DOM manipulation patterns without jQuery; architecting client-side state management using native approaches; building progressive enhancement strategies that work without JavaScript; implementing modern patterns like async/await, modules, and classes.
---
Provide modern vanilla JavaScript architecture expertise using ES modules, Web Components, and native browser APIs without framework dependencies.

## Core Vanilla JavaScript Domains

**ES Module Architecture**: Design modular applications with:
- Clean module boundaries and dependency management
- Dynamic imports for code splitting
- Singleton patterns for shared services
- Module-based state management

**Web Components**: Implement Custom Elements with:
- Shadow DOM for encapsulation
- HTML templates for reusable markup
- Custom element lifecycle (connectedCallback, disconnectedCallback, attributeChangedCallback)
- Proper accessibility attributes

**DOM Manipulation**: Create efficient patterns for:
- Query optimization (querySelector, querySelectorAll)
- Event delegation for performance
- Mutation observers for dynamic content
- Template literals for HTML generation
- DocumentFragment for batch updates

**State Management**: Build native state patterns with:
- Observable pattern with custom events
- Centralized stores without libraries
- Reactive updates with proxies
- LocalStorage/SessionStorage persistence
- State change middleware

**Progressive Enhancement**: Design for resilience with:
- Feature detection (not browser detection)
- Graceful degradation when JS unavailable
- Core functionality without JavaScript
- JavaScript as enhancement layer

**Modern JavaScript Patterns**: Leverage native capabilities:
- Async/await for cleaner async code
- Promises for asynchronous operations
- Classes for object-oriented design
- Destructuring and spread operators
- Optional chaining and nullish coalescing

## Example Component Pattern

```javascript
// Base component class
export class Component {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ?
            document.querySelector(element) : element;
        this.options = { ...this.defaultOptions, ...options };
        this.state = this.getInitialState();

        if (!this.element) {
            throw new Error('Component element not found');
        }

        this.init();
        this.bindEvents();
    }

    get defaultOptions() { return {}; }
    getInitialState() { return {}; }
    init() { /* Override in subclass */ }
    bindEvents() { /* Override in subclass */ }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.onStateChange(oldState, this.state);
    }

    onStateChange(oldState, newState) { /* Override */ }
    destroy() { /* Cleanup */ }
}
```

## Web Component Example

```javascript
class UserCard extends HTMLElement {
    static get observedAttributes() {
        return ['user-id', 'name', 'email'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.addEventListener('click', this.handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.handleClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>/* Scoped styles */</style>
            <div class="user-card">
                <h3>${this.getAttribute('name')}</h3>
                <p>${this.getAttribute('email')}</p>
            </div>
        `;
    }

    handleClick = () => {
        this.dispatchEvent(new CustomEvent('user-selected', {
            detail: { userId: this.getAttribute('user-id') },
            bubbles: true
        }));
    }
}

customElements.define('user-card', UserCard);
```

Focus on performance-optimized, accessible, maintainable vanilla JavaScript solutions using web platform primitives.
