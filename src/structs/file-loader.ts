import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export class FileLoader {
	public loadFiles(path: string, recursive = true) {
		return readdirSync(path, { withFileTypes: true, recursive })
			.filter(d => d.isFile() && this.isSourceFile(d.name))
			.map(d => this.toFilePath(join(d.parentPath, d.name)));
	}

	public loadDirectFiles(path: string) {
		return readdirSync(path, { withFileTypes: true })
			.filter(d => d.isFile() && this.isSourceFile(d.name))
			.map(d => this.toFilePath(join(d.parentPath, d.name)));
	}

	public loadDirectDirectories(path: string) {
		return readdirSync(path, { withFileTypes: true })
			.filter(d => d.isDirectory())
			.map(d => this.toFilePath(join(d.parentPath, d.name)));
	}

	public getCommandRoots(path: string) {
		const indexDirectories = this.loadFiles(path)
			.filter(file => this.isIndexFile(file))
			.map(file => dirname(file));

		return indexDirectories.filter(directory => {
			return !indexDirectories.some(candidate => candidate !== directory && this.isInsidePath(directory, candidate));
		});
	}

	public getIndexFile(path: string) {
		const indexFiles = ["index.ts", "index.js"].map(file => join(path, file));
		return indexFiles.find(file => existsSync(file));
	}

	public isIndexFile(path: string) {
		return basename(path, extname(path)) === "index";
	}

	public isInsidePath(path: string, parent: string) {
		const pathRelativeToParent = relative(parent, path);
		return Boolean(pathRelativeToParent) && !pathRelativeToParent.startsWith("..") && !pathRelativeToParent.startsWith("/");
	}

	public async importDefault<T>(path: string) {
		const { default: value } = await import(path) as { default: T };
		return value;
	}

	private isSourceFile(name: string) {
		return !name.endsWith(".d.ts") && (name.endsWith(".js") || name.endsWith(".ts"));
	}

	private toFilePath(path: string) {
		return fileURLToPath(pathToFileURL(path));
	}
}
