import { readFileSync } from "fs";
import { load } from "js-yaml";

/**
 * Reads a YAML file and returns it as a JavaScript object.
 * @param file
 * @returns
 */
export function readYaml(file: string) {
  return load(readFileSync(file, "utf8"));
}
