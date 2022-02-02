import AdmZip from 'adm-zip';
import boxen from 'boxen';
import fs from 'fs';
import ora from 'ora';
import { join } from 'path';
import { table } from 'table';

import cfg from '@cfg';

/**
 * Inits .autograders directory.
 */
export function init() {
  const path = join(process.cwd(), cfg.dir);
  const config = join(path, 'config.json');

  if (!fs.existsSync(path) || !fs.existsSync(config)) {
    title('Oops... autograder not configured !');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(config, 'utf-8'));

  if (!data.assignmentId) {
    title('Oops... autograder not configured (assignment) !');
    process.exit(1);
  }

  if (!data.files || typeof data.files !== 'object' || !data.files?.length) {
    title('Oops... autograder not configured (files) !');
    process.exit(1);
  }
}

/**
 * Gets autograder configuration.
 *
 * @returns Autograder configuration object.
 */
export function getConfig() {
  const path = join(process.cwd(), cfg.dir, 'config.json');
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

/**
 * Saves authentication token in .autograders directory.
 *
 * @param token - JWT Token.
 */
export function saveToken(token: string) {
  const path = join(process.cwd(), cfg.dir, 'token');
  fs.writeFileSync(path, token, 'utf-8');
}

/**
 * Gets authentication token from .autograders directory.
 *
 * @returns JWT Token.
 */
export function getToken() {
  const path = join(process.cwd(), cfg.dir, 'token');
  if (!fs.existsSync(path)) return '';
  return fs.readFileSync(path, 'utf-8');
}

/**
 * Zips autograder files.
 */
export function zipFiles() {
  const output = join(process.cwd(), cfg.dir, 'submit.zip');
  const spinner = ora({ text: 'Zipping files...', color: 'yellow' });
  spinner.start();

  try {
    const config = getConfig();
    const files: string[] = config.files;
    const zip = new AdmZip();

    files.forEach((file) => {
      if (!fs.existsSync(join(process.cwd(), file))) {
        spinner.fail(`File "${file}" does not exist.`);
        process.exit(1);
      }
      zip.addLocalFile(file);
    });

    zip.writeZip(output);
    const result = fs.createReadStream(output);
    spinner.succeed('Files zipped');
    return result;
  } catch (error) {
    spinner.fail('Could not zip files');
    process.exit(1);
  }
}

/**
 * Prints autograder title.
 *
 * @param title - Title to print.
 */
export function title(title: string) {
  console.log();
  console.log(
    boxen(title, {
      title: 'Autograders',
      titleAlignment: 'center',
      textAlignment: 'center',
      padding: 1,
      borderStyle: 'round'
    })
  );
  console.log();
}

export function box(title: string, data: string) {
  return boxen(data, {
    title,
    titleAlignment: 'center',
    textAlignment: 'center',
    padding: 1,
    borderStyle: 'round'
  });
}

/**
 * Converts a record to a printable table.
 *
 * @param data - Data to convert to table.
 * @returns Printable table.
 */
export function toTable(data: Record<string, any>) {
  return table(Object.keys(data).map((key) => [key, data[key]]));
}
