# 🚀 EzMinify Plugin for Laravel + Vite 🎉

**EzMinify** is a simple and powerful plugin for Laravel projects using Vite. It minifies and bundles your JavaScript and CSS files to optimize your web assets for production, making your app faster! 💨

This plugin is designed specifically to be used within a **Laravel** environment with **Vite** as your bundler.

## 🛠️ Features

- **Minify** JavaScript and CSS files.
- **Merge** multiple JS/CSS files into one.
- **Maintain directory structure** or optionally flatten the output.
- **Automatically updates** Laravel's `manifest.json` with minified file paths.
- **Works seamlessly** with Vite's build process.

## 📦 Installation

Install the plugin via **npm**:

```bash
npm install ez-minify-plugin-for-laravel-vite --save-dev

## ⚙️ Usage

In your `vite.config.js` file, import and use the `EzMinify` plugin like this:

```javascript
import EzMinify from 'ez-minify-plugin-for-laravel-vite';

export default {
  plugins: [
    EzMinify({
      input: [
        {
          src: 'resources/doot/js/pages/index.init.js',   // Path to JS file or folder
          output: 'public/build/doot/js/pages',            // Output path for minified JS files
          keep_structure: true                             // Whether to keep directory structure
        },
        {
          src: 'resources/doot/js',                        // Another JS directory
          output: 'public/build/doot/js',                  // Output path for minified JS files
          keep_structure: false,                          // Optionally, flatten the directory structure
          merge_result: false                              // Don't merge the files into a single file
        },
      ],
    }),
  ],
};
```

### Options

- **`input`** *(Array)*:
    - Define paths to JS/CSS files or directories to minify.
    - Each entry is an object with the following options:
        - `src`: Path to the source directory/file to minify.
        - `output`: Destination folder for the minified files. (defaults to `'public/build/assets'`)
        - `keep_structure`: Whether to maintain the folder structure in the output. (default is `true`).
        - `merge_result`: If `true`, merges files (default is `false`).

- **`manifestPath`** *(String)*: Path to your `manifest.json` file (defaults to `'public/build/manifest.json'`).

### 🧰 Example Configuration

Here’s an example of how to use the **EzMinify** plugin in your `vite.config.js` file:

```js
import EzMinify from 'ez-minify-plugin-for-laravel-vite';

import EzMinify from 'ez-minify-plugin-for-laravel-vite';

export default {
    plugins: [
        laravel({
            input: [
                'resources/js/app.js',                      //this entry creates the initial manifest
            ],
        }),
        EzMinify({
            manifestPath: 'public/build/manifest.json',
            input: [
                {
                    src: 'resources/js/pages/index.js',     // A single JavaScript file
                },
                {
                    src: 'resources/css',                   // A CSS directory
                    output: 'public/build/css',             // Output folder for CSS
                    keep_structure: false,                  // Flatten the folder structure
                    merge_result: true                      // Merge multiple CSS files into one
                },
            ],
        }),
    ],
};
```
### Breakdown of the Example:

- **`input`**: Specifies the files or directories to be minified and their output locations:
    - The first entry:
        - **`src: 'resources/js/pages/index.js'`**: Minifies the `index.js` file located in the `resources/js/pages` directory.
        - **`output: 'public/build/js/pages'`**: Saves the minified `index.js` in the `public/build/js/pages` directory while keeping the original folder structure.
        - **`keep_structure: true`**: Keeps the directory structure as it is.
    - The second entry:
        - **`src: 'resources/css'`**: Minifies all files in the `resources/css` directory.
        - **`output: 'public/build/css'`**: Saves the minified files in the `public/build/css` directory.
        - **`keep_structure: false`**: Flattens the directory structure, meaning all minified files will be saved directly inside `public/build/css`.
        - **`merge_result: true`**: Merges all the minified CSS files into a single file.
- **`manifestPath`**: Points to the `public/build/manifest.json` file where the plugin will automatically update the paths of the minified files after processing.

## 📝 How It Works

The EzMinify plugin automates the process of minifying and bundling JavaScript and CSS files in your Laravel + Vite project. Here's an overview of how it works:

### 1. **Input Files**
You define which files or directories should be processed by the plugin. The plugin supports both individual files and entire directories. It looks for files in the specified `input` paths.

### 2. **Minification & Merging**
- **Minification:** The plugin uses **esbuild** to minify JavaScript and CSS files. This reduces file size and improves page load times.
- **Merging:** If multiple files are found in the specified `input` paths, the plugin can merge them into a single minified file (either `.js` or `.css`), depending on your configuration.

### 3. **Directory Structure**
- You can choose to either **maintain the directory structure** in the output (keeping files organized by their original paths) or **flatten the output** (putting all files into a single directory).
- The plugin automatically handles subdirectories.

### 4. **Manifest Update**
EzMinify will check if a `manifest.json` exists in your Laravel project (typically found in `public/build`). After minifying and bundling the files, the plugin updates the `manifest.json` with the new paths to the minified files. This ensures that Laravel can reference the correct files when loading assets in the frontend.

### 5. **File Copying**
For non-JS/CSS files (like images, fonts, etc.), the plugin will copy the files to the output directory without any modifications.

### 6. **Custom Configuration**
The plugin allows for extensive customization, including:
- Specifying custom input and output paths.
- Enabling or disabling file merging.
- Choosing whether to keep the directory structure or flatten it.

This ensures the plugin fits seamlessly into your existing Laravel + Vite project structure.

## 💡 Using Minified Assets in Blade

Once you've configured and built your assets using the EzMinify plugin, you can easily reference the minified files in your Laravel Blade templates with the `@vite` directive.

Laravel's Vite integration allows you to reference assets directly in your Blade views, and the EzMinify plugin automatically updates the `manifest.json` file with the correct paths to the minified assets.

### Example:

In your Blade file (e.g., `resources/views/layouts/app.blade.php`), you can include the minified JavaScript and CSS files like this:

```blade
<head>
    <!-- Minified CSS -->
    @vite('resources/css/app.css')

    <!-- Minified JS -->
    @vite('resources/js/app.js')
</head>



## 📝 Notes

- **Manifest Update**: The plugin automatically updates the `manifest.json` file in your Laravel project after minifying and bundling the files. The plugin will add entries for all processed files, ensuring that Laravel knows the location of the minified assets.

- **Keep Structure vs Flatten Output**:
    - **`keep_structure: true`** preserves the directory structure in the output, which is useful if you want to maintain the same folder hierarchy for your minified assets.
    - **`keep_structure: false`** flattens the directory structure and places all output files in the root of the specified `output` directory.

- **Merge Result**: If you set **`merge_result: true`**, multiple files (JS or CSS) within a directory are merged into a single file. If set to **false**, each file will be minified and output individually.

- **File Types Supported**: The plugin currently supports **JavaScript** (`.js`) and **CSS** (`.css`) file types for minification and merging.

- **File Extensions**:
    - Minified files will be saved with `.min.js` or `.min.css` extensions.
    - The plugin skips files that already have these extensions to prevent overwriting.

- **Error Handling**: The plugin provides basic error handling, logging useful messages to the console if something goes wrong while processing files.

## ✅ TODO

- [ ] name when keep structure!?
- [ ] refactors merge -> bundle ? keep_structure?


## 🤔 Maybe

- [ ] **Add support for additional file types**: Investigate if other assets like images and fonts can be minified or optimized.
- [ ] **Write unit tests**: Cover the main functionality (minification, merging, manifest update).
- [ ] **Optimize performance**: Look for opportunities to reduce execution time and improve resource usage.
- [ ] **Maybe add an option for custom file naming**: Allow users to define how output files are named beyond the default `.min.js`/`.min.css`.
- [ ] **Maybe implement source maps**: Consider adding support for source maps to make debugging easier in production.
- [ ] **Maybe add more logging options**: Allow users to configure the verbosity of log output for easier debugging.