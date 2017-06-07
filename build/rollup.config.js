// rollup.config.js
import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';

export default {
	entry: 'src/main.js',
	dest: 'public/bundle.js',
	format: 'iife',
	plugins: [
		svelte({
			// By default, all .html and .svelte files are compiled
			extensions: ['.html'],

			// You can restrict which files are compiled
			// using `include` and `exclude`
			include: 'src/components/**/*.html',

			// Extract CSS into a separate file (recommended).
			// See note below
			css: function (css) {
				fs.writeFileSync('public/main.css', css);
			}
		})
	]
}
