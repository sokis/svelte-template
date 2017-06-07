(function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations, detach, start) {
	for (var i = start; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].destroy(detach);
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addEventListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeEventListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, newState, oldState) {
	for (var key in group) {
		if (!(key in newState)) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		if (differs(newValue, oldValue)) {
			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	this._root._flush();
}

function _flush() {
	if (!this._renderHooks) return;

	while (this._renderHooks.length) {
		this._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

var template$1 = (function () {
	return {
		data() {
			return {
				text: 'name'
			}
		},
		oncreate() {}
	};

}());

function create_main_fragment$1 ( state, component ) {
	var text_value;

	var button = createElement( 'button' );
	var text = createText( text_value = state.text );
	appendNode( text, button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},

		update: function ( changed, state ) {
			if ( text_value !== ( text_value = state.text ) ) {
				text.data = text_value;
			}
		},

		unmount: function () {
			detachNode( button );
		},

		destroy: noop
	};
}

function Button ( options ) {
	options = options || {};
	this._state = assign( template$1.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;

	this._fragment = create_main_fragment$1( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );

	if ( options._root ) {
		options._root._renderHooks.push( template$1.oncreate.bind( this ) );
	} else {
		template$1.oncreate.call( this );
	}
}

assign( Button.prototype, proto );

Button.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Button.prototype.teardown = Button.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

var template$2 = (function () {
	return {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		}
	};

}());

function create_main_fragment$2 ( state, component ) {
	var div = createElement( 'div' );
	var p = createElement( 'p' );
	appendNode( p, div );
	appendNode( createText( "Select a category:" ), p );
	appendNode( createText( "\n\t" ), div );
	var ul = createElement( 'ul' );
	appendNode( ul, div );
	var each_block_value = state.categories;

	var each_block_iterations = [];

	for ( var i = 0; i < each_block_value.length; i += 1 ) {
		each_block_iterations[i] = create_each_block( state, each_block_value, each_block_value[i], i, component );
		each_block_iterations[i].mount( ul, null );
	}

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},

		update: function ( changed, state ) {
			var each_block_value = state.categories;

			if ( 'categories' in changed ) {
				for ( var i = 0; i < each_block_value.length; i += 1 ) {
					if ( each_block_iterations[i] ) {
						each_block_iterations[i].update( changed, state, each_block_value, each_block_value[i], i );
					} else {
						each_block_iterations[i] = create_each_block( state, each_block_value, each_block_value[i], i, component );
						each_block_iterations[i].mount( ul, null );
					}
				}

				for ( ; i < each_block_iterations.length; i += 1 ) {
					each_block_iterations[i].unmount();
					each_block_iterations[i].destroy();
				}
				each_block_iterations.length = each_block_value.length;
			}
		},

		unmount: function () {
			detachNode( div );

			for ( var i = 0; i < each_block_iterations.length; i += 1 ) {
				each_block_iterations[i].unmount();
			}
		},

		destroy: function () {
			destroyEach( each_block_iterations, false, 0 );
		}
	};
}

function create_each_block ( state, each_block_value, category, category_index, component ) {
	var text_1_value;

	var li = createElement( 'li' );
	var button = createElement( 'button' );
	appendNode( button, li );
	addEventListener( button, 'click', click_handler );

	button._svelte = {
		component: component,
		each_block_value: each_block_value,
		category_index: category_index
	};

	appendNode( createText( "select " ), button );
	var text_1 = createText( text_1_value = category );
	appendNode( text_1, button );

	return {
		mount: function ( target, anchor ) {
			insertNode( li, target, anchor );
		},

		update: function ( changed, state, each_block_value, category, category_index ) {
			button._svelte.each_block_value = each_block_value;
			button._svelte.category_index = category_index;

			if ( text_1_value !== ( text_1_value = category ) ) {
				text_1.data = text_1_value;
			}
		},

		unmount: function () {
			detachNode( li );
		},

		destroy: function () {
			removeEventListener( button, 'click', click_handler );
		}
	};
}

function click_handler ( event ) {
	var component = this._svelte.component;
	var each_block_value = this._svelte.each_block_value, category_index = this._svelte.category_index, category = each_block_value[category_index];
	component.fire( "select", { category } );
}

function CategoryChooser ( options ) {
	options = options || {};
	this._state = assign( template$2.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;

	this._fragment = create_main_fragment$2( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

assign( CategoryChooser.prototype, proto );

CategoryChooser.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

CategoryChooser.prototype.teardown = CategoryChooser.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

var template = (function () {
	return {
		data() {
			return {
				name: 'everybody',
				btnText: 'My button1'
			}
		},

		methods: {
			playTwentyQuestions(category) {
				alert(category);
			}
		}
	};

}());

function create_main_fragment ( state, component ) {
	var text_1_value, button_updating = false;

	var div = createElement( 'div' );
	setAttribute( div, 'svelte-3037837065', '' );
	var h1 = createElement( 'h1' );
	appendNode( h1, div );
	appendNode( createText( "Hello " ), h1 );
	var text_1 = createText( text_1_value = state.name );
	appendNode( text_1, h1 );
	appendNode( createText( "\n\t" ), div );
	var p = createElement( 'p' );
	appendNode( p, div );
	p.className = "foo";
	appendNode( createText( "Big red Comic Sans" ), p );
	appendNode( createText( "\n\t" ), div );

	var categorychooser = new CategoryChooser({
		target: div,
		_root: component._root
	});

	categorychooser.on( 'select', function ( event ) {
		component.playTwentyQuestions( event.category );
	});

	appendNode( createText( "\n\t" ), div );

	var button_initial_data = {};
	if ( 'btnText' in state ) button_initial_data.text = state.btnText;
	var button = new Button({
		target: div,
		_root: component._root,
		data: button_initial_data
	});

	component._bindings.push( function () {
		if ( button._torndown ) return;
		button.observe( 'text', function ( value ) {
			if ( button_updating ) return;
			button_updating = true;
			component._set({ btnText: value });
			button_updating = false;
		}, { init: differs( button.get( 'text' ), state.btnText ) });
	});

	button._context = {
		state: state
	};

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},

		update: function ( changed, state ) {
			if ( text_1_value !== ( text_1_value = state.name ) ) {
				text_1.data = text_1_value;
			}

			if ( !button_updating && 'btnText' in changed ) {
				button_updating = true;
				button._set({ text: state.btnText });
				button_updating = false;
			}

			button._context.state = state;
		},

		unmount: function () {
			detachNode( div );
		},

		destroy: function () {
			categorychooser.destroy( false );
			button.destroy( false );
		}
	};
}

function App ( options ) {
	options = options || {};
	this._state = assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	this._renderHooks = [];
	this._bindings = [];

	this._fragment = create_main_fragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	while ( this._bindings.length ) this._bindings.pop()();
	this._flush();
}

assign( App.prototype, template.methods, proto );

App.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
	while ( this._bindings.length ) this._bindings.pop()();
	this._flush();
};

App.prototype.teardown = App.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

const app = new App({
	target: document.querySelector('main')
});

}());
