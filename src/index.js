import path from 'path';
import fs from 'fs-extra';
import {transform} from 'esbuild';
import chalk from 'chalk';

const LaravelPath = process.cwd();

function getMinifiedFilename(file) {
    if (file.endsWith('.js') && !file.endsWith('.min.js')) {
        return file.replace('.js', '.min.js');
    }

    if (file.endsWith('.css') && !file.endsWith('.min.css')) {
        return file.replace('.css', '.min.css');
    }

    return file;
}

async function writeMergedFile(outputPath, fileName, codeArray, fileType, sourcePath) {
    const mergedFilePath = path.join(outputPath, fileName);
    await fs.outputFile(mergedFilePath, codeArray.join('\n'));
    console.log(
        chalk.green(`Merged ${fileType}:`) +
        ` ${chalk.bold(fileName)} ${chalk.yellow('->')} ${chalk.cyan(
            path.relative(path.resolve(LaravelPath, 'public/build'), mergedFilePath)
        )}`
    );
    return {src: sourcePath, output: mergedFilePath};
}

async function copyNonJsCssFile(sourceFilePath, destFilePath) {
    await fs.copy(sourceFilePath, destFilePath);
    console.log(
        chalk.gray(`Copied file:`) +
        ` ${chalk.bold(path.basename(sourceFilePath))} ${chalk.yellow('->')} ${chalk.cyan(path.relative(path.resolve(LaravelPath, 'public/build'), destFilePath))}`
    );
    return {src: sourceFilePath, output: destFilePath, code: null};
}

async function minifyFiles(sourcePath, outputPath, mergeResult = false, keepStructure = true, depth = 0) {
    const stats = await fs.stat(sourcePath);
    const writtenFilePaths = {
        output: [],
        mergedJsCode: [],
        mergedCssCode: [],
    };

    if (!stats.isDirectory()) {
        const file = path.join(outputPath, path.basename(sourcePath));
        const destFileName = getMinifiedFilename(file);
        return {output: [await processFile(sourcePath, destFileName, mergeResult)]};
    }

    const files = await fs.readdir(sourcePath);

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const destFileName = getMinifiedFilename(file);
        const destFilePath = path.join(outputPath, destFileName);

        try {
            const stats = await fs.stat(sourceFilePath);

            if (!stats.isDirectory()) {
                const fileStats = await processFile(sourceFilePath, destFilePath, mergeResult);
                if (!mergeResult) {
                    writtenFilePaths.output.push(fileStats);
                    continue;
                }
                if (fileStats.output.endsWith('.js')) {
                    writtenFilePaths.mergedJsCode.push(`/** ${path.relative(LaravelPath, sourceFilePath)} **/\n${fileStats.code}`);
                } else if (fileStats.output.endsWith('.css')) {
                    writtenFilePaths.mergedCssCode.push(`/** ${path.relative(LaravelPath, sourceFilePath)} **/\n${fileStats.code}`);
                }
                continue;
            }

            const subDestPath = path.join(outputPath, file);
            const subWrittenFiles = await minifyFiles(sourceFilePath, subDestPath, mergeResult, keepStructure, depth + 1);
            if (!mergeResult) {
                writtenFilePaths.output.push(...subWrittenFiles.output);
                continue;
            }
            writtenFilePaths.mergedJsCode.push(...subWrittenFiles.mergedJsCode);
            writtenFilePaths.mergedCssCode.push(...subWrittenFiles.mergedCssCode);
        } catch (error) {
            console.error(chalk.red(`Error processing file ${chalk.bold(file)}:`), error);
        }
    }

    if (!keepStructure && depth > 0) {
        return writtenFilePaths;
    }

    if (writtenFilePaths.mergedJsCode.length > 0) {
        const mergedJsName = depth === 0
            ? `${path.basename(sourcePath)}.min.js`
            : `${path.basename(outputPath)}.min.js`;
        const outputDir = depth === 0 ? path.dirname(outputPath) : path.dirname(outputPath);
        writtenFilePaths.output.push(await writeMergedFile(outputDir, mergedJsName, writtenFilePaths.mergedJsCode, 'JS', sourcePath));
        writtenFilePaths.mergedJsCode = [];
    }

    if (writtenFilePaths.mergedCssCode.length > 0) {
        const mergedCssName = depth === 0
            ? `${path.basename(sourcePath)}.min.css`
            : `${path.basename(outputPath)}.min.css`;
        const outputDir = depth === 0 ? path.dirname(outputPath) : path.dirname(outputPath);
        writtenFilePaths.output.push(await writeMergedFile(outputDir, mergedCssName, writtenFilePaths.mergedCssCode, 'CSS', sourcePath));
        writtenFilePaths.mergedCssCode = [];
    }

    return writtenFilePaths;
}

async function processFile(sourceFilePath, destFilePath, mergeResult) {
    const ext = path.extname(sourceFilePath);
    let code = '';

    if (ext === '.js' && !sourceFilePath.endsWith('.min.js')) {
        const jsCode = await fs.readFile(sourceFilePath, 'utf-8');
        const result = await transform(jsCode, {minify: true, target: 'es2020'});
        code = result.code;
        if (!mergeResult) {
            await fs.outputFile(destFilePath, code);
            console.log(chalk.green(`Minified JS:`) + ` ${chalk.bold(path.basename(sourceFilePath))} ${chalk.yellow('->')} ${chalk.cyan(path.relative(path.resolve(LaravelPath, 'public/build'), destFilePath))}`);
        }
        return {src: sourceFilePath, output: destFilePath, code};
    }

    if (ext === '.css' && !sourceFilePath.endsWith('.min.css')) {
        const cssCode = await fs.readFile(sourceFilePath, 'utf-8');
        const result = await transform(cssCode, {minify: true, loader: 'css'});
        code = result.code;
        if (!mergeResult) {
            await fs.outputFile(destFilePath, code);
            console.log(chalk.blue(`Minified CSS:`) + ` ${chalk.bold(path.basename(sourceFilePath))} ${chalk.yellow('->')} ${chalk.cyan(path.relative(path.resolve(LaravelPath, 'public/build'), destFilePath))}`);
        }
        return {src: sourceFilePath, output: destFilePath, code};
    }

    return await copyNonJsCssFile(sourceFilePath, destFilePath);
}

const EzMinify = (options = {}) => {
    const {input = [], manifestPath = 'public/build/manifest.json'} = options;

    if (input.length === 0) {
        console.warn(chalk.yellow('No input directories specified. Please provide input paths in plugin options.'));
        return;
    }

    return {
        name: 'ez-vanilla-minify-plugin-for-laravel-vite',

        async closeBundle() {
            const manifestFilePath = path.resolve(LaravelPath, manifestPath);
            console.log(chalk.yellow('Looking for manifest.json at:'), chalk.green(manifestFilePath));

            try {
                if (!await fs.pathExists(manifestFilePath)) {
                    console.error(chalk.red(`Manifest not found at ${chalk.bold(manifestFilePath)}. Ensure the build process is complete.`));
                    return;
                }

                const manifest = await fs.readJson(manifestFilePath);
                console.log(chalk.green('Manifest found, updating with new entries...'));

                for (let {
                    src,
                    output = 'public/build/assets',
                    keep_structure = true,
                    merge_result = false
                } of input) {
                    const sourcePath = path.resolve(LaravelPath, src);
                    const outputPath = path.resolve(LaravelPath, output);

                    try {
                        await fs.access(sourcePath, fs.constants.F_OK);
                    } catch (error) {
                        console.error(chalk.red(`Source path does not exist or is inaccessible: ${chalk.bold(sourcePath)}`), error);
                        continue;
                    }

                    const writtenFilePaths = await minifyFiles(sourcePath, outputPath, merge_result, keep_structure);

                    writtenFilePaths.output.forEach(filePath => {
                        const relativeInput = path.relative(LaravelPath, filePath.src).replace(/\\/g, '/');
                        const relativeOutput = path.relative('public/build', filePath.output).replace(/\\/g, '/');

                        manifest[relativeInput] = {
                            file: relativeOutput,
                            src: relativeInput,
                            isEntry: true,
                        };
                    });

                    await fs.writeJson(manifestFilePath, manifest, {spaces: 2});
                    console.log(chalk.green('Manifest updated successfully with new entries.'));
                }
            } catch (error) {
                console.error(chalk.red('Error updating the manifest:'), error);
            }
        },
    };
};

export default EzMinify;
